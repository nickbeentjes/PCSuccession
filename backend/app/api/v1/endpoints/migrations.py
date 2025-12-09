from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models.migration import Migration, MigrationStatus
from app.models.agent import Agent
from app.schemas.migration import (
    MigrationCreate, MigrationResponse, MigrationUpdate
)
from app.services.ai_service import AIService
from app.services.migration_service import MigrationService

router = APIRouter()


@router.post("/", response_model=MigrationResponse)
async def create_migration(
    migration: MigrationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Create a new migration plan"""
    # Validate source agent exists
    source_agent = db.query(Agent).filter(Agent.id == migration.source_agent_id).first()
    if not source_agent:
        raise HTTPException(status_code=404, detail="Source agent not found")
    
    # Create migration
    db_migration = Migration(
        name=migration.name,
        source_agent_id=migration.source_agent_id,
        target_agent_id=migration.target_agent_id,
        status=MigrationStatus.PLANNING
    )
    
    db.add(db_migration)
    db.commit()
    db.refresh(db_migration)
    
    # Generate migration plan in background
    background_tasks.add_task(
        generate_migration_plan,
        db_migration.id,
        source_agent.id
    )
    
    return db_migration


@router.get("/", response_model=List[MigrationResponse])
async def list_migrations(
    company_id: Optional[str] = None,
    status: Optional[MigrationStatus] = None,
    db: Session = Depends(get_db)
):
    """List all migrations"""
    query = db.query(Migration)
    
    if status:
        query = query.filter(Migration.status == status)
    
    migrations = query.all()
    return migrations


@router.get("/{migration_id}", response_model=MigrationResponse)
async def get_migration(migration_id: str, db: Session = Depends(get_db)):
    """Get migration details"""
    migration = db.query(Migration).filter(Migration.id == migration_id).first()
    if not migration:
        raise HTTPException(status_code=404, detail="Migration not found")
    return migration


@router.patch("/{migration_id}", response_model=MigrationResponse)
async def update_migration(
    migration_id: str,
    migration_update: MigrationUpdate,
    db: Session = Depends(get_db)
):
    """Update migration status"""
    migration = db.query(Migration).filter(Migration.id == migration_id).first()
    if not migration:
        raise HTTPException(status_code=404, detail="Migration not found")
    
    if migration_update.status:
        migration.status = migration_update.status
    if migration_update.progress_percent is not None:
        migration.progress_percent = migration_update.progress_percent
    if migration_update.current_task:
        migration.current_task = migration_update.current_task
    
    db.commit()
    db.refresh(migration)
    return migration


@router.post("/{migration_id}/start")
async def start_migration(
    migration_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Start executing the migration"""
    migration = db.query(Migration).filter(Migration.id == migration_id).first()
    if not migration:
        raise HTTPException(status_code=404, detail="Migration not found")
    
    if migration.status != MigrationStatus.READY:
        raise HTTPException(
            status_code=400,
            detail="Migration must be in READY status to start"
        )
    
    # Update status
    migration.status = MigrationStatus.IN_PROGRESS
    db.commit()
    
    # Execute migration in background
    background_tasks.add_task(execute_migration, migration_id)
    
    return {"message": "Migration started"}


async def generate_migration_plan(migration_id: str, source_agent_id: str):
    """Background task to generate migration plan using AI"""
    from app.db.session import SessionLocal
    db = SessionLocal()
    
    try:
        ai_service = AIService()
        migration_service = MigrationService(db)
        
        # Generate plan
        plan = await ai_service.generate_migration_plan(source_agent_id, db)
        
        # Update migration
        migration = db.query(Migration).filter(Migration.id == migration_id).first()
        if migration:
            migration.migration_plan = plan["plan"]
            migration.tasks = plan["tasks"]
            migration.ai_recommendations = plan["recommendations"]
            migration.hardware_recommendation = plan["hardware_spec"]
            migration.estimated_duration_minutes = plan["estimated_minutes"]
            migration.status = MigrationStatus.READY
            db.commit()
    except Exception as e:
        # Handle error
        migration = db.query(Migration).filter(Migration.id == migration_id).first()
        if migration:
            migration.status = MigrationStatus.FAILED
            migration.error_message = str(e)
            db.commit()
    finally:
        db.close()


async def execute_migration(migration_id: str):
    """Background task to execute migration"""
    from app.db.session import SessionLocal
    db = SessionLocal()
    
    try:
        migration_service = MigrationService(db)
        await migration_service.execute_migration(migration_id)
    finally:
        db.close()

