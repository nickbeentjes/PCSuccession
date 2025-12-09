# 🖥️ PC Succession System

**AI-Powered PC Migration Platform**

Automate the discovery, analysis, and migration of Windows PCs to new hardware using Claude AI and the Model Context Protocol (MCP).

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://python.org)
[![.NET](https://img.shields.io/badge/.NET-8.0-purple.svg)](https://dotnet.microsoft.com)
[![React](https://img.shields.io/badge/react-18+-61dafb.svg)](https://react.dev)

---

## 🎯 What is PC Succession?

PC Succession is a comprehensive system that eliminates the pain of PC migrations by:

1. **Discovering** everything on the old PC (apps, settings, data, certificates, VPN configs)
2. **Monitoring** usage patterns to understand what's actually important
3. **Planning** the optimal migration strategy using Claude AI
4. **Executing** the migration automatically via MCP
5. **Recommending** ideal hardware specs for the new PC

**Perfect for:**
- IT departments managing PC refreshes
- MSPs handling client migrations
- Organizations upgrading their fleet
- Anyone tired of manual PC migrations

---

## ✨ Key Features

### 🔍 Intelligent Discovery
- ✅ Complete software inventory
- ✅ Registry settings and configurations
- ✅ Certificates and crypto keys
- ✅ VPN connections
- ✅ User data locations
- ✅ Usage pattern analysis
- ✅ Application usage tracking

### 🤖 AI-Powered Migration
- ✅ Claude AI generates migration plans
- ✅ Optimal installation order
- ✅ Dependency resolution
- ✅ Automated configuration
- ✅ Progress tracking
- ✅ Manual step documentation

### 💻 Hardware Recommendations
- ✅ Usage-based spec recommendations
- ✅ Performance optimization tips
- ✅ Cost-benefit analysis
- ✅ Real data from actual usage

### 🔐 Enterprise Security
- ✅ Multi-tenant SaaS architecture
- ✅ TLS 1.3 encryption
- ✅ Secure credential storage
- ✅ Audit logging
- ✅ RBAC

---

## 🚀 Quick Start

### 📋 Prerequisites

**Server:**
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

**Client (Windows):**
- Windows 10/11
- .NET 8.0 Runtime

### ⚡ 5-Minute Setup

```bash
# 1. Clone the repository
git clone https://github.com/nickbeentjes/PCSuccession.git
cd PCSuccession

# 2. Setup backend
./deploy/setup-backend.sh

# 3. Setup dashboard
./deploy/setup-dashboard.sh

# 4. Setup MCP server
./deploy/setup-mcp.sh

# 5. Start services (in separate terminals)
cd backend && uvicorn main:app --reload
cd dashboard && npm run dev
cd mcp && npm start
```

**Or use Docker:**
```bash
docker-compose up -d
```

**Detailed guide:** See [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Complete installation and configuration guide |
| [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md) | Full system architecture and API docs |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Command reference and troubleshooting |
| [deploy/DEPLOYMENT.md](deploy/DEPLOYMENT.md) | Production deployment guide |

---

## 🏗️ Architecture

```
┌─────────────┐
│   Browser   │ ← React Dashboard
└──────┬──────┘
       │ HTTPS
       ↓
┌─────────────┐
│  Backend    │ ← FastAPI + PostgreSQL + Redis
│     +       │
│  Claude AI  │ ← Migration Planning & Analysis
└──────┬──────┘
       │
   ┌───┴────┐
   │        │
   ↓        ↓
┌────────┐ ┌────────┐
│ Agent  │ │  MCP   │ ← Automated Task Execution
│ (C#)   │ │ Server │
└────────┘ └────────┘
 Old PC     New PC
```

**Components:**
- **Windows Agent** (C# .NET): Discovers and monitors PCs
- **Backend API** (Python FastAPI): Orchestrates everything
- **Web Dashboard** (React/TS): Beautiful management interface
- **MCP Server** (Node.js): Executes migration tasks via Claude
- **Claude AI**: Plans migrations and generates recommendations

---

## 💡 How It Works

### Step 1: Deploy Agent
Install the lightweight agent on the source PC. It runs quietly in the background (< 1% CPU, < 50MB RAM).

### Step 2: Monitor (3-7 days)
The agent learns usage patterns:
- Which apps are actually used
- How much data exists and where
- System performance characteristics

### Step 3: Plan Migration
Click "Create Migration" in the dashboard. Claude AI analyzes the data and creates:
- Installation order (with dependencies)
- Hardware recommendations
- Step-by-step migration plan
- Risk assessment

### Step 4: Execute
Install the agent on the new PC. Click "Start Migration" and Claude uses MCP to:
- Install applications
- Transfer files
- Configure settings
- Install certificates
- Setup VPN connections

### Step 5: Verify & Complete
The dashboard shows real-time progress. When done, it lists any manual steps needed.

---

## 🎯 Use Cases

### IT Department PC Refresh
- Deploy agents across entire fleet
- Get hardware recommendations for budgeting
- Migrate users systematically
- Track progress centrally

### MSP Client Migrations
- Multi-tenant support
- White-label ready
- Per-client dashboards
- Automated reporting

### User PC Upgrades
- Self-service deployment links
- Minimal user involvement
- Automated backup and restore
- Zero data loss

---

## 📊 Features at a Glance

| Feature | Status | Description |
|---------|--------|-------------|
| Software Discovery | ✅ | Complete inventory of installed applications |
| Usage Monitoring | ✅ | Track which apps are actually used |
| Certificate Discovery | ✅ | Find and migrate certificates |
| VPN Discovery | ✅ | Detect and migrate VPN configs |
| AI Migration Planning | ✅ | Claude generates optimal migration strategy |
| Hardware Recommendations | ✅ | AI suggests ideal specs based on usage |
| Automated Installation | ✅ | MCP executes installations remotely |
| Progress Tracking | ✅ | Real-time migration status |
| Multi-tenant SaaS | ✅ | Support multiple companies |
| Web Dashboard | ✅ | Beautiful React interface |
| REST API | ✅ | Full programmatic access |
| Deployment Links | ✅ | One-click agent installation |

---

## 🛠️ Technology Stack

**Backend:**
- Python 3.11 + FastAPI
- PostgreSQL 15
- Redis 7
- SQLAlchemy ORM
- Alembic migrations
- Claude AI (Anthropic)

**Dashboard:**
- React 18
- TypeScript
- Vite
- TanStack Query
- Tailwind CSS
- Recharts

**Agent:**
- C# .NET 8.0
- Windows Forms
- Windows Services
- WMI
- Registry API

**MCP Server:**
- Node.js 20
- TypeScript
- MCP SDK
- PowerShell integration

---

## 📈 Performance

- **Agent Overhead:** < 1% CPU, < 50MB RAM
- **API Response Time:** < 200ms average
- **Dashboard Load:** < 2 seconds
- **Migration Speed:** Varies by data size
- **Concurrent Migrations:** Unlimited (Claude API rate limits apply)

---

## 🔒 Security

- **TLS 1.3** for all communications
- **JWT** authentication with secure tokens
- **Bcrypt** password hashing
- **Encrypted** secrets at rest
- **Multi-tenant** data isolation
- **Audit** logging of all actions
- **RBAC** for user permissions

---

## 📱 Deployment Options

### Docker (Recommended)
```bash
docker-compose up -d
```

### Traditional Server
```bash
# Backend with systemd
sudo systemctl start pcsuccession-api

# Dashboard with Nginx
sudo systemctl start nginx

# MCP Server
npm start
```

### Cloud Platforms
- AWS (EC2 + RDS + ElastiCache)
- Azure (App Service + Database + Redis)
- GCP (Cloud Run + Cloud SQL + Memorystore)

---

## 🧪 Testing

```bash
# Backend tests
cd backend && pytest

# Agent tests (Windows)
cd agent\PCSuccessionAgent.Tests && dotnet test

# Dashboard tests
cd dashboard && npm test

# Integration tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 📄 License

Proprietary - Internal Use Only

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 💬 Support

- **📧 Email:** support@pcsuccession.local
- **📖 Documentation:** [Full docs](SYSTEM_DOCUMENTATION.md)
- **🐛 Issues:** [GitHub Issues](https://github.com/nickbeentjes/PCSuccession/issues)
- **💬 Discussions:** [GitHub Discussions](https://github.com/nickbeentjes/PCSuccession/discussions)

---

## 🙏 Acknowledgments

- **Anthropic** for Claude AI and the MCP protocol
- **FastAPI** for the excellent Python framework
- **React** team for the UI framework
- **Microsoft** for .NET and Windows APIs

---

## 🗺️ Roadmap

- [ ] macOS agent support
- [ ] Linux agent support
- [ ] Mobile app for monitoring
- [ ] Slack/Teams notifications
- [ ] Advanced analytics dashboard
- [ ] Cost optimization recommendations
- [ ] Integration with ITSM tools (ServiceNow, Jira)
- [ ] Automated testing of migrated PCs
- [ ] Rollback capabilities
- [ ] Cloud PC migration support

---

**Built with ❤️ by the PC Succession team**

*Making PC migrations painless since 2024*

