"""
Modelos para contenido legal (leyes, artículos, códigos, etc.).
Este es el corazón de la base de conocimiento para el RAG.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from ..database import Base


class ContentCategory(str, enum.Enum):
    """Categorías de derecho disponibles."""
    CIVIL = "civil"
    PENAL = "penal"
    LABORAL = "laboral"
    TRIBUTARIO = "tributario"
    CONSTITUCIONAL = "constitucional"
    ADMINISTRATIVO = "administrativo"
    COMERCIAL = "comercial"
    FAMILIA = "familia"
    PROCESAL = "procesal"
    NOTARIAL = "notarial"
    REGISTRAL = "registral"
    AMBIENTAL = "ambiental"
    MIGRATORIO = "migratorio"
    CONSUMIDOR = "consumidor"


class ContentType(str, enum.Enum):
    """Tipos de contenido legal."""
    LEY = "ley"
    ARTICULO = "articulo"
    CODIGO = "codigo"
    DECRETO_SUPREMO = "decreto_supremo"
    DECRETO_LEGISLATIVO = "decreto_legislativo"
    DECRETO_LEY = "decreto_ley"
    RESOLUCION = "resolucion"
    JURISPRUDENCIA = "jurisprudencia"
    DOCTRINA = "doctrina"
    REGLAMENTO = "reglamento"
    ORDENANZA = "ordenanza"
    CONSTITUCION = "constitucion"


class LegalContent(Base):
    """
    Modelo principal para contenido legal.
    Almacena leyes, artículos, códigos, etc. que alimentan el RAG.
    """
    __tablename__ = "legal_contents"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Información básica
    title = Column(String(500), nullable=False, index=True)
    content = Column(Text, nullable=False)  # Texto completo de la ley/artículo
    summary = Column(Text, nullable=True)   # Resumen opcional
    
    # Clasificación
    category = Column(Enum(ContentCategory), nullable=False, index=True)
    content_type = Column(Enum(ContentType), nullable=False, index=True)
    
    # Identificación legal
    number = Column(String(100), nullable=True)  # Número de ley: "29783", "Art. 1969"
    source = Column(String(500), nullable=True)  # "Diario El Peruano", "Congreso"
    publication_date = Column(DateTime, nullable=True)
    effective_date = Column(DateTime, nullable=True)  # Fecha de entrada en vigencia
    
    # Estado
    is_active = Column(Boolean, default=True)  # False si está derogado
    is_indexed = Column(Boolean, default=False)  # True cuando está en ChromaDB
    
    # Metadatos
    keywords = Column(String(500), nullable=True)  # Palabras clave separadas por coma
    notes = Column(Text, nullable=True)  # Notas adicionales del admin
    
    # Auditoría
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    created_by_user = relationship("User", back_populates="legal_contents")
    chunks = relationship("ContentChunk", back_populates="legal_content", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<LegalContent {self.content_type.value}: {self.title[:50]}>"


class ContentChunk(Base):
    """
    Fragmentos de contenido para RAG.
    Cada LegalContent se divide en chunks para búsqueda semántica.
    """
    __tablename__ = "content_chunks"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Contenido del chunk
    chunk_text = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)  # Orden del chunk en el documento
    
    # Referencia al contenido original
    legal_content_id = Column(Integer, ForeignKey("legal_contents.id"), nullable=False)
    
    # ID en ChromaDB para referencia
    chroma_id = Column(String(100), nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relación
    legal_content = relationship("LegalContent", back_populates="chunks")
    
    def __repr__(self):
        return f"<ContentChunk {self.id} of LegalContent {self.legal_content_id}>"
