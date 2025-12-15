# PC Succession MCP Server

Model Context Protocol server for automating PC migration tasks.

## Features

- Install applications remotely
- Configure system settings (registry, environment variables, services)
- Transfer files between PCs
- Install certificates
- Configure VPN connections
- Execute PowerShell commands
- Verify installations

## Installation

```bash
cd mcp
npm install
npm run build
```

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "pc-succession": {
      "command": "node",
      "args": ["/path/to/mcp/dist/index.js"]
    }
  }
}
```

### Standalone

```bash
npm start
```

## Available Tools

### install_application
Install an application on the target PC.

### configure_system
Configure system settings (registry, environment, services, firewall).

### transfer_files
Transfer files from source to target PC.

### install_certificates
Install certificates on the target PC.

### configure_vpn
Configure VPN connection on the target PC.

### exec_powershell
Execute PowerShell commands on the target PC.

### verify_installation
Verify installations and configurations.

## Security

- All operations require appropriate permissions
- Sensitive data should be encrypted in transit
- PowerShell execution policies are respected
- Administrator privileges required for system-level changes


