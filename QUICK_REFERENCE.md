# PC Succession - Quick Reference

## 🚀 Quick Commands

### Start Development Environment

```bash
# Terminal 1 - Backend
cd backend && source venv/bin/activate && uvicorn main:app --reload

# Terminal 2 - Dashboard
cd dashboard && npm run dev

# Terminal 3 - MCP Server
cd mcp && npm start

# Windows - Agent
cd agent\PCSuccessionAgent && dotnet run
```

### Production with Docker

```bash
docker-compose up -d          # Start all services
docker-compose ps             # Check status
docker-compose logs -f        # View logs
docker-compose down           # Stop all services
docker-compose restart        # Restart services
```

---

## 📡 API Quick Reference

### Base URL
```
Development: http://localhost:8000/api/v1
Production:  https://api.pcsuccession.com/api/v1
```

### Authentication
```bash
# Login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@company.com&password=admin123"

# Response: {"access_token": "eyJ...", "token_type": "bearer"}

# Use token
curl -H "Authorization: Bearer eyJ..." http://localhost:8000/api/v1/agents
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/agents` | List all agents |
| GET | `/agents/{id}` | Get agent details |
| GET | `/agents/{id}/inventory` | Get agent inventory |
| POST | `/agents/register` | Register new agent |
| GET | `/migrations` | List migrations |
| POST | `/migrations` | Create migration |
| POST | `/migrations/{id}/start` | Start migration |
| GET | `/companies` | List companies |
| POST | `/companies` | Create company |

---

## 🗄️ Database Quick Reference

### Connect to Database

```bash
# Local
psql -U pcsuccession -d pcsuccession

# Docker
docker-compose exec postgres psql -U pcsuccession pcsuccession
```

### Useful Queries

```sql
-- List all agents
SELECT computer_name, user_name, status, last_seen 
FROM agents 
ORDER BY last_seen DESC;

-- Migration statistics
SELECT status, COUNT(*) 
FROM migrations 
GROUP BY status;

-- Agent inventory count
SELECT a.computer_name, COUNT(i.id) as inventory_count
FROM agents a
LEFT JOIN inventories i ON a.id = i.agent_id
GROUP BY a.id, a.computer_name;

-- Recent activity
SELECT * FROM agents 
WHERE last_seen > NOW() - INTERVAL '1 hour';
```

### Migrations

```bash
# Create migration
cd backend
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1

# View current version
alembic current
```

---

## 🪟 Windows Agent Quick Reference

### PowerShell Commands

```powershell
# Check agent status
Get-Service PCSuccessionAgent

# Start/Stop agent
Start-Service PCSuccessionAgent
Stop-Service PCSuccessionAgent
Restart-Service PCSuccessionAgent

# View agent logs
Get-Content C:\ProgramData\PCSuccession\logs\agent-*.txt -Tail 50 -Wait

# Check agent config
Get-Content C:\ProgramData\PCSuccession\config.json | ConvertFrom-Json

# Test API connectivity
Test-NetConnection -ComputerName api.pcsuccession.com -Port 443

# View installed applications (what agent sees)
Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* |
  Select-Object DisplayName, DisplayVersion, Publisher |
  Where-Object {$_.DisplayName} |
  Sort-Object DisplayName

# Manual discovery test
cd "C:\Program Files\PCSuccession"
.\PCSuccessionAgent.exe --discover
```

### Registry Locations

```
Config: HKCU\Software\PCSuccession
Startup: HKCU\Software\Microsoft\Windows\CurrentVersion\Run
Service: HKLM\SYSTEM\CurrentControlSet\Services\PCSuccessionAgent
```

---

## 🔧 MCP Server Quick Reference

### Available Tools

| Tool | Purpose |
|------|---------|
| `install_application` | Install apps remotely |
| `configure_system` | Configure registry/env/services |
| `transfer_files` | Copy files between PCs |
| `install_certificates` | Install certificates |
| `configure_vpn` | Setup VPN connections |
| `exec_powershell` | Run PowerShell commands |
| `verify_installation` | Verify installations |

### Example Tool Calls

```json
// Install Chrome
{
  "tool": "install_application",
  "arguments": {
    "application_name": "Google Chrome",
    "installer_url": "https://dl.google.com/chrome/install/ChromeStandaloneSetup64.exe",
    "install_arguments": "/silent /install"
  }
}

// Set environment variable
{
  "tool": "configure_system",
  "arguments": {
    "config_type": "environment",
    "settings": {
      "name": "MY_VAR",
      "value": "MyValue",
      "scope": "User"
    }
  }
}

// Transfer files
{
  "tool": "transfer_files",
  "arguments": {
    "source_path": "C:\\OldPC\\Documents",
    "target_path": "C:\\NewPC\\Documents",
    "include_hidden": true
  }
}
```

---

## 🐛 Debugging Quick Reference

### Enable Debug Logging

```bash
# Backend
# Edit .env
LOG_LEVEL=DEBUG

# Agent
# Edit config.json
{
  "LogLevel": "Debug"
}

# MCP Server
# Edit src/index.ts
logger.level = 'debug';
```

### Check Logs

```bash
# Backend
tail -f backend/logs/*.log

# Dashboard (browser console)
F12 > Console

# Agent
Get-Content C:\ProgramData\PCSuccession\logs\*.txt -Tail 100

# MCP Server
tail -f mcp/mcp-server.log

# Docker
docker-compose logs -f [service-name]
```

### Network Debugging

```bash
# Check port availability
netstat -tulpn | grep LISTEN

# Test API endpoint
curl -v http://localhost:8000/health

# Check DNS
nslookup api.pcsuccession.com

# Test database connection
psql -U pcsuccession -h localhost -d pcsuccession -c "SELECT 1;"

# Test Redis
redis-cli ping
```

---

## 📊 Monitoring Quick Reference

### Health Check URLs

```
Backend:   http://localhost:8000/health
API Docs:  http://localhost:8000/docs
Dashboard: http://localhost:3000
```

### System Metrics

```bash
# Backend performance
curl http://localhost:8000/api/v1/metrics

# Database size
psql -U pcsuccession -d pcsuccession -c "
  SELECT pg_size_pretty(pg_database_size('pcsuccession'));"

# Active connections
psql -U pcsuccession -d pcsuccession -c "
  SELECT count(*) FROM pg_stat_activity;"

# Table sizes
psql -U pcsuccession -d pcsuccession -c "
  SELECT schemaname, tablename, 
         pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
  FROM pg_tables 
  WHERE schemaname = 'public' 
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

---

## 🔒 Security Quick Reference

### Password Hash

```python
from app.core.security import get_password_hash
print(get_password_hash("mypassword"))
```

### Generate Secret Key

```bash
# For .env SECRET_KEY
openssl rand -hex 32

# Or with Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Check Permissions

```bash
# File permissions
ls -la backend/.env

# Database user permissions
psql -U postgres -c "\du"

# Service user
ps aux | grep PCSuccessionAgent
```

---

## 📦 Backup & Restore

### Database Backup

```bash
# Backup
pg_dump -U pcsuccession pcsuccession > backup_$(date +%Y%m%d).sql

# Restore
psql -U pcsuccession pcsuccession < backup_20240101.sql

# Automated daily backup
(crontab -l 2>/dev/null; echo "0 2 * * * pg_dump -U pcsuccession pcsuccession > /backups/pcsuccession_\$(date +\%Y\%m\%d).sql") | crontab -
```

### Configuration Backup

```bash
# Backend
tar -czf config_backup.tar.gz backend/.env backend/config.json

# Agent (Windows)
Compress-Archive -Path "C:\ProgramData\PCSuccession\config.json" -DestinationPath "agent_config_backup.zip"
```

---

## 🚨 Emergency Procedures

### Backend Crash

```bash
# Check logs
tail -n 100 backend/logs/*.log

# Restart service
systemctl restart pcsuccession-api

# Or Docker
docker-compose restart backend
```

### Database Corruption

```bash
# Check integrity
psql -U pcsuccession pcsuccession -c "REINDEX DATABASE pcsuccession;"

# Restore from backup
systemctl stop pcsuccession-api
dropdb pcsuccession
createdb pcsuccession
psql -U pcsuccession pcsuccession < latest_backup.sql
systemctl start pcsuccession-api
```

### Agent Not Responding

```powershell
# Force restart
Stop-Service PCSuccessionAgent -Force
Start-Service PCSuccessionAgent

# Reinstall
cd C:\Temp\pcsuccession-installer
.\install-agent.bat

# Reset configuration
Remove-Item "C:\ProgramData\PCSuccession\config.json"
Restart-Service PCSuccessionAgent
```

---

## 📞 Support Contacts

- **Documentation**: [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)
- **Setup Guide**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Deployment**: [deploy/DEPLOYMENT.md](deploy/DEPLOYMENT.md)
- **Email**: support@pcsuccession.local
- **Issues**: https://github.com/nickbeentjes/PCSuccession/issues

---

## 📌 Keyboard Shortcuts (Dashboard)

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `Ctrl+K` | Command palette |
| `Ctrl+Shift+D` | Toggle dark mode |
| `Esc` | Close modal |

---

## 🎯 Common Use Cases

### Deploy Agent to 100 PCs

```bash
# Option 1: GPO
# 1. Build MSI
# 2. Create GPO
# 3. Link to OU

# Option 2: Self-service
# 1. Generate deployment link in dashboard
# 2. Send email to all users
# 3. Monitor installation in dashboard

# Option 3: Scripted
# Distribute via SCCM/Intune with configuration file
```

### Migrate User to New PC

```bash
# 1. Ensure agent installed on old PC (3-7 days of monitoring)
# 2. Install agent on new PC
# 3. Create migration in dashboard
# 4. Wait for AI plan generation (2-5 minutes)
# 5. Review plan and hardware recommendations
# 6. Click "Start Migration"
# 7. Monitor progress
# 8. Complete manual steps
# 9. Verify and close migration
```

### Generate Hardware Recommendations

```bash
# Via API
curl -X POST "http://localhost:8000/api/v1/migrations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hardware Recommendation",
    "source_agent_id": "agent-id"
  }'

# Wait for plan generation, then:
curl "http://localhost:8000/api/v1/migrations/{migration-id}" \
  | jq '.hardware_recommendation'
```

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Maintained by**: PC Succession Team

