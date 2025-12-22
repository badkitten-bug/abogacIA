"""
Servicio de embeddings para búsqueda semántica.
Usa sentence-transformers para generar embeddings multilingües.
"""
from typing import List
from sentence_transformers import SentenceTransformer
import numpy as np

from ..config import settings


class EmbeddingService:
    """
    Servicio para generar embeddings de texto.
    Usa modelo multilingüe para mejor soporte de español legal.
    """
    
    _instance = None
    _model = None
    
    def __new__(cls):
        """Singleton para evitar cargar el modelo múltiples veces."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._model is None:
            print(f"Cargando modelo de embeddings: {settings.EMBEDDING_MODEL}")
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
            print("✓ Modelo de embeddings cargado")
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Genera embedding para un texto.
        
        Args:
            text: Texto a embeber
        
        Returns:
            Lista de floats representando el embedding
        """
        embedding = self._model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Genera embeddings para múltiples textos (batch).
        Más eficiente que llamar generate_embedding múltiples veces.
        
        Args:
            texts: Lista de textos a embeber
        
        Returns:
            Lista de embeddings
        """
        embeddings = self._model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()
    
    def get_embedding_dimension(self) -> int:
        """Retorna la dimensión de los embeddings."""
        return self._model.get_sentence_embedding_dimension()
    
    def similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """
        Calcula similitud coseno entre dos embeddings.
        
        Returns:
            Score de similitud entre 0 y 1
        """
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))


# Instancia global
embedding_service = EmbeddingService()
