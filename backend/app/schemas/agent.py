from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, List, Any
from app.models.agent import AgentStatus


class AgentBase(BaseModel):
    computer_name: Optional[str] = None
    user_name: Optional[str] = None
    os_version: Optional[str] = None
    company_id: Optional[str] = None


class AgentCreate(AgentBase):
    pass


class AgentResponse(AgentBase):
    id: str
    agent_id: str
    status: AgentStatus
    last_seen: Optional[datetime] = None
    created_at: datetime
    metadata: Dict = {}

    class Config:
        from_attributes = True


class InventoryCreate(BaseModel):
    system_info: Optional[Dict[str, Any]] = None
    installed_applications: Optional[List[Dict[str, Any]]] = None
    registry_settings: Optional[List[Dict[str, Any]]] = None
    certificates: Optional[List[Dict[str, Any]]] = None
    vpn_connections: Optional[List[Dict[str, Any]]] = None
    user_data_locations: Optional[List[Dict[str, Any]]] = None


class MetricsCreate(BaseModel):
    application_usage: Optional[List[Dict[str, Any]]] = None
    file_access: Optional[List[Dict[str, Any]]] = None
    system_performance: Optional[Dict[str, Any]] = None

