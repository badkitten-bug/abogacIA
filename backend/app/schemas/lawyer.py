"""
Schemas Pydantic para abogados y estudios jurídicos.
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


class LawFirmBase(BaseModel):
    """Base para estudios jurídicos."""
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    logo_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    specialties: Optional[str] = None  # Separadas por coma


class LawFirmCreate(LawFirmBase):
    """Schema para crear estudio jurídico."""
    pass


class LawFirmUpdate(BaseModel):
    """Schema para actualizar estudio jurídico."""
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    specialties: Optional[str] = None
    is_active: Optional[bool] = None


class LawFirmResponse(LawFirmBase):
    """Schema de respuesta para estudio jurídico."""
    id: int
    is_verified: bool
    is_active: bool
    created_at: datetime
    lawyers_count: Optional[int] = None
    
    class Config:
        from_attributes = True


class LawyerBase(BaseModel):
    """Base para abogados."""
    full_name: str = Field(..., min_length=2, max_length=255)
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    colegiatura: Optional[str] = None
    colegio: Optional[str] = None
    years_experience: Optional[int] = Field(None, ge=0, le=70)
    specialties: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    linkedin: Optional[str] = None
    references: Optional[str] = None  # JSON string
    hourly_rate: Optional[str] = None
    offers_free_consultation: bool = False


class LawyerCreate(LawyerBase):
    """Schema para crear abogado."""
    law_firm_ids: Optional[List[int]] = None  # IDs de estudios asociados


class LawyerUpdate(BaseModel):
    """Schema para actualizar abogado."""
    full_name: Optional[str] = None
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    colegiatura: Optional[str] = None
    colegio: Optional[str] = None
    years_experience: Optional[int] = None
    specialties: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    linkedin: Optional[str] = None
    references: Optional[str] = None
    hourly_rate: Optional[str] = None
    offers_free_consultation: Optional[bool] = None
    is_available: Optional[bool] = None
    law_firm_ids: Optional[List[int]] = None


class LawyerResponse(LawyerBase):
    """Schema de respuesta para abogado."""
    id: int
    is_verified: bool
    is_active: bool
    is_available: bool
    created_at: datetime
    law_firms: Optional[List[LawFirmResponse]] = None
    
    class Config:
        from_attributes = True


class LawyerListResponse(BaseModel):
    """Schema para lista paginada de abogados."""
    items: List[LawyerResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
