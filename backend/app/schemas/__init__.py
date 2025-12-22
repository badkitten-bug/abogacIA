# Schemas package
from .user import UserCreate, UserLogin, UserResponse, Token, TokenData
from .legal_content import (
    LegalContentCreate, LegalContentUpdate, LegalContentResponse,
    ContentCategory, ContentType
)
from .lawyer import LawyerCreate, LawyerResponse, LawFirmCreate, LawFirmResponse
from .chat import ChatRequest, ChatResponse, ChatMessageResponse, ChatSessionResponse

__all__ = [
    "UserCreate", "UserLogin", "UserResponse", "Token", "TokenData",
    "LegalContentCreate", "LegalContentUpdate", "LegalContentResponse",
    "ContentCategory", "ContentType",
    "LawyerCreate", "LawyerResponse", "LawFirmCreate", "LawFirmResponse",
    "ChatRequest", "ChatResponse", "ChatMessageResponse", "ChatSessionResponse"
]
