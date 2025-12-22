"""
Servicio para gestión de contenido legal.
Incluye indexación para RAG.
"""
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
import math

from ..models.legal_content import LegalContent, ContentChunk, ContentCategory, ContentType
from ..models.user import User
from ..schemas.legal_content import (
    LegalContentCreate, LegalContentUpdate, 
    LegalContentStats, LegalContentListResponse
)


class LegalContentService:
    """Servicio de gestión de contenido legal."""
    
    # Tamaño de chunks para RAG (en caracteres)
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200
    
    @staticmethod
    def get_by_id(db: Session, content_id: int) -> Optional[LegalContent]:
        """Obtiene contenido por ID."""
        return db.query(LegalContent).filter(LegalContent.id == content_id).first()
    
    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        category: Optional[ContentCategory] = None,
        content_type: Optional[ContentType] = None,
        search: Optional[str] = None,
        is_indexed: Optional[bool] = None
    ) -> Tuple[List[LegalContent], int]:
        """
        Obtiene lista paginada de contenido legal con filtros.
        Retorna (items, total).
        """
        query = db.query(LegalContent).filter(LegalContent.is_active == True)
        
        if category:
            query = query.filter(LegalContent.category == category)
        
        if content_type:
            query = query.filter(LegalContent.content_type == content_type)
        
        if is_indexed is not None:
            query = query.filter(LegalContent.is_indexed == is_indexed)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (LegalContent.title.ilike(search_term)) |
                (LegalContent.content.ilike(search_term)) |
                (LegalContent.keywords.ilike(search_term))
            )
        
        total = query.count()
        items = query.order_by(LegalContent.created_at.desc()).offset(skip).limit(limit).all()
        
        return items, total
    
    @staticmethod
    def create(
        db: Session,
        content_data: LegalContentCreate,
        user: User
    ) -> LegalContent:
        """Crea nuevo contenido legal."""
        content = LegalContent(
            **content_data.model_dump(),
            created_by=user.id
        )
        
        db.add(content)
        db.commit()
        db.refresh(content)
        
        # Crear chunks para RAG
        LegalContentService._create_chunks(db, content)
        
        return content
    
    @staticmethod
    def update(
        db: Session,
        content_id: int,
        content_data: LegalContentUpdate
    ) -> LegalContent:
        """Actualiza contenido legal existente."""
        content = LegalContentService.get_by_id(db, content_id)
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contenido no encontrado"
            )
        
        update_data = content_data.model_dump(exclude_unset=True)
        content_changed = 'content' in update_data
        
        for field, value in update_data.items():
            setattr(content, field, value)
        
        # Si cambió el contenido, recrear chunks
        if content_changed:
            content.is_indexed = False
            LegalContentService._delete_chunks(db, content)
            LegalContentService._create_chunks(db, content)
        
        db.commit()
        db.refresh(content)
        
        return content
    
    @staticmethod
    def delete(db: Session, content_id: int) -> bool:
        """Elimina contenido legal (soft delete)."""
        content = LegalContentService.get_by_id(db, content_id)
        if not content:
            return False
        
        content.is_active = False
        db.commit()
        return True
    
    @staticmethod
    def get_stats(db: Session) -> LegalContentStats:
        """Obtiene estadísticas de contenido legal."""
        total = db.query(LegalContent).filter(LegalContent.is_active == True).count()
        
        # Por categoría
        by_category = {}
        category_counts = db.query(
            LegalContent.category,
            func.count(LegalContent.id)
        ).filter(LegalContent.is_active == True).group_by(LegalContent.category).all()
        
        for cat, count in category_counts:
            by_category[cat.value] = count
        
        # Por tipo
        by_type = {}
        type_counts = db.query(
            LegalContent.content_type,
            func.count(LegalContent.id)
        ).filter(LegalContent.is_active == True).group_by(LegalContent.content_type).all()
        
        for ctype, count in type_counts:
            by_type[ctype.value] = count
        
        # Indexados vs pendientes
        indexed = db.query(LegalContent).filter(
            LegalContent.is_active == True,
            LegalContent.is_indexed == True
        ).count()
        
        return LegalContentStats(
            total_contents=total,
            by_category=by_category,
            by_type=by_type,
            indexed_count=indexed,
            pending_index=total - indexed
        )
    
    @staticmethod
    def _create_chunks(db: Session, content: LegalContent) -> None:
        """Divide el contenido en chunks para RAG."""
        text = content.content
        chunks = []
        
        # Dividir texto en chunks con overlap
        start = 0
        chunk_index = 0
        
        while start < len(text):
            end = start + LegalContentService.CHUNK_SIZE
            chunk_text = text[start:end]
            
            # Intentar cortar en un punto natural (., !, ?)
            if end < len(text):
                last_period = chunk_text.rfind('.')
                last_newline = chunk_text.rfind('\n')
                cut_point = max(last_period, last_newline)
                
                if cut_point > LegalContentService.CHUNK_SIZE // 2:
                    chunk_text = chunk_text[:cut_point + 1]
                    end = start + cut_point + 1
            
            chunk = ContentChunk(
                chunk_text=chunk_text.strip(),
                chunk_index=chunk_index,
                legal_content_id=content.id
            )
            chunks.append(chunk)
            
            start = end - LegalContentService.CHUNK_OVERLAP
            chunk_index += 1
        
        db.add_all(chunks)
        db.commit()
    
    @staticmethod
    def _delete_chunks(db: Session, content: LegalContent) -> None:
        """Elimina todos los chunks de un contenido."""
        db.query(ContentChunk).filter(
            ContentChunk.legal_content_id == content.id
        ).delete()
        db.commit()
    
    @staticmethod
    def mark_as_indexed(db: Session, content_id: int, chunk_ids: dict) -> None:
        """
        Marca contenido como indexado y guarda IDs de ChromaDB.
        chunk_ids: {chunk_id: chroma_id}
        """
        content = LegalContentService.get_by_id(db, content_id)
        if not content:
            return
        
        content.is_indexed = True
        
        for chunk in content.chunks:
            if chunk.id in chunk_ids:
                chunk.chroma_id = chunk_ids[chunk.id]
        
        db.commit()
