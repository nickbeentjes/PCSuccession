from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Enum, Text, Float, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import uuid
import enum


class MigrationStatus(str, enum.Enum):
    PLANNING = "planning"
    READY = "ready"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Migration(Base):
    __tablename__ = "migrations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    source_agent_id = Column(String, ForeignKey("agents.id"), nullable=False)
    target_agent_id = Column(String, ForeignKey("agents.id"), nullable=True)
    status = Column(Enum(MigrationStatus), default=MigrationStatus.PLANNING)
    
    # Plan
    migration_plan = Column(JSON)  # AI-generated migration plan
    tasks = Column(JSON)  # List of tasks to complete
    
    # Progress
    completed_tasks = Column(JSON, default=[])
    failed_tasks = Column(JSON, default=[])
    current_task = Column(String)
    progress_percent = Column(Float, default=0.0)
    
    # Timing
    estimated_duration_minutes = Column(Integer)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Results
    success_message = Column(Text)
    error_message = Column(Text)
    manual_steps = Column(JSON)  # Steps that require manual intervention
    
    # AI Analysis
    ai_recommendations = Column(JSON)
    hardware_recommendation = Column(JSON)
    optimization_suggestions = Column(JSON)
    
    # Relationships
    source_agent = relationship("Agent", foreign_keys=[source_agent_id],
                               back_populates="migrations")
    target_agent = relationship("Agent", foreign_keys=[target_agent_id])


