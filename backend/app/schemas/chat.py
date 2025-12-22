"""
Schemas Pydantic para chat y conversaciones.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from ..models.chat import MessageRole


class ChatRequest(BaseModel):
    """Schema para enviar mensaje al chat."""
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: Optional[int] = None  # Si es null, crea nueva sesión
    category: Optional[str] = None  # Especialidad legal seleccionada


class SourceReference(BaseModel):
    """Referencia a fuente legal."""
    id: int
    title: str
    content_type: str
    number: Optional[str] = None
    relevance_score: float


class ChatResponse(BaseModel):
    """Schema de respuesta del chat."""
    session_id: int
    message_id: int
    response: str
    sources: List[SourceReference] = []
    response_time_ms: int


class ChatMessageResponse(BaseModel):
    """Schema de respuesta para mensaje individual."""
    id: int
    role: MessageRole
    content: str
    sources: Optional[str] = None
    is_helpful: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ChatSessionResponse(BaseModel):
    """Schema de respuesta para sesión de chat."""
    id: int
    title: Optional[str] = None
    category: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages_count: Optional[int] = None
    
    class Config:
        from_attributes = True


class ChatSessionWithMessages(ChatSessionResponse):
    """Schema de sesión con todos los mensajes."""
    messages: List[ChatMessageResponse] = []


class FeedbackRequest(BaseModel):
    """Schema para feedback de mensaje."""
    message_id: int
    is_helpful: int = Field(..., ge=-1, le=1)  # -1, 0, or 1
