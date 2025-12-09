from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import uuid
import enum


class AgentStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MIGRATING = "migrating"
    ERROR = "error"


class Agent(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String, unique=True, index=True, nullable=False)
    computer_name = Column(String)
    user_name = Column(String)
    os_version = Column(String)
    status = Column(Enum(AgentStatus), default=AgentStatus.ACTIVE)
    company_id = Column(String, ForeignKey("companies.id"))
    last_seen = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    agent_metadata = Column(JSON, default={})
    
    # Relationships
    company = relationship("Company", back_populates="agents")
    inventories = relationship("Inventory", back_populates="agent")
    migrations = relationship("Migration", back_populates="source_agent",
                            foreign_keys="Migration.source_agent_id")

