"""
AbogacIA API - Backend FastAPI

Asistente legal IA para Perú con RAG.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .database import init_db
from .routers import (
    auth_router,
    legal_content_router,
    chat_router,
    lawyers_router,
    admin_router
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager: ejecuta código al iniciar y cerrar la app."""
    # Startup
    print(f"🚀 Iniciando {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"   LLM Provider: {settings.LLM_PROVIDER}")
    
    # Inicializar base de datos
    print("📊 Inicializando base de datos...")
    init_db()
    print("✓ Base de datos lista")
    
    yield
    
    # Shutdown
    print("👋 Cerrando aplicación...")


# Crear aplicación FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## AbogacIA API
    
    API para el asistente legal IA especializado en derecho peruano.
    
    ### Características:
    - 🤖 Chat con IA usando RAG (Retrieval Augmented Generation)
    - 📚 Base de conocimiento de leyes peruanas
    - 👨‍⚖️ Directorio de abogados y estudios jurídicos
    - 🔐 Autenticación JWT
    
    ### Autenticación
    Usa el endpoint `/api/auth/login` para obtener un token JWT.
    Luego incluye el token en el header: `Authorization: Bearer <token>`
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)


# Configurar CORS - Permitir todos los orígenes en desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, cambiar a dominios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Registrar routers
app.include_router(auth_router, prefix="/api")
app.include_router(legal_content_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(lawyers_router, prefix="/api")
app.include_router(admin_router, prefix="/api")


# Endpoints de salud
@app.get("/", tags=["Health"])
async def root():
    """Endpoint raíz."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check para monitoreo."""
    return {"status": "healthy"}


@app.get("/api", tags=["Health"])
async def api_info():
    """Información de la API."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "llm_provider": settings.LLM_PROVIDER,
        "endpoints": {
            "auth": "/api/auth",
            "legal_content": "/api/legal-content",
            "chat": "/api/chat",
            "directorio": "/api/directorio",
            "admin": "/api/admin"
        }
    }
