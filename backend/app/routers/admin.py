"""
Router de administración.
Dashboard y utilidades para admins.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models.user import User, UserRole
from ..models.legal_content import LegalContent
from ..models.lawyer import Lawyer, LawFirm
from ..models.chat import ChatSession, ChatMessage
from ..services.auth import get_current_admin
from ..services.user import UserService
from ..rag.retriever import rag_retriever

router = APIRouter(prefix="/admin", tags=["Administración"])


@router.get("/dashboard")
async def get_dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """
    Obtiene estadísticas del dashboard administrativo.
    """
    # Contenido legal
    total_content = db.query(LegalContent).filter(LegalContent.is_active == True).count()
    indexed_content = db.query(LegalContent).filter(
        LegalContent.is_active == True,
        LegalContent.is_indexed == True
    ).count()
    
    # Usuarios
    total_users = db.query(User).filter(User.is_active == True).count()
    admin_users = db.query(User).filter(
        User.is_active == True,
        User.role == UserRole.ADMIN
    ).count()
    
    # Directorio
    total_lawyers = db.query(Lawyer).filter(Lawyer.is_active == True).count()
    verified_lawyers = db.query(Lawyer).filter(
        Lawyer.is_active == True,
        Lawyer.is_verified == True
    ).count()
    
    total_firms = db.query(LawFirm).filter(LawFirm.is_active == True).count()
    
    # Chat
    total_sessions = db.query(ChatSession).count()
    total_messages = db.query(ChatMessage).count()
    
    # Vector store stats
    vector_stats = rag_retriever.get_stats()
    
    return {
        "content": {
            "total": total_content,
            "indexed": indexed_content,
            "pending": total_content - indexed_content
        },
        "users": {
            "total": total_users,
            "admins": admin_users
        },
        "directory": {
            "lawyers": total_lawyers,
            "verified_lawyers": verified_lawyers,
            "law_firms": total_firms
        },
        "chat": {
            "sessions": total_sessions,
            "messages": total_messages
        },
        "vector_store": vector_stats
    }


@router.post("/create-admin")
async def create_admin_user(
    email: str,
    password: str,
    full_name: str,
    db: Session = Depends(get_db)
):
    """
    Crea un usuario administrador.
    NOTA: En producción, proteger este endpoint o eliminar.
    """
    # Verificar si ya existe un admin
    existing_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
    
    # Solo permitir si no hay admins (setup inicial) o si el caller es admin
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ya existe un administrador. Use el panel de admin para crear más."
        )
    
    user = UserService.create_admin(db, email, password, full_name)
    
    return {
        "message": "Administrador creado exitosamente",
        "user_id": user.id,
        "email": user.email
    }


@router.get("/users")
async def list_users(
    role: UserRole = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """
    Lista todos los usuarios.
    """
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    users = query.offset(skip).limit(limit).all()
    
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role.value,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "last_login": u.last_login
        }
        for u in users
    ]


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    new_role: UserRole,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Cambia el rol de un usuario.
    """
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes cambiar tu propio rol"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    user.role = new_role
    db.commit()
    
    return {"message": f"Rol actualizado a {new_role.value}", "user_id": user_id}


@router.post("/verify-lawyer/{lawyer_id}")
async def verify_lawyer(
    lawyer_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """
    Verifica un abogado en el directorio.
    """
    lawyer = db.query(Lawyer).filter(Lawyer.id == lawyer_id).first()
    if not lawyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Abogado no encontrado"
        )
    
    lawyer.is_verified = True
    db.commit()
    
    return {"message": "Abogado verificado", "lawyer_id": lawyer_id}


@router.post("/verify-firm/{firm_id}")
async def verify_law_firm(
    firm_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """
    Verifica un estudio jurídico en el directorio.
    """
    firm = db.query(LawFirm).filter(LawFirm.id == firm_id).first()
    if not firm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudio jurídico no encontrado"
        )
    
    firm.is_verified = True
    db.commit()
    
    return {"message": "Estudio verificado", "firm_id": firm_id}
