"""
Servicio de chat que integra RAG + LLM.
Orquesta la búsqueda de documentos y generación de respuestas.
"""
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
import json
import time

from ..models.chat import ChatSession, ChatMessage, MessageRole
from ..models.user import User
from ..schemas.chat import ChatRequest, ChatResponse, SourceReference
from .retriever import rag_retriever
from .llm_provider import get_llm_provider


class ChatService:
    """
    Servicio de chat con RAG.
    Maneja sesiones, búsqueda de contexto y generación de respuestas.
    """
    
    @staticmethod
    async def process_message(
        db: Session,
        request: ChatRequest,
        user: Optional[User] = None,
        session_token: Optional[str] = None
    ) -> ChatResponse:
        """
        Procesa un mensaje del usuario y genera respuesta.
        
        Args:
            db: Sesión de base de datos
            request: Request con mensaje y metadata
            user: Usuario autenticado (opcional)
            session_token: Token de sesión para usuarios anónimos
        
        Returns:
            ChatResponse con respuesta y fuentes
        """
        start_time = time.time()
        
        # Obtener o crear sesión
        session = ChatService._get_or_create_session(
            db, request.session_id, user, session_token, request.category
        )
        
        # Guardar mensaje del usuario
        user_message = ChatMessage(
            session_id=session.id,
            role=MessageRole.USER,
            content=request.message
        )
        db.add(user_message)
        db.commit()
        
        # Buscar documentos relevantes
        search_results = rag_retriever.search(
            query=request.message,
            n_results=5,
            category=request.category
        )
        
        # Construir contexto
        context, sources = ChatService._build_context(search_results)
        
        # Generar respuesta con LLM
        llm = get_llm_provider()
        response_text = await llm.generate(
            prompt=request.message,
            context=context
        )
        
        # Calcular tiempo de respuesta
        response_time_ms = int((time.time() - start_time) * 1000)
        
        # Guardar respuesta del asistente
        assistant_message = ChatMessage(
            session_id=session.id,
            role=MessageRole.ASSISTANT,
            content=response_text,
            sources=json.dumps([s.model_dump() for s in sources]) if sources else None,
            response_time_ms=response_time_ms
        )
        db.add(assistant_message)
        
        # Actualizar título de sesión si es el primer mensaje
        if not session.title:
            session.title = ChatService._generate_title(request.message)
        
        db.commit()
        
        return ChatResponse(
            session_id=session.id,
            message_id=assistant_message.id,
            response=response_text,
            sources=sources,
            response_time_ms=response_time_ms
        )
    
    @staticmethod
    def _get_or_create_session(
        db: Session,
        session_id: Optional[int],
        user: Optional[User],
        session_token: Optional[str],
        category: Optional[str]
    ) -> ChatSession:
        """Obtiene sesión existente o crea una nueva."""
        
        if session_id:
            session = db.query(ChatSession).filter(
                ChatSession.id == session_id
            ).first()
            if session:
                return session
        
        # Crear nueva sesión
        session = ChatSession(
            user_id=user.id if user else None,
            session_token=session_token,
            category=category
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        
        return session
    
    @staticmethod
    def _build_context(
        search_results: List[Tuple[str, dict, float]]
    ) -> Tuple[str, List[SourceReference]]:
        """
        Construye contexto y referencias a partir de resultados de búsqueda.
        
        Returns:
            Tuple de (contexto_texto, lista_de_fuentes)
        """
        if not search_results:
            return "", []
        
        context_parts = []
        sources = []
        seen_content_ids = set()
        
        for text, metadata, score in search_results:
            content_id = metadata.get("content_id")
            
            # Agregar al contexto
            source_info = f"[{metadata.get('content_type', 'documento').upper()}"
            if metadata.get('number'):
                source_info += f" {metadata.get('number')}"
            source_info += f": {metadata.get('title', 'Sin título')}]"
            
            context_parts.append(f"{source_info}\n{text}")
            
            # Agregar a fuentes (evitar duplicados)
            if content_id not in seen_content_ids:
                sources.append(SourceReference(
                    id=content_id,
                    title=metadata.get('title', 'Sin título'),
                    content_type=metadata.get('content_type', 'documento'),
                    number=metadata.get('number'),
                    relevance_score=round(score, 3)
                ))
                seen_content_ids.add(content_id)
        
        context = "\n\n---\n\n".join(context_parts)
        
        return context, sources
    
    @staticmethod
    def _generate_title(message: str) -> str:
        """Genera título para la sesión basado en el primer mensaje."""
        # Limpiar y truncar
        title = message.strip()
        if len(title) > 50:
            title = title[:47] + "..."
        return title
    
    @staticmethod
    def get_session_history(
        db: Session,
        session_id: int,
        user: Optional[User] = None
    ) -> Optional[ChatSession]:
        """Obtiene sesión con todos sus mensajes."""
        query = db.query(ChatSession).filter(ChatSession.id == session_id)
        
        if user:
            query = query.filter(ChatSession.user_id == user.id)
        
        return query.first()
    
    @staticmethod
    def get_user_sessions(
        db: Session,
        user: User,
        limit: int = 20
    ) -> List[ChatSession]:
        """Obtiene las sesiones de un usuario."""
        return db.query(ChatSession).filter(
            ChatSession.user_id == user.id
        ).order_by(
            ChatSession.updated_at.desc()
        ).limit(limit).all()
    
    @staticmethod
    def submit_feedback(
        db: Session,
        message_id: int,
        is_helpful: int
    ) -> bool:
        """Guarda feedback de un mensaje."""
        message = db.query(ChatMessage).filter(
            ChatMessage.id == message_id
        ).first()
        
        if not message:
            return False
        
        message.is_helpful = is_helpful
        db.commit()
        return True
