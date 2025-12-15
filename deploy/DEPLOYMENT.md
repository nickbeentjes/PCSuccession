# PC Succession - Deployment Guide

## Prerequisites

### Server Requirements
- Linux server (Ubuntu 20.04+ recommended) or Windows Server
- PostgreSQL 15+
- Redis 7+
- Python 3.11+
- Node.js 20+
- SSL certificate for HTTPS

### Client Requirements (Target PCs)
- Windows 10/11
- .NET 8.0 Runtime
- Administrator access for installation

## Quick Start

### 1. Backend Setup

```bash
# Clone repository
    git clone https://github.com/nickbeentjes/PCSuccession.git
cd PCSuccession

# Setup backend
chmod +x deploy/setup-backend.sh
./deploy/setup-backend.sh

# Configure environment
cd backend
nano .env
# Update: DATABASE_URL, REDIS_URL, ANTHROPIC_API_KEY, SECRET_KEY
```

### 2. Dashboard Setup  	

```bash
# Setup dashboard
chmod +x deploy/setup-dashboard.sh
./deploy/setup-dashboard.sh

# Build for production
cd dashboard
npm run build
```

### 3. MCP Server Setup

```bash
# Setup MCP server
chmod +x deploy/setup-mcp.sh
./deploy/setup-mcp.sh
```

### 4. Agent Deployment

#### Option A: Manual Installation
1. Build the agent:
   ```powershell
   cd agent/PCSuccessionAgent
   dotnet publish -c Release -r win-x64 --self-contained
   ```

2. Run installer on target PC:
   ```cmd
   deploy\install-agent.bat
   ```

#### Option B: Soft Deploy (Web-based)
1. Create deployment package
2. Generate deployment link in dashboard
3. Send link to user
4. User clicks link and follows installation wizard

## Production Deployment

### Using Docker (Recommended)

```bash
# Build and start all services
docker-compose up -d
```

### Manual Production Setup

#### 1. Backend (with systemd)

```bash
# Create systemd service
sudo nano /etc/systemd/system/pcsuccession-api.service

# Content:
[Unit]
Description=PC Succession API
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/pcsuccession/backend
Environment="PATH=/opt/pcsuccession/backend/venv/bin"
ExecStart=/opt/pcsuccession/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl enable pcsuccession-api
sudo systemctl start pcsuccession-api
```

#### 2. Dashboard (with Nginx)

```nginx
# /etc/nginx/sites-available/pcsuccession
server {
    listen 80;
    listen [::]:80;
    server_name pcsuccession.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name pcsuccession.yourdomain.com;

    ssl_certificate /etc/ssl/certs/pcsuccession.crt;
    ssl_certificate_key /etc/ssl/private/pcsuccession.key;

    root /opt/pcsuccession/dashboard/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/pcsuccession /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 3. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d pcsuccession.yourdomain.com
```

## Multi-Tenant Configuration

### 1. Create First Company

```bash
# Using the API
curl -X POST http://localhost:8000/api/v1/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Company",
    "email": "admin@yourcompany.com"
  }'
```

### 2. Create Admin User

```bash
# Using Python script
cd backend
python -c "
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()
user = User(
    email='admin@yourcompany.com',
    hashed_password=get_password_hash('your-secure-password'),
    full_name='Admin User',
    is_superuser=True,
    company_id='company-id-from-step-1'
)
db.add(user)
db.commit()
"
```

## Agent Deployment Strategies

### Strategy 1: Group Policy (Domain Environments)

1. Build MSI installer
2. Deploy via GPO
3. Configure centrally

### Strategy 2: SCCM/Intune

1. Package agent as application
2. Deploy through management console
3. Monitor deployment status

### Strategy 3: Self-Service Portal

1. User receives email with deployment link
2. User clicks link and downloads installer
3. User runs installer with their credentials
4. Agent appears in dashboard automatically

## Security Best Practices

1. **Use HTTPS everywhere**
   - Backend API must use TLS 1.3
   - Dashboard must be served over HTTPS
   - Agent communication encrypted

2. **Secure secrets**
   - Store API keys in environment variables
   - Use secure credential storage for agent
   - Encrypt sensitive data at rest

3. **Access control**
   - Implement proper authentication
   - Use role-based access control
   - Audit all actions

4. **Network security**
   - Firewall rules for API
   - VPN for agent communication (optional)
   - Rate limiting on API endpoints

5. **Regular updates**
   - Keep all components updated
   - Monitor security advisories
   - Implement automated patching

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Database connection
psql -U pcsuccession -c "SELECT 1;"

# Redis connection
redis-cli ping
```

### Logs

- Backend logs: `/var/log/pcsuccession/api.log`
- Agent logs: `C:\ProgramData\PCSuccession\logs\`
- Nginx logs: `/var/log/nginx/`

### Backups

```bash
# Database backup
pg_dump -U pcsuccession pcsuccession > backup_$(date +%Y%m%d).sql

# Automated daily backups
echo "0 2 * * * pg_dump -U pcsuccession pcsuccession > /backups/pcsuccession_$(date +\%Y\%m\%d).sql" | crontab -
```

## Troubleshooting

### Agent not connecting
1. Check firewall rules
2. Verify API URL in agent config
3. Check network connectivity
4. Review agent logs

### Dashboard not loading
1. Check Nginx configuration
2. Verify API proxy settings
3. Check browser console for errors
4. Review Nginx logs

### Migration failing
1. Check Claude API key
2. Review migration logs
3. Verify target PC connectivity
4. Check MCP server status

## Support

- Documentation: https://docs.pcsuccession.local
- Issues: https://github.com/nickbeentjes/PCSuccession/issues
- Email: support@pcsuccession.local

