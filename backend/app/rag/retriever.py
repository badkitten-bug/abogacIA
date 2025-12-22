"""
Retriever para RAG usando ChromaDB.
Maneja la indexación y búsqueda de documentos legales.
"""
from typing import List, Optional, Tuple
import chromadb
from chromadb.config import Settings as ChromaSettings
from sqlalchemy.orm import Session

from ..config import settings
from ..models.legal_content import LegalContent, ContentChunk
from .embeddings import embedding_service


class RAGRetriever:
    """
    Retriever para búsqueda semántica de documentos legales.
    Usa ChromaDB como vector store.
    """
    
    _instance = None
    _client = None
    _collection = None
    
    def __new__(cls):
        """Singleton para mantener conexión a ChromaDB."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self._init_chroma()
    
    def _init_chroma(self):
        """Inicializa conexión a ChromaDB."""
        try:
            # Intentar conectar a ChromaDB server
            self._client = chromadb.HttpClient(
                host=settings.CHROMA_HOST,
                port=settings.CHROMA_PORT
            )
            print(f"✓ Conectado a ChromaDB en {settings.CHROMA_HOST}:{settings.CHROMA_PORT}")
        except Exception:
            # Fallback a cliente local (para desarrollo)
            print("⚠ ChromaDB server no disponible, usando almacenamiento local")
            self._client = chromadb.Client(ChromaSettings(
                anonymized_telemetry=False,
                persist_directory="./chroma_data"
            ))
        
        # Obtener o crear colección
        self._collection = self._client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION,
            metadata={"description": "Documentos legales peruanos"}
        )
        print(f"✓ Colección '{settings.CHROMA_COLLECTION}' lista")
    
    def index_content(self, db: Session, content: LegalContent) -> dict:
        """
        Indexa un contenido legal y sus chunks en ChromaDB.
        
        Args:
            db: Sesión de base de datos
            content: Contenido legal a indexar
        
        Returns:
            Dict con chunk_id -> chroma_id mapping
        """
        chunks = db.query(ContentChunk).filter(
            ContentChunk.legal_content_id == content.id
        ).all()
        
        if not chunks:
            return {}
        
        # Preparar datos para ChromaDB
        documents = []
        metadatas = []
        ids = []
        embeddings = []
        
        texts_to_embed = [chunk.chunk_text for chunk in chunks]
        chunk_embeddings = embedding_service.generate_embeddings(texts_to_embed)
        
        chunk_id_mapping = {}
        
        for i, chunk in enumerate(chunks):
            chroma_id = f"content_{content.id}_chunk_{chunk.id}"
            
            documents.append(chunk.chunk_text)
            metadatas.append({
                "content_id": content.id,
                "chunk_id": chunk.id,
                "title": content.title,
                "category": content.category.value,
                "content_type": content.content_type.value,
                "number": content.number or "",
                "source": content.source or ""
            })
            ids.append(chroma_id)
            embeddings.append(chunk_embeddings[i])
            
            chunk_id_mapping[chunk.id] = chroma_id
        
        # Agregar a ChromaDB
        self._collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids,
            embeddings=embeddings
        )
        
        return chunk_id_mapping
    
    def search(
        self,
        query: str,
        n_results: int = 5,
        category: Optional[str] = None
    ) -> List[Tuple[str, dict, float]]:
        """
        Busca documentos relevantes para una consulta.
        
        Args:
            query: Consulta del usuario
            n_results: Número de resultados a retornar
            category: Filtro opcional por categoría
        
        Returns:
            Lista de tuples (texto, metadata, score)
        """
        # Generar embedding de la consulta
        query_embedding = embedding_service.generate_embedding(query)
        
        # Construir filtro si hay categoría
        where_filter = None
        if category:
            where_filter = {"category": category}
        
        # Buscar en ChromaDB
        results = self._collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where_filter,
            include=["documents", "metadatas", "distances"]
        )
        
        # Procesar resultados
        output = []
        if results and results['documents'] and results['documents'][0]:
            documents = results['documents'][0]
            metadatas = results['metadatas'][0]
            distances = results['distances'][0]
            
            for doc, meta, dist in zip(documents, metadatas, distances):
                # Convertir distancia a score de similitud (1 - distancia normalizada)
                score = 1 / (1 + dist)
                output.append((doc, meta, score))
        
        return output
    
    def delete_content(self, content_id: int) -> None:
        """Elimina todos los chunks de un contenido de ChromaDB."""
        # Buscar IDs que pertenecen a este contenido
        results = self._collection.get(
            where={"content_id": content_id},
            include=[]
        )
        
        if results and results['ids']:
            self._collection.delete(ids=results['ids'])
    
    def get_stats(self) -> dict:
        """Obtiene estadísticas del vector store."""
        count = self._collection.count()
        return {
            "collection_name": settings.CHROMA_COLLECTION,
            "total_chunks": count
        }


# Instancia global
rag_retriever = RAGRetriever()
