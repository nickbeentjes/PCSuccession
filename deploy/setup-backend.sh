#!/bin/bash

echo "========================================"
echo "PC Succession Backend Setup"
echo "========================================"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed!"
    echo "Please install Python 3.11 or later"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "WARNING: PostgreSQL is not installed!"
    echo "Please install PostgreSQL 15 or later"
fi

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || exit 1

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate || . venv/Scripts/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment template
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please edit .env file with your configuration"
fi

# Setup database
echo
read -p "Do you want to setup the database now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter PostgreSQL username (default: postgres): " DB_USER
    DB_USER=${DB_USER:-postgres}
    
    read -p "Enter database name (default: pcsuccession): " DB_NAME
    DB_NAME=${DB_NAME:-pcsuccession}
    
    echo "Creating database..."
    createdb -U "$DB_USER" "$DB_NAME" 2>/dev/null || echo "Database may already exist"
    
    echo "Running migrations..."
    alembic upgrade head
fi

echo
echo "========================================"
echo "Backend Setup Complete!"
echo "========================================"
echo
echo "To start the backend server:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python -m uvicorn main:app --reload"
echo
echo "API will be available at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo

