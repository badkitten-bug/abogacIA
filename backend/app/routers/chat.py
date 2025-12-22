"""
Router de chat.
Endpoints para conversación con el asistente legal.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional, List
import uuid

from ..database import get_db
from ..models.user import User
from ..schemas.chat import (
    ChatRequest, ChatResponse, ChatSessionResponse, 
    ChatSessionWithMessages, FeedbackRequest
)
from ..services.auth import get_current_user
from ..rag.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    x_session_token: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Envía mensaje al asistente legal (sin autenticación).
    Usa X-Session-Token header para mantener sesión.
    """
    # Generar token de sesión si no existe
    session_token = x_session_token
    if not session_token and not request.session_id:
        session_token = str(uuid.uuid4())
    
    response = await ChatService.process_message(
        db=db,
        request=request,
        user=None,
        session_token=session_token
    )
    
    return response


@router.post("/authenticated", response_model=ChatResponse)
async def send_message_authenticated(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Envía mensaje al asistente legal (autenticado).
    """
    response = await ChatService.process_message(
        db=db,
        request=request,
        user=current_user
    )
    
    return response


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def get_user_sessions(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene historial de sesiones del usuario.
    """
    sessions = ChatService.get_user_sessions(db, current_user, limit)
    return sessions


@router.get("/sessions/{session_id}", response_model=ChatSessionWithMessages)
async def get_session_history(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene una sesión con todos sus mensajes.
    """
    session = ChatService.get_session_history(db, session_id, current_user)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesión no encontrada"
        )
    
    return session


@router.post("/feedback")
async def submit_feedback(
    request: FeedbackRequest,
    db: Session = Depends(get_db)
):
    """
    Envía feedback sobre una respuesta del asistente.
    """
    success = ChatService.submit_feedback(db, request.message_id, request.is_helpful)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mensaje no encontrado"
        )
    
    return {"message": "Feedback registrado", "message_id": request.message_id}


@router.get("/categories")
async def get_chat_categories():
    """
    Lista categorías disponibles para el chat (especialidades legales).
    """
    from ..models.legal_content import ContentCategory
    
    return [
        {"value": cat.value, "label": cat.name.replace("_", " ").title(), "icon": _get_category_icon(cat.value)}
        for cat in ContentCategory
    ]


def _get_category_icon(category: str) -> str:
    """Retorna emoji para cada categoría."""
    icons = {
        "civil": "⚖️",
        "penal": "🔒",
        "laboral": "💼",
        "tributario": "💰",
        "constitucional": "📜",
        "administrativo": "🏛️",
        "comercial": "🏪",
        "familia": "👨‍👩‍👧‍👦",
        "procesal": "📋",
        "notarial": "✍️",
        "registral": "📁",
        "ambiental": "🌿",
        "migratorio": "✈️",
        "consumidor": "🛒"
    }
    return icons.get(category, "📚")
