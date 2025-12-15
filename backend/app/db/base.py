from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Note: Model imports are done in app.models.__init__ to avoid circular imports
# Import that module when you need all models (e.g., in Alembic env.py)

