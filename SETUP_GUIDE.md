# PC Succession System - Complete Setup Guide

## 🎯 Quick Start - Get Running in 15 Minutes

### Step 1: Prerequisites

**Windows (for Agent development/testing):**
- Windows 10/11
- Visual Studio 2022 or .NET 8.0 SDK
- Git

**Server (Linux/Mac for Backend & Dashboard):**
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Step 2: Clone and Setup

```bash
# Clone repository
git clone https://github.com/yourusername/pcsuccession.git
cd pcsuccession

# Make scripts executable (Linux/Mac)
chmod +x deploy/*.sh
```

### Step 3: Backend Setup

```bash
# Run automated setup
./deploy/setup-backend.sh

# Manual alternative:
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env  # Edit with your settings

# Setup database
createdb pcsuccession
alembic upgrade head

# Start server
python -m uvicorn main:app --reload
```

**Backend will be running at: http://localhost:8000**
**API Docs: http://localhost:8000/docs**

### Step 4: Dashboard Setup

```bash
# Run automated setup
./deploy/setup-dashboard.sh

# Manual alternative:
cd dashboard
npm install

# Create .env
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env

# Start development server
npm run dev
```

**Dashboard will be running at: http://localhost:3000**

### Step 5: Agent Setup (Windows)

```powershell
# Open PowerShell as Administrator
cd agent\PCSuccessionAgent

# Restore dependencies
dotnet restore

# Build
dotnet build -c Release

# Run (for testing)
dotnet run

# OR create installer
cd ..\..\deploy
.\install-agent.bat
```

### Step 6: MCP Server Setup

```bash
# Run automated setup
./deploy/setup-mcp.sh

# Manual alternative:
cd mcp
npm install
npm run build

# Start MCP server
npm start
```

### Step 7: Create First Company and User

```bash
# Start Python shell in backend directory
cd backend
source venv/bin/activate
python

# In Python:
from app.db.session import SessionLocal
from app.models.company import Company
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()

# Create company
company = Company(
    name="My Company",
    email="admin@mycompany.com"
)
db.add(company)
db.commit()
db.refresh(company)

# Create admin user
user = User(
    email="admin@mycompany.com",
    hashed_password=get_password_hash("admin123"),
    full_name="Admin User",
    is_superuser=True,
    is_active=True,
    company_id=company.id
)
db.add(user)
db.commit()

print(f"Company ID: {company.id}")
print(f"User ID: {user.id}")
print("Login: admin@mycompany.com / admin123")

exit()
```

### Step 8: Test the System

1. **Open Dashboard**: http://localhost:3000
2. **Login** with credentials from Step 7
3. **Deploy Agent** on a test Windows PC
4. **Wait 5-10 minutes** for first inventory
5. **Create Migration** from dashboard
6. **View AI Recommendations**

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│                   (Dashboard - React)                        │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Server                        │
│              (FastAPI + PostgreSQL + Redis)                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Agents     │  │  Migrations  │  │  Companies   │     │
│  │  Management  │  │   Planning   │  │    & Users   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Claude AI Integration (Anthropic)            │  │
│  │        • Migration Planning                          │  │
│  │        • Hardware Recommendations                    │  │
│  │        • Task Generation                             │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬──────────────────────────────────────┬─────────┘
             │                                       │
             │ HTTPS/REST                           │ MCP Protocol
             ↓                                       ↓
┌─────────────────────────┐         ┌─────────────────────────┐
│   Windows Agent (C#)    │         │    MCP Server (Node)    │
│                         │         │                         │
│  • System Discovery     │         │  • Remote Commands      │
│  • Usage Monitoring     │         │  • App Installation     │
│  • Data Collection      │         │  • Configuration        │
│  • System Tray UI       │         │  • File Transfer        │
│                         │         │  • Verification         │
└─────────────────────────┘         └─────────────────────────┘
         (Source PC)                      (Target PC)
```

---

## 🚀 Production Deployment

### Option 1: Docker Compose (Recommended)

```bash
# Create .env file with production settings
cat > .env << EOF
DB_PASSWORD=your-secure-password
ANTHROPIC_API_KEY=sk-ant-your-key
SECRET_KEY=$(openssl rand -hex 32)
EOF

# Start all services
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

Services will be available:
- Dashboard: http://localhost:3000
- API: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Option 2: Traditional Server Deployment

See [deploy/DEPLOYMENT.md](deploy/DEPLOYMENT.md) for:
- Nginx configuration
- Systemd service setup
- SSL certificate installation
- Production security hardening
- Monitoring and maintenance

---

## 🔐 Security Configuration

### 1. Generate Secure Keys

```bash
# Secret key for JWT tokens
openssl rand -hex 32

# API keys
# Get Claude API key from: https://console.anthropic.com/
```

### 2. Configure HTTPS

```bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d pcsuccession.yourdomain.com
```

### 3. Firewall Rules

```bash
# Allow necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 4. Database Security

```bash
# Create strong password
DB_PASSWORD=$(openssl rand -base64 32)

# Configure PostgreSQL authentication
sudo nano /etc/postgresql/15/main/pg_hba.conf
# Set: local all all md5
```

---

## 📱 Agent Deployment Methods

### Method 1: Manual Installation

1. Build agent:
```powershell
cd agent\PCSuccessionAgent
dotnet publish -c Release -r win-x64 --self-contained
```

2. Copy to target PC

3. Run installer:
```cmd
deploy\install-agent.bat
```

### Method 2: Group Policy (Domain)

1. Create MSI installer
2. Create GPO
3. Link to target OU
4. Wait for policy refresh

### Method 3: Self-Service Web Portal

1. Generate deployment link in dashboard
2. Send link to user via email
3. User clicks link
4. Downloads and runs installer
5. Agent appears in dashboard

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
pytest --cov=app tests/
```

### Agent Tests

```powershell
cd agent\PCSuccessionAgent.Tests
dotnet test
```

### Integration Tests

```bash
# Start all services
docker-compose up -d

# Run integration tests
cd tests
pytest integration/
```

---

## 📊 Monitoring

### Health Checks

```bash
# Backend
curl http://localhost:8000/health

# Database
psql -U pcsuccession -c "SELECT COUNT(*) FROM agents;"

# Redis
redis-cli ping
```

### Logs

```bash
# Backend logs
tail -f backend/logs/app.log

# Agent logs (Windows)
Get-Content C:\ProgramData\PCSuccession\logs\agent.log -Tail 50 -Wait

# Docker logs
docker-compose logs -f backend
```

### Metrics

- **Agent Response Time**: < 100ms
- **API Response Time**: < 200ms
- **Dashboard Load Time**: < 2s
- **Agent CPU Usage**: < 1%
- **Agent Memory Usage**: < 50MB

---

## 🔧 Common Issues & Solutions

### Issue: Agent not connecting to backend

**Solution:**
```powershell
# Check agent config
Get-Content C:\ProgramData\PCSuccession\config.json

# Test connectivity
Test-NetConnection -ComputerName api.pcsuccession.com -Port 443

# Check firewall
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*PCSuccession*"}

# Restart agent service
Restart-Service PCSuccessionAgent
```

### Issue: Database connection failed

**Solution:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U pcsuccession -h localhost -d pcsuccession

# Check credentials in .env
cat backend/.env | grep DATABASE_URL
```

### Issue: Claude API errors

**Solution:**
```bash
# Verify API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-3-opus-20240229","max_tokens":1024,"messages":[{"role":"user","content":"Hello"}]}'

# Check rate limits
# Check account credits at console.anthropic.com
```

---

## 📚 Additional Resources

### Documentation
- **System Overview**: [README.md](README.md)
- **Deployment Guide**: [deploy/DEPLOYMENT.md](deploy/DEPLOYMENT.md)
- **System Documentation**: [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)
- **API Documentation**: http://localhost:8000/docs

### Links
- Claude AI Documentation: https://docs.anthropic.com/
- FastAPI Documentation: https://fastapi.tiangolo.com/
- React Documentation: https://react.dev/
- .NET Documentation: https://docs.microsoft.com/dotnet/

### Support
- Email: support@pcsuccession.local
- Issues: https://github.com/yourusername/pcsuccession/issues

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend API is running and accessible
- [ ] Dashboard loads and displays properly
- [ ] Can create company and user accounts
- [ ] Can log in to dashboard
- [ ] Agent installs on Windows PC
- [ ] Agent appears in dashboard after installation
- [ ] Agent sends inventory data
- [ ] Can create migration plan
- [ ] AI generates recommendations
- [ ] MCP server can connect to target PC
- [ ] Can execute test migration task

---

## 🎉 Success!

You now have a fully functional PC Succession system!

**Next Steps:**
1. Deploy agents to test PCs
2. Wait 3-7 days for usage pattern data
3. Create your first migration
4. Review AI recommendations
5. Execute migration on new hardware

**Need Help?**
- Check the troubleshooting section above
- Review logs for error messages
- Contact support: support@pcsuccession.local

---

## 📝 Notes

- **Minimum Monitoring Period**: 3 days (7 days recommended)
- **Concurrent Migrations**: Unlimited (but Claude API has rate limits)
- **Agent Overhead**: < 1% CPU, < 50MB RAM
- **Supported Windows**: 10, 11 (64-bit)
- **Supported Browsers**: Chrome, Edge, Firefox, Safari

---

Created with ❤️ for IT administrators who want to make PC migrations painless!

