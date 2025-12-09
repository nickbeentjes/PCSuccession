from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Import all models here for Alembic
from app.models.company import Company
from app.models.user import User
from app.models.agent import Agent
from app.models.inventory import Inventory
from app.models.migration import Migration

