"""
Schemas Pydantic para contenido legal.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from ..models.legal_content import ContentCategory, ContentType


# Re-export enums for convenience
ContentCategory = ContentCategory
ContentType = ContentType


class LegalContentBase(BaseModel):
    """Base para contenido legal."""
    title: str = Field(..., min_length=5, max_length=500)
    content: str = Field(..., min_length=10)
    summary: Optional[str] = None
    category: ContentCategory
    content_type: ContentType
    number: Optional[str] = Field(None, max_length=100)
    source: Optional[str] = Field(None, max_length=500)
    publication_date: Optional[datetime] = None
    effective_date: Optional[datetime] = None
    keywords: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None


class LegalContentCreate(LegalContentBase):
    """Schema para crear contenido legal."""
    pass


class LegalContentUpdate(BaseModel):
    """Schema para actualizar contenido legal."""
    title: Optional[str] = Field(None, min_length=5, max_length=500)
    content: Optional[str] = Field(None, min_length=10)
    summary: Optional[str] = None
    category: Optional[ContentCategory] = None
    content_type: Optional[ContentType] = None
    number: Optional[str] = None
    source: Optional[str] = None
    publication_date: Optional[datetime] = None
    effective_date: Optional[datetime] = None
    keywords: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class ContentChunkResponse(BaseModel):
    """Schema de respuesta para chunks."""
    id: int
    chunk_text: str
    chunk_index: int
    
    class Config:
        from_attributes = True


class LegalContentResponse(LegalContentBase):
    """Schema de respuesta para contenido legal."""
    id: int
    is_active: bool
    is_indexed: bool
    created_by: int
    created_at: datetime
    updated_at: datetime
    chunks_count: Optional[int] = None
    
    class Config:
        from_attributes = True


class LegalContentListResponse(BaseModel):
    """Schema para lista paginada de contenido legal."""
    items: List[LegalContentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class LegalContentStats(BaseModel):
    """Estadísticas de contenido legal."""
    total_contents: int
    by_category: dict
    by_type: dict
    indexed_count: int
    pending_index: int
