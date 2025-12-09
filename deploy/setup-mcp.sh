#!/bin/bash

echo "========================================"
echo "PC Succession MCP Server Setup"
echo "========================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js 20 or later"
    exit 1
fi

# Navigate to MCP directory
cd "$(dirname "$0")/../mcp" || exit 1

# Install dependencies
echo "Installing dependencies..."
npm install

# Build
echo "Building MCP server..."
npm run build

echo
echo "========================================"
echo "MCP Server Setup Complete!"
echo "========================================"
echo
echo "To start the MCP server:"
echo "  cd mcp"
echo "  npm start"
echo
echo "To integrate with Claude Desktop, add this to your config:"
echo '{'
echo '  "mcpServers": {'
echo '    "pc-succession": {'
echo '      "command": "node",'
echo '      "args": ["'$(pwd)/dist/index.js'"]'
echo '    }'
echo '  }'
echo '}'
echo

