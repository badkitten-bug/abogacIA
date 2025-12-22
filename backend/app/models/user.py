"""
Modelo de Usuario para autenticación y roles.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base


class UserRole(str, enum.Enum):
    """Roles de usuario en el sistema."""
    ADMIN = "admin"         # Puede subir contenido legal
    ABOGADO = "abogado"     # Abogado registrado en directorio
    USER = "user"           # Usuario público del chat


class User(Base):
    """
    Modelo de usuario del sistema.
    Soporta admins (para subir leyes), abogados (directorio) y usuarios públicos.
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    
    # Estado
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relaciones
    legal_contents = relationship("LegalContent", back_populates="created_by_user")
    chat_sessions = relationship("ChatSession", back_populates="user")
    
    def __repr__(self):
        return f"<User {self.email} ({self.role.value})>"
