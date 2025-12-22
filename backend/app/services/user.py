"""
Servicio para gestión de usuarios.
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime

from ..models.user import User, UserRole
from ..schemas.user import UserCreate, UserUpdate
from .auth import AuthService


class UserService:
    """Servicio de gestión de usuarios."""
    
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        """Obtiene usuario por ID."""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """Obtiene usuario por email."""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        role: Optional[UserRole] = None
    ) -> List[User]:
        """Obtiene lista de usuarios con filtros."""
        query = db.query(User)
        
        if role:
            query = query.filter(User.role == role)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def create(db: Session, user_data: UserCreate) -> User:
        """Crea nuevo usuario."""
        # Verificar si email ya existe
        existing = UserService.get_by_email(db, user_data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
        
        # Crear usuario
        hashed_password = AuthService.get_password_hash(user_data.password)
        user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            role=user_data.role
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    def update(db: Session, user_id: int, user_data: UserUpdate) -> User:
        """Actualiza usuario existente."""
        user = UserService.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        update_data = user_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    def update_last_login(db: Session, user: User) -> None:
        """Actualiza fecha de último login."""
        user.last_login = datetime.utcnow()
        db.commit()
    
    @staticmethod
    def delete(db: Session, user_id: int) -> bool:
        """Elimina usuario (soft delete)."""
        user = UserService.get_by_id(db, user_id)
        if not user:
            return False
        
        user.is_active = False
        db.commit()
        return True
    
    @staticmethod
    def create_admin(db: Session, email: str, password: str, full_name: str) -> User:
        """Crea usuario administrador."""
        user_data = UserCreate(
            email=email,
            password=password,
            full_name=full_name,
            role=UserRole.ADMIN
        )
        return UserService.create(db, user_data)
