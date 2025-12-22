"""
Modelos para abogados y estudios jurídicos (directorio).
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Table
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database import Base


# Tabla intermedia para relación muchos-a-muchos entre abogados y estudios
lawyer_firm_association = Table(
    'lawyer_firm_association',
    Base.metadata,
    Column('lawyer_id', Integer, ForeignKey('lawyers.id'), primary_key=True),
    Column('law_firm_id', Integer, ForeignKey('law_firms.id'), primary_key=True)
)


class LawFirm(Base):
    """
    Estudio jurídico registrado en el directorio.
    """
    __tablename__ = "law_firms"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Información básica
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    
    # Ubicación
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    
    # Contacto
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    
    # Especialidades (separadas por coma)
    specialties = Column(String(500), nullable=True)
    
    # Estado
    is_verified = Column(Boolean, default=False)  # Verificado por admin
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    lawyers = relationship(
        "Lawyer",
        secondary=lawyer_firm_association,
        back_populates="law_firms"
    )
    
    def __repr__(self):
        return f"<LawFirm {self.name}>"


class Lawyer(Base):
    """
    Abogado registrado en el directorio.
    Puede estar asociado a uno o más estudios jurídicos.
    """
    __tablename__ = "lawyers"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Usuario asociado (si tiene cuenta)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Información personal
    full_name = Column(String(255), nullable=False, index=True)
    photo_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    
    # Información profesional
    colegiatura = Column(String(50), nullable=True, index=True)  # N° de colegiatura
    colegio = Column(String(100), nullable=True)  # Colegio de Abogados de Lima, etc.
    years_experience = Column(Integer, nullable=True)
    
    # Especialidades (separadas por coma)
    specialties = Column(String(500), nullable=True)
    
    # Contacto
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    linkedin = Column(String(255), nullable=True)
    
    # Referencias/testimonios
    references = Column(Text, nullable=True)  # JSON con referencias
    
    # Tarifas (opcional)
    hourly_rate = Column(String(50), nullable=True)  # "S/. 150 - S/. 300"
    offers_free_consultation = Column(Boolean, default=False)
    
    # Estado
    is_verified = Column(Boolean, default=False)  # Verificado por admin
    is_active = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)  # Disponible para nuevos clientes
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    user = relationship("User", backref="lawyer_profile")
    law_firms = relationship(
        "LawFirm",
        secondary=lawyer_firm_association,
        back_populates="lawyers"
    )
    
    def __repr__(self):
        return f"<Lawyer {self.full_name}>"
