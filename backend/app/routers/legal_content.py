"""
Router para gestión de contenido legal.
CRUD de leyes, artículos, códigos, etc.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import math

from ..database import get_db
from ..models.user import User
from ..models.legal_content import ContentCategory, ContentType
from ..schemas.legal_content import (
    LegalContentCreate, LegalContentUpdate, LegalContentResponse,
    LegalContentListResponse, LegalContentStats
)
from ..services.auth import get_current_user, get_current_admin
from ..services.legal_content import LegalContentService
from ..rag.retriever import rag_retriever

router = APIRouter(prefix="/legal-content", tags=["Contenido Legal"])


@router.get("/", response_model=LegalContentListResponse)
async def list_legal_content(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[ContentCategory] = None,
    content_type: Optional[ContentType] = None,
    search: Optional[str] = None,
    is_indexed: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    Lista contenido legal con paginación y filtros.
    """
    skip = (page - 1) * page_size
    items, total = LegalContentService.get_all(
        db, skip, page_size, category, content_type, search, is_indexed
    )
    
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return LegalContentListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/stats", response_model=LegalContentStats)
async def get_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """
    Obtiene estadísticas de contenido legal.
    Solo admin.
    """
    return LegalContentService.get_stats(db)


@router.get("/categories")
async def get_categories():
    """
    Lista todas las categorías disponibles.
    """
    return [{"value": cat.value, "label": cat.name.replace("_", " ").title()} 
            for cat in ContentCategory]


@router.get("/types")
async def get_content_types():
    """
    Lista todos los tipos de contenido disponibles.
    """
    return [{"value": ct.value, "label": ct.name.replace("_", " ").title()} 
            for ct in ContentType]


@router.get("/{content_id}", response_model=LegalContentResponse)
async def get_legal_content(
    content_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene un contenido legal por ID.
    """
    content = LegalContentService.get_by_id(db, content_id)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contenido no encontrado"
        )
    return content


@router.post("/", response_model=LegalContentResponse, status_code=status.HTTP_201_CREATED)
async def create_legal_content(
    content_data: LegalContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Crea nuevo contenido legal.
    Solo admin.
    """
    content = LegalContentService.create(db, content_data, current_user)
    return content


@router.put("/{content_id}", response_model=LegalContentResponse)
async def update_legal_content(
    content_id: int,
    content_data: LegalContentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """
    Actualiza contenido legal existente.
    Solo admin.
    """
    content = LegalContentService.update(db, content_id, content_data)
    return content


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_legal_content(
    content_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """
    Elimina contenido legal (soft delete).
    Solo admin.
    """
    success = LegalContentService.delete(db, content_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contenido no encontrado"
        )


@router.post("/{content_id}/index", status_code=status.HTTP_200_OK)
async def index_legal_content(
    content_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """
    Indexa contenido legal en el vector store para RAG.
    Solo admin.
    """
    content = LegalContentService.get_by_id(db, content_id)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contenido no encontrado"
        )
    
    if content.is_indexed:
        return {"message": "Contenido ya está indexado", "content_id": content_id}
    
    # Indexar en ChromaDB
    chunk_ids = rag_retriever.index_content(db, content)
    
    # Marcar como indexado
    LegalContentService.mark_as_indexed(db, content_id, chunk_ids)
    
    return {
        "message": "Contenido indexado exitosamente",
        "content_id": content_id,
        "chunks_indexed": len(chunk_ids)
    }


@router.post("/index-all", status_code=status.HTTP_200_OK)
async def index_all_pending(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """
    Indexa todo el contenido pendiente de indexar.
    Solo admin.
    """
    items, _ = LegalContentService.get_all(db, is_indexed=False, limit=1000)
    
    indexed_count = 0
    for content in items:
        try:
            chunk_ids = rag_retriever.index_content(db, content)
            LegalContentService.mark_as_indexed(db, content.id, chunk_ids)
            indexed_count += 1
        except Exception as e:
            print(f"Error indexando contenido {content.id}: {e}")
    
    return {
        "message": f"Se indexaron {indexed_count} contenidos",
        "indexed_count": indexed_count,
        "total_pending": len(items)
    }
