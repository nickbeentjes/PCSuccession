# PC Succession - Complete System Documentation

## Overview

PC Succession is a comprehensive AI-powered PC migration system that automates the discovery, analysis, and migration of Windows PCs to new hardware.

## Architecture

### Components

1. **Windows Agent** (C# .NET 8)
   - System tray application
   - Windows Service
   - Discovery engine
   - Usage monitoring
   - API client

2. **Backend API** (Python FastAPI)
   - Multi-tenant orchestration
   - Agent management
   - Migration planning with Claude AI
   - RESTful API
   - PostgreSQL database
   - Redis for caching/queues

3. **Web Dashboard** (React + TypeScript)
   - Company/agent management
   - Migration status and progress
   - AI recommendations
   - Hardware specs generator
   - Deployment management

4. **MCP Server** (Node.js + TypeScript)
   - Windows MCP Server integration
   - Automated task execution
   - PowerShell command execution
   - File transfer
   - Configuration management

## Features

### Discovery & Monitoring
✅ Installed software inventory
✅ Registry configurations
✅ Crypto keys and certificates
✅ VPN connections
✅ User data locations
✅ File system analysis
✅ Usage pattern tracking
✅ Application usage analytics
✅ System performance metrics

### AI-Powered Migration
✅ Intelligent installation order
✅ Automated configuration
✅ Secret and credential migration
✅ Compatibility checking
✅ Progress tracking
✅ Manual step documentation

### Hardware Recommendations
✅ Usage-based spec analysis
✅ Performance optimization
✅ Cost-benefit analysis

### Security & Compliance
✅ Multi-tenant architecture
✅ Encrypted data transmission
✅ Secure credential storage
✅ Audit logging
✅ User consent management

## Installation

See [DEPLOYMENT.md](deploy/DEPLOYMENT.md) for complete deployment instructions.

### Quick Start (Development)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python -m uvicorn main:app --reload

# Dashboard
cd dashboard
npm install
npm run dev

# Agent (Windows)
cd agent/PCSuccessionAgent
dotnet restore
dotnet run
```

## Usage Guide

### For IT Administrators

1. **Setup Company Account**
   ```
   POST /api/v1/companies
   {
     "name": "Your Company",
     "email": "admin@company.com"
   }
   ```

2. **Deploy Agent**
   - Download installer from dashboard
   - Run on target PC as Administrator
   - Agent appears in dashboard automatically

3. **Monitor Discovery** (Wait 3-7 days for accurate usage data)
   - View real-time inventory
   - Check usage patterns
   - Review AI recommendations

4. **Initiate Migration**
   ```
   POST /api/v1/migrations
   {
     "name": "John's PC Migration",
     "source_agent_id": "agent-id-here"
   }
   ```

5. **Start Migration**
   - Install agent on new PC
   - Review migration plan
   - Click "Start Migration"
   - Monitor progress
   - Complete manual steps

### For End Users

1. **Install Agent**
   - Click deployment link from IT
   - Follow installation wizard
   - Grant permissions

2. **Normal Usage**
   - Agent runs in background
   - Monitors usage patterns
   - No performance impact

3. **Migration Day**
   - New PC will be configured automatically
   - Follow instructions for manual steps
   - Verify everything works

## API Documentation

Full API documentation available at: `http://localhost:8000/docs`

### Key Endpoints

#### Agents
- `GET /api/v1/agents` - List all agents
- `GET /api/v1/agents/{id}` - Get agent details
- `GET /api/v1/agents/{id}/inventory` - Get agent inventory
- `POST /api/v1/agents/register` - Register new agent
- `POST /api/v1/agents/inventory` - Submit inventory data
- `POST /api/v1/agents/metrics` - Submit usage metrics

#### Migrations
- `GET /api/v1/migrations` - List all migrations
- `GET /api/v1/migrations/{id}` - Get migration details
- `POST /api/v1/migrations` - Create new migration
- `PATCH /api/v1/migrations/{id}` - Update migration
- `POST /api/v1/migrations/{id}/start` - Start migration execution

#### Companies
- `GET /api/v1/companies` - List companies
- `POST /api/v1/companies` - Create company

#### Authentication
- `POST /api/v1/auth/login` - Login (OAuth2)

## MCP Integration

The system uses the Model Context Protocol to enable Claude AI to directly execute migration tasks on target PCs.

### Available MCP Tools

1. **install_application** - Install applications
2. **configure_system** - Configure registry, environment variables, services
3. **transfer_files** - Copy files between PCs
4. **install_certificates** - Install certificates
5. **configure_vpn** - Setup VPN connections
6. **exec_powershell** - Execute PowerShell commands
7. **verify_installation** - Verify installations

### Example MCP Usage

```json
{
  "tool": "install_application",
  "arguments": {
    "application_name": "Google Chrome",
    "installer_url": "https://dl.google.com/chrome/install/ChromeStandaloneSetup64.exe",
    "install_arguments": "/silent /install",
    "verify_command": "Get-ItemProperty HKLM:\\Software\\Google\\Chrome"
  }
}
```

## Database Schema

### Companies
- id (PK)
- name
- email
- is_active
- created_at, updated_at

### Users
- id (PK)
- email
- hashed_password
- full_name
- is_active, is_superuser
- company_id (FK)
- created_at, updated_at

### Agents
- id (PK)
- agent_id (unique)
- computer_name
- user_name
- os_version
- status (enum)
- company_id (FK)
- last_seen
- created_at, updated_at
- metadata (JSON)

### Inventories
- id (PK)
- agent_id (FK)
- timestamp
- system_info (JSON)
- installed_applications (JSON)
- registry_settings (JSON)
- certificates (JSON)
- vpn_connections (JSON)
- user_data_locations (JSON)
- application_usage (JSON)
- file_access (JSON)
- system_performance (JSON)
- total_applications
- total_data_size_mb

### Migrations
- id (PK)
- name
- source_agent_id (FK)
- target_agent_id (FK)
- status (enum)
- migration_plan (JSON)
- tasks (JSON)
- completed_tasks, failed_tasks (JSON)
- current_task
- progress_percent
- estimated_duration_minutes
- started_at, completed_at, created_at, updated_at
- success_message, error_message
- manual_steps (JSON)
- ai_recommendations (JSON)
- hardware_recommendation (JSON)
- optimization_suggestions (JSON)

## Configuration

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/pcsuccession
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key
ANTHROPIC_API_KEY=sk-ant-...
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

### Dashboard (.env)
```bash
VITE_API_URL=http://localhost:8000/api/v1
```

### Agent (config.json)
```json
{
  "ApiUrl": "https://api.pcsuccession.local",
  "CompanyId": "company-id",
  "MonitoringEnabled": true,
  "AutoStart": true
}
```

## Security Considerations

1. **Authentication**
   - OAuth2 with JWT tokens
   - Token expiration: 8 days
   - Secure password hashing (bcrypt)

2. **Data Protection**
   - TLS 1.3 for all communications
   - Secrets encrypted at rest
   - Sensitive data never logged

3. **Access Control**
   - Multi-tenant isolation
   - Role-based access control
   - Audit logging

4. **Agent Security**
   - Agent ID verification
   - Secure credential storage
   - Limited permissions

## Performance

- **Agent Impact**: < 1% CPU, < 50MB RAM
- **API Response**: < 100ms average
- **Dashboard Load**: < 2s initial load
- **Migration Speed**: Depends on data size and network

## Troubleshooting

See [DEPLOYMENT.md](deploy/DEPLOYMENT.md) for common issues and solutions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Proprietary - Internal Use Only

## Support

- Email: support@pcsuccession.local
- Documentation: https://docs.pcsuccession.local
- Issues: https://github.com/nickbeentjes/PCSuccession/issues

