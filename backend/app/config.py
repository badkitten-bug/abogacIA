"""
Configuración de la aplicación AbogacIA.
Carga variables de entorno y define settings globales.
"""
from pydantic_settings import BaseSettings
from typing import Literal, List
import os
import json


class Settings(BaseSettings):
    """Configuración global de la aplicación."""
    
    # App
    APP_NAME: str = "AbogacIA API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/abogacia"
    
    # JWT Authentication
    SECRET_KEY: str = "tu-secret-key-super-segura-cambiar-en-produccion"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS - Lista o "*" para permitir todos
    CORS_ORIGINS: str = '["http://localhost:3000", "http://127.0.0.1:3000"]'
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parsea CORS_ORIGINS del env."""
        if self.CORS_ORIGINS == "*":
            return ["*"]
        try:
            return json.loads(self.CORS_ORIGINS)
        except:
            return ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # LLM Provider: "ollama" o "groq"
    LLM_PROVIDER: Literal["ollama", "groq"] = "ollama"
    
    # Ollama (local)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"
    
    # Groq (cloud - gratis)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    
    # ChromaDB
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8001
    CHROMA_COLLECTION: str = "legal_documents"
    
    # Embeddings
    EMBEDDING_MODEL: str = "paraphrase-multilingual-MiniLM-L12-v2"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


# Instancia global de settings
settings = Settings()

