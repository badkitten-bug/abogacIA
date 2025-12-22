"""
Modelos para chat y sesiones de conversación.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base


class MessageRole(str, enum.Enum):
    """Rol del mensaje en la conversación."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatSession(Base):
    """
    Sesión de chat de un usuario.
    Agrupa mensajes de una conversación.
    """
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Usuario (puede ser null para usuarios anónimos)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Identificador de sesión para usuarios anónimos
    session_token = Column(String(100), nullable=True, index=True)
    
    # Metadata
    title = Column(String(255), nullable=True)  # Título auto-generado de la conversación
    category = Column(String(50), nullable=True)  # Especialidad seleccionada
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<ChatSession {self.id}>"


class ChatMessage(Base):
    """
    Mensaje individual en una sesión de chat.
    """
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Sesión a la que pertenece
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    
    # Contenido
    role = Column(Enum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    
    # Fuentes citadas (JSON con referencias a LegalContent)
    sources = Column(Text, nullable=True)
    
    # Feedback del usuario
    is_helpful = Column(Integer, nullable=True)  # 1 = útil, -1 = no útil, null = sin feedback
    
    # Metadata
    tokens_used = Column(Integer, nullable=True)  # Tokens consumidos por esta respuesta
    response_time_ms = Column(Integer, nullable=True)  # Tiempo de respuesta en ms
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relación
    session = relationship("ChatSession", back_populates="messages")
    
    def __repr__(self):
        return f"<ChatMessage {self.role.value}: {self.content[:30]}...>"
