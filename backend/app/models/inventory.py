from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import uuid


class Inventory(Base):
    __tablename__ = "inventories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String, ForeignKey("agents.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # System Info
    system_info = Column(JSON)
    
    # Discovery Data
    installed_applications = Column(JSON)
    registry_settings = Column(JSON)
    certificates = Column(JSON)
    vpn_connections = Column(JSON)
    user_data_locations = Column(JSON)
    
    # Metrics
    application_usage = Column(JSON)
    file_access = Column(JSON)
    system_performance = Column(JSON)
    
    # Statistics
    total_applications = Column(Integer, default=0)
    total_data_size_mb = Column(Integer, default=0)
    
    # Relationships
    agent = relationship("Agent", back_populates="inventories")

