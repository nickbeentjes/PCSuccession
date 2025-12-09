from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.models.agent import Agent, AgentStatus
from app.models.inventory import Inventory
from app.schemas.agent import AgentResponse, AgentCreate, InventoryCreate, MetricsCreate

router = APIRouter()


@router.get("/", response_model=List[AgentResponse])
async def list_agents(
    company_id: Optional[str] = None,
    status: Optional[AgentStatus] = None,
    db: Session = Depends(get_db)
):
    """List all agents, optionally filtered by company and status"""
    query = db.query(Agent)
    
    if company_id:
        query = query.filter(Agent.company_id == company_id)
    if status:
        query = query.filter(Agent.status == status)
    
    agents = query.all()
    return agents


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str, db: Session = Depends(get_db)):
    """Get details of a specific agent"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.post("/register", response_model=AgentResponse)
async def register_agent(
    agent: AgentCreate,
    x_agent_id: str = Header(...),
    db: Session = Depends(get_db)
):
    """Register a new agent"""
    # Check if agent already exists
    existing = db.query(Agent).filter(Agent.agent_id == x_agent_id).first()
    if existing:
        # Update last seen
        existing.last_seen = datetime.utcnow()
        existing.status = AgentStatus.ACTIVE
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new agent
    db_agent = Agent(
        agent_id=x_agent_id,
        computer_name=agent.computer_name,
        user_name=agent.user_name,
        os_version=agent.os_version,
        company_id=agent.company_id,
        status=AgentStatus.ACTIVE,
        last_seen=datetime.utcnow()
    )
    
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent


@router.post("/inventory")
async def receive_inventory(
    inventory: InventoryCreate,
    x_agent_id: str = Header(...),
    db: Session = Depends(get_db)
):
    """Receive inventory data from an agent"""
    # Find agent
    agent = db.query(Agent).filter(Agent.agent_id == x_agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Update agent last seen
    agent.last_seen = datetime.utcnow()
    
    # Create inventory record
    db_inventory = Inventory(
        agent_id=agent.id,
        system_info=inventory.system_info,
        installed_applications=inventory.installed_applications,
        registry_settings=inventory.registry_settings,
        certificates=inventory.certificates,
        vpn_connections=inventory.vpn_connections,
        user_data_locations=inventory.user_data_locations,
        total_applications=len(inventory.installed_applications or []),
        total_data_size_mb=sum(
            loc.get("size_mb", 0) 
            for loc in inventory.user_data_locations or []
        )
    )
    
    db.add(db_inventory)
    db.commit()
    
    return {"message": "Inventory received successfully"}


@router.post("/metrics")
async def receive_metrics(
    metrics: MetricsCreate,
    x_agent_id: str = Header(...),
    db: Session = Depends(get_db)
):
    """Receive usage metrics from an agent"""
    # Find agent
    agent = db.query(Agent).filter(Agent.agent_id == x_agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Update agent last seen
    agent.last_seen = datetime.utcnow()
    db.commit()
    
    # Find latest inventory and update with metrics
    latest_inventory = db.query(Inventory).filter(
        Inventory.agent_id == agent.id
    ).order_by(Inventory.timestamp.desc()).first()
    
    if latest_inventory:
        latest_inventory.application_usage = metrics.application_usage
        latest_inventory.file_access = metrics.file_access
        latest_inventory.system_performance = metrics.system_performance
        db.commit()
    
    return {"message": "Metrics received successfully"}


@router.get("/{agent_id}/commands")
async def get_commands(
    agent_id: str,
    x_agent_id: str = Header(...),
    db: Session = Depends(get_db)
):
    """Get pending commands for an agent"""
    # TODO: Implement command queue
    return []


@router.get("/{agent_id}/inventory", response_model=dict)
async def get_agent_inventory(
    agent_id: str,
    db: Session = Depends(get_db)
):
    """Get the latest inventory for an agent"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    inventory = db.query(Inventory).filter(
        Inventory.agent_id == agent_id
    ).order_by(Inventory.timestamp.desc()).first()
    
    if not inventory:
        raise HTTPException(status_code=404, detail="No inventory found")
    
    return {
        "id": inventory.id,
        "timestamp": inventory.timestamp,
        "system_info": inventory.system_info,
        "installed_applications": inventory.installed_applications,
        "registry_settings": inventory.registry_settings,
        "certificates": inventory.certificates,
        "vpn_connections": inventory.vpn_connections,
        "user_data_locations": inventory.user_data_locations,
        "application_usage": inventory.application_usage,
        "file_access": inventory.file_access,
        "system_performance": inventory.system_performance,
        "stats": {
            "total_applications": inventory.total_applications,
            "total_data_size_mb": inventory.total_data_size_mb
        }
    }

