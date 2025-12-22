"""
Router para directorio de abogados y estudios jurídicos.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import math

from ..database import get_db
from ..models.lawyer import Lawyer, LawFirm
from ..models.user import User
from ..schemas.lawyer import (
    LawyerCreate, LawyerUpdate, LawyerResponse, LawyerListResponse,
    LawFirmCreate, LawFirmUpdate, LawFirmResponse
)
from ..services.auth import get_current_admin

router = APIRouter(prefix="/directorio", tags=["Directorio"])


# ==================== ABOGADOS ====================

@router.get("/abogados", response_model=LawyerListResponse)
async def list_lawyers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    specialty: Optional[str] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Lista abogados con paginación y filtros.
    """
    query = db.query(Lawyer).filter(
        Lawyer.is_active == True,
        Lawyer.is_verified == True
    )
    
    if specialty:
        query = query.filter(Lawyer.specialties.ilike(f"%{specialty}%"))
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Lawyer.full_name.ilike(search_term)) |
            (Lawyer.specialties.ilike(search_term)) |
            (Lawyer.colegiatura.ilike(search_term))
        )
    
    total = query.count()
    skip = (page - 1) * page_size
    items = query.offset(skip).limit(page_size).all()
    
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return LawyerListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/abogados/{lawyer_id}", response_model=LawyerResponse)
async def get_lawyer(
    lawyer_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene un abogado por ID.
    """
    lawyer = db.query(Lawyer).filter(
        Lawyer.id == lawyer_id,
        Lawyer.is_active == True
    ).first()
    
    if not lawyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Abogado no encontrado"
        )
    
    return lawyer


@router.post("/abogados", response_model=LawyerResponse, status_code=status.HTTP_201_CREATED)
async def create_lawyer(
    lawyer_data: LawyerCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """
    Crea un nuevo abogado en el directorio.
    Solo admin.
    """
    lawyer = Lawyer(**lawyer_data.model_dump(exclude={"law_firm_ids"}))
    
    # Asociar con estudios jurídicos
    if lawyer_data.law_firm_ids:
        firms = db.query(LawFirm).filter(LawFirm.id.in_(lawyer_data.law_firm_ids)).all()
        lawyer.law_firms = firms
    
    db.add(lawyer)
    db.commit()
    db.refresh(lawyer)
    
    return lawyer


@router.put("/abogados/{lawyer_id}", response_model=LawyerResponse)
async def update_lawyer(
    lawyer_id: int,
    lawyer_data: LawyerUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """
    Actualiza un abogado.
    Solo admin.
    """
    lawyer = db.query(Lawyer).filter(Lawyer.id == lawyer_id).first()
    
    if not lawyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Abogado no encontrado"
        )
    
    update_data = lawyer_data.model_dump(exclude_unset=True, exclude={"law_firm_ids"})
    for field, value in update_data.items():
        setattr(lawyer, field, value)
    
    if lawyer_data.law_firm_ids is not None:
        firms = db.query(LawFirm).filter(LawFirm.id.in_(lawyer_data.law_firm_ids)).all()
        lawyer.law_firms = firms
    
    db.commit()
    db.refresh(lawyer)
    
    return lawyer


@router.delete("/abogados/{lawyer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lawyer(
    lawyer_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """
    Elimina un abogado (soft delete).
    Solo admin.
    """
    lawyer = db.query(Lawyer).filter(Lawyer.id == lawyer_id).first()
    
    if not lawyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Abogado no encontrado"
        )
    
    lawyer.is_active = False
    db.commit()


# ==================== ESTUDIOS JURÍDICOS ====================

@router.get("/estudios", response_model=List[LawFirmResponse])
async def list_law_firms(
    specialty: Optional[str] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Lista estudios jurídicos.
    """
    query = db.query(LawFirm).filter(
        LawFirm.is_active == True,
        LawFirm.is_verified == True
    )
    
    if specialty:
        query = query.filter(LawFirm.specialties.ilike(f"%{specialty}%"))
    
    if city:
        query = query.filter(LawFirm.city.ilike(f"%{city}%"))
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (LawFirm.name.ilike(search_term)) |
            (LawFirm.specialties.ilike(search_term))
        )
    
    return query.all()


@router.get("/estudios/{firm_id}", response_model=LawFirmResponse)
async def get_law_firm(
    firm_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene un estudio jurídico por ID.
    """
    firm = db.query(LawFirm).filter(
        LawFirm.id == firm_id,
        LawFirm.is_active == True
    ).first()
    
    if not firm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudio jurídico no encontrado"
        )
    
    return firm


@router.post("/estudios", response_model=LawFirmResponse, status_code=status.HTTP_201_CREATED)
async def create_law_firm(
    firm_data: LawFirmCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """
    Crea un nuevo estudio jurídico.
    Solo admin.
    """
    firm = LawFirm(**firm_data.model_dump())
    db.add(firm)
    db.commit()
    db.refresh(firm)
    
    return firm


@router.put("/estudios/{firm_id}", response_model=LawFirmResponse)
async def update_law_firm(
    firm_id: int,
    firm_data: LawFirmUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """
    Actualiza un estudio jurídico.
    Solo admin.
    """
    firm = db.query(LawFirm).filter(LawFirm.id == firm_id).first()
    
    if not firm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudio jurídico no encontrado"
        )
    
    update_data = firm_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(firm, field, value)
    
    db.commit()
    db.refresh(firm)
    
    return firm


@router.delete("/estudios/{firm_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_law_firm(
    firm_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """
    Elimina un estudio jurídico (soft delete).
    Solo admin.
    """
    firm = db.query(LawFirm).filter(LawFirm.id == firm_id).first()
    
    if not firm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudio jurídico no encontrado"
        )
    
    firm.is_active = False
    db.commit()


# ==================== ESPECIALIDADES ====================

@router.get("/especialidades")
async def get_specialties():
    """
    Lista especialidades legales comunes.
    """
    return [
        {"value": "civil", "label": "Derecho Civil"},
        {"value": "penal", "label": "Derecho Penal"},
        {"value": "laboral", "label": "Derecho Laboral"},
        {"value": "familia", "label": "Derecho de Familia"},
        {"value": "tributario", "label": "Derecho Tributario"},
        {"value": "comercial", "label": "Derecho Comercial"},
        {"value": "corporativo", "label": "Derecho Corporativo"},
        {"value": "inmobiliario", "label": "Derecho Inmobiliario"},
        {"value": "migratorio", "label": "Derecho Migratorio"},
        {"value": "ambiental", "label": "Derecho Ambiental"},
        {"value": "propiedad_intelectual", "label": "Propiedad Intelectual"},
        {"value": "notarial", "label": "Derecho Notarial"},
        {"value": "registral", "label": "Derecho Registral"},
        {"value": "administrativo", "label": "Derecho Administrativo"},
        {"value": "constitucional", "label": "Derecho Constitucional"}
    ]
