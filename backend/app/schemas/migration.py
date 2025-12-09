from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, List, Any
from app.models.migration import MigrationStatus


class MigrationBase(BaseModel):
    name: str
    source_agent_id: str
    target_agent_id: Optional[str] = None


class MigrationCreate(MigrationBase):
    pass


class MigrationUpdate(BaseModel):
    status: Optional[MigrationStatus] = None
    progress_percent: Optional[float] = None
    current_task: Optional[str] = None


class MigrationResponse(MigrationBase):
    id: str
    status: MigrationStatus
    migration_plan: Optional[Dict[str, Any]] = None
    tasks: Optional[List[Dict[str, Any]]] = None
    completed_tasks: Optional[List[Dict[str, Any]]] = None
    failed_tasks: Optional[List[Dict[str, Any]]] = None
    current_task: Optional[str] = None
    progress_percent: float
    estimated_duration_minutes: Optional[int] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    ai_recommendations: Optional[Dict[str, Any]] = None
    hardware_recommendation: Optional[Dict[str, Any]] = None
    optimization_suggestions: Optional[Dict[str, Any]] = None
    manual_steps: Optional[List[Dict[str, Any]]] = None

    class Config:
        from_attributes = True

