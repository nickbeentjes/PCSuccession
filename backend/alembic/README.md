# Database Migration Setup

This directory contains database migration scripts using Alembic.

## Setup

```bash
# Initialize (already done)
alembic init alembic

# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Initial Migration

Create the initial migration:

```bash
cd backend
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

