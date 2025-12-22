# Routers package
from .auth import router as auth_router
from .legal_content import router as legal_content_router
from .chat import router as chat_router
from .lawyers import router as lawyers_router
from .admin import router as admin_router

__all__ = [
    "auth_router",
    "legal_content_router", 
    "chat_router",
    "lawyers_router",
    "admin_router"
]
