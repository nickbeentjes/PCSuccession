# Import all models here to ensure they're registered with Base.metadata
# This is imported by Alembic to discover all models

from app.models.company import Company
from app.models.user import User
from app.models.agent import Agent
from app.models.inventory import Inventory
from app.models.migration import Migration

__all__ = ["Company", "User", "Agent", "Inventory", "Migration"]

