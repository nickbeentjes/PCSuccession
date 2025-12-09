#!/bin/bash

echo "========================================"
echo "PC Succession Dashboard Setup"
echo "========================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js 20 or later"
    exit 1
fi

echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo

# Navigate to dashboard directory
cd "$(dirname "$0")/../dashboard" || exit 1

# Install dependencies
echo "Installing dependencies..."
npm install

# Create environment file
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
VITE_API_URL=http://localhost:8000/api/v1
EOF
    echo ".env file created"
fi

echo
echo "========================================"
echo "Dashboard Setup Complete!"
echo "========================================"
echo
echo "To start the development server:"
echo "  cd dashboard"
echo "  npm run dev"
echo
echo "To build for production:"
echo "  cd dashboard"
echo "  npm run build"
echo
echo "Dashboard will be available at: http://localhost:3000"
echo

