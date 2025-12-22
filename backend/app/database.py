"""
Configuración de la base de datos.
Soporta PostgreSQL (producción) y SQLite (desarrollo).
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings
import os

# Detectar si usar SQLite o PostgreSQL
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite para desarrollo local
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False}  # Necesario para SQLite
    )
    print("📦 Usando SQLite para desarrollo")
else:
    # PostgreSQL para producción
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
    print("📦 Usando PostgreSQL")

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()


def get_db():
    """
    Dependency para obtener sesión de base de datos.
    Uso: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Inicializa las tablas de la base de datos."""
    from .models import user, legal_content, lawyer, chat  # noqa: F401
    Base.metadata.create_all(bind=engine)
    print("✓ Tablas de base de datos creadas")

