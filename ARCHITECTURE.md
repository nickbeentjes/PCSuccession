# PC Succession - System Architecture

## High-Level Overview

```
                                    ┌─────────────────────────┐
                                    │                         │
                                    │   IT Administrator      │
                                    │   or End User           │
                                    │                         │
                                    └────────────┬────────────┘
                                                 │
                                                 │ HTTPS
                                                 ↓
                    ┌──────────────────────────────────────────────────┐
                    │                                                  │
                    │          Web Dashboard (React/TypeScript)       │
                    │                                                  │
                    │  • Agent Management                              │
                    │  • Migration Planning UI                         │
                    │  • Real-time Progress                           │
                    │  • Hardware Recommendations                      │
                    │  • Deployment Links                             │
                    │                                                  │
                    └────────────────────┬─────────────────────────────┘
                                         │
                                         │ REST API (HTTPS)
                                         ↓
        ┌────────────────────────────────────────────────────────────────┐
        │                                                                │
        │              Backend API Server (Python/FastAPI)               │
        │                                                                │
        │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
        │  │   Company &  │  │    Agent     │  │  Migration   │       │
        │  │     User     │  │  Management  │  │  Planning    │       │
        │  │  Management  │  │              │  │              │       │
        │  └──────────────┘  └──────────────┘  └──────────────┘       │
        │                                                                │
        │  ┌──────────────────────────────────────────────────┐        │
        │  │                                                  │        │
        │  │         Claude AI Integration (Anthropic)        │        │
        │  │                                                  │        │
        │  │  • Analyze inventory data                        │        │
        │  │  • Generate migration plans                      │        │
        │  │  • Determine installation order                  │        │
        │  │  • Create hardware recommendations               │        │
        │  │  • Identify optimization opportunities           │        │
        │  │                                                  │        │
        │  └──────────────────────────────────────────────────┘        │
        │                                                                │
        └──────┬────────────────────────────┬──────────────────┬────────┘
               │                            │                  │
               │                            │                  │
        ┌──────▼─────┐              ┌──────▼──────┐    ┌──────▼──────┐
        │            │              │             │    │             │
        │ PostgreSQL │              │    Redis    │    │   Celery    │
        │            │              │             │    │   Workers   │
        │ • Companies│              │ • Caching   │    │             │
        │ • Users    │              │ • Sessions  │    │ • Background│
        │ • Agents   │              │ • Queues    │    │   Tasks     │
        │ • Inventory│              │             │    │             │
        │ • Migrations│             │             │    │             │
        │            │              │             │    │             │
        └────────────┘              └─────────────┘    └─────────────┘


                            Source PC                         Target PC
                        ┌──────────────┐                 ┌──────────────┐
                        │              │                 │              │
                        │   Windows    │                 │   Windows    │
                        │    Agent     │                 │    Agent     │
                        │    (C#)      │                 │    (C#)      │
                        │              │                 │              │
                        │ • Discovery  │                 │ • Receives   │
                        │ • Monitoring │                 │   configs    │
                        │ • Inventory  │                 │              │
                        │ • Usage      │                 └──────┬───────┘
                        │   Tracking   │                        │
                        │              │                        │
                        └──────┬───────┘                        │
                               │                                │
                               │ Reports to API                 │ MCP Commands
                               │                                │
                               └────────────┬───────────────────┘
                                            │
                                            ↓
                                ┌───────────────────────┐
                                │                       │
                                │    MCP Server         │
                                │    (Node.js)          │
                                │                       │
                                │ • Task Execution      │
                                │ • PowerShell Commands │
                                │ • File Transfer       │
                                │ • App Installation    │
                                │ • System Config       │
                                │                       │
                                └───────────────────────┘
```

## Data Flow Diagrams

### Agent Registration & Discovery Flow

```
┌─────────┐                                  ┌─────────┐                 ┌──────────┐
│         │    1. Install & Register         │         │    3. Store     │          │
│  Agent  ├──────────────────────────────────▶   API   ├─────────────────▶ Database │
│         │                                  │         │                 │          │
└────┬────┘                                  └────┬────┘                 └──────────┘
     │                                            │
     │  2. Discover System                       │
     │     • Apps                                 │  4. Return Agent ID
     │     • Certs                                │     & Config
     │     • VPN                                  │
     │     • Data                                 │
     │                                            │
     └────────────────────────────────────────────┘
```

### Usage Monitoring Flow

```
┌─────────┐                                  ┌─────────┐                 ┌──────────┐
│         │  Every 15 minutes               │         │                 │          │
│  Agent  │  • App usage                     │   API   │                 │ Database │
│         │  • Performance                   │         │                 │          │
│         ├──────────────────────────────────▶         ├─────────────────▶          │
│         │  • File access                   │         │                 │          │
│         │                                  │         │                 │          │
└─────────┘                                  └─────────┘                 └──────────┘
```

### Migration Planning Flow

```
┌──────────┐       ┌─────────┐       ┌──────────┐       ┌────────────┐
│          │   1.  │         │   2.  │          │   3.  │            │
│Dashboard ├───────▶   API   ├───────▶ Database ├───────▶ Claude AI  │
│          │Create │         │ Get   │          │Analyze│            │
│          │       │         │ Data  │          │       │            │
└──────────┘       └────┬────┘       └──────────┘       └─────┬──────┘
                        │                                      │
                        │  5. Store Migration Plan             │
                        │                                      │
                        │                 4. Generate Plan:    │
                        │                    • Tasks           │
                        │                    • Order           │
                        │                    • Hardware Spec   │
                        │                    • Recommendations │
                        │                                      │
                        └──────────────────────────────────────┘
```

### Migration Execution Flow

```
┌──────────┐     ┌─────────┐     ┌────────────┐     ┌──────────┐     ┌─────────┐
│Dashboard │  1. │   API   │  2. │  Claude    │  3. │   MCP    │  4. │ Target  │
│          ├─────▶         ├─────▶   with     ├─────▶  Server  ├─────▶  Agent  │
│          │Start│         │Queue│    MCP     │Send │          │Exec │         │
│          │     │         │Task │            │Tools│          │Cmds │         │
└──────┬───┘     └────┬────┘     └────────────┘     └────┬─────┘     └────┬────┘
       │              │                                    │                │
       │              │                                    │  5. Results    │
       │              │                                    │◀───────────────┘
       │              │  6. Update Progress                │
       │              │◀───────────────────────────────────┘
       │              │
       │  7. Show Status                                   
       │◀─────────────┘
```

## Component Details

### Windows Agent Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     Windows Agent (C#)                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────┐         ┌──────────────────┐       │
│  │  System Tray UI  │         │  Windows Service │       │
│  │                  │         │                  │       │
│  │  • Status View   │         │  • Background    │       │
│  │  • Settings      │         │    Worker        │       │
│  │  • Manual Sync   │         │  • Auto-start    │       │
│  └──────────────────┘         └─────────┬────────┘       │
│                                          │                │
│  ┌────────────────────────────────────────────────────┐  │
│  │               Core Services                        │  │
│  ├────────────────────────────────────────────────────┤  │
│  │                                                    │  │
│  │  ┌─────────────────┐     ┌──────────────────┐    │  │
│  │  │ Discovery       │     │ Monitoring       │    │  │
│  │  │ Service         │     │ Service          │    │  │
│  │  │                 │     │                  │    │  │
│  │  │ • WMI Queries   │     │ • Process Watch  │    │  │
│  │  │ • Registry Read │     │ • File Access    │    │  │
│  │  │ • Cert Store    │     │ • Performance    │    │  │
│  │  │ • VPN Config    │     │ • Usage Patterns │    │  │
│  │  └─────────────────┘     └──────────────────┘    │  │
│  │                                                    │  │
│  │  ┌─────────────────┐     ┌──────────────────┐    │  │
│  │  │ API Client      │     │ Configuration    │    │  │
│  │  │                 │     │ Service          │    │  │
│  │  │ • HTTP Client   │     │                  │    │  │
│  │  │ • Auth          │     │ • Settings       │    │  │
│  │  │ • Retry Logic   │     │ • Credentials    │    │  │
│  │  │ • Queue         │     │ • Encryption     │    │  │
│  │  └─────────────────┘     └──────────────────┘    │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Backend API Architecture

```
┌────────────────────────────────────────────────────────────┐
│                  Backend API (FastAPI)                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                    API Routes                        │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │  /auth  │ /companies │ /users │ /agents │ /migrations│ │
│  └────────────────────┬─────────────────────────────────┘ │
│                       │                                    │
│  ┌────────────────────▼─────────────────────────────────┐ │
│  │              Business Logic Layer                    │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │                                                      │ │
│  │  ┌───────────────┐    ┌───────────────────────┐    │ │
│  │  │   Agent       │    │    Migration          │    │ │
│  │  │   Service     │    │    Service            │    │ │
│  │  │               │    │                       │    │ │
│  │  │ • Register    │    │ • Plan Generation     │    │ │
│  │  │ • Inventory   │    │ • Execution           │    │ │
│  │  │ • Monitoring  │    │ • Status Tracking     │    │ │
│  │  └───────────────┘    └───────────┬───────────┘    │ │
│  │                                   │                │ │
│  │  ┌───────────────────────────────▼──────────────┐ │ │
│  │  │         AI Service (Claude)                  │ │ │
│  │  │                                              │ │ │
│  │  │ • Analyze Inventory                          │ │ │
│  │  │ • Generate Migration Plans                   │ │ │
│  │  │ • Create Hardware Recommendations            │ │ │
│  │  │ • Determine Task Order                       │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  │                                                      │ │
│  └──────────────────────┬───────────────────────────────┘ │
│                         │                                  │
│  ┌──────────────────────▼───────────────────────────────┐ │
│  │              Data Access Layer (ORM)                 │ │
│  └──────────────────────┬───────────────────────────────┘ │
│                         │                                  │
│  ┌──────────────────────▼───────────────────────────────┐ │
│  │                  PostgreSQL Database                 │ │
│  │                                                      │ │
│  │  Companies │ Users │ Agents │ Inventories │ Migrations│ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### MCP Server Architecture

```
┌────────────────────────────────────────────────────────────┐
│              MCP Server (Node.js/TypeScript)               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │             MCP Protocol Handler                     │ │
│  │                                                      │ │
│  │  • Tool Definitions                                  │ │
│  │  • Request Router                                    │ │
│  │  • Response Formatter                                │ │
│  └────────────────────┬─────────────────────────────────┘ │
│                       │                                    │
│  ┌────────────────────▼─────────────────────────────────┐ │
│  │                  Tool Implementations                │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │                                                      │ │
│  │  ┌─────────────────┐    ┌──────────────────────┐   │ │
│  │  │ install_        │    │ configure_system     │   │ │
│  │  │ application     │    │                      │   │ │
│  │  │                 │    │ • Registry           │   │ │
│  │  │ • Download      │    │ • Environment        │   │ │
│  │  │ • Install       │    │ • Services           │   │ │
│  │  │ • Verify        │    │ • Firewall           │   │ │
│  │  └─────────────────┘    └──────────────────────┘   │ │
│  │                                                      │ │
│  │  ┌─────────────────┐    ┌──────────────────────┐   │ │
│  │  │ transfer_files  │    │ exec_powershell      │   │ │
│  │  │                 │    │                      │   │ │
│  │  │ • Copy          │    │ • Execute            │   │ │
│  │  │ • Verify        │    │ • Return Output      │   │ │
│  │  │ • Permissions   │    │ • Error Handling     │   │ │
│  │  └─────────────────┘    └──────────────────────┘   │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                      Security Layers                          │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Layer 1: Network Security                               │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ • TLS 1.3 for all communications                        │ │
│  │ • Certificate validation                                 │ │
│  │ • Firewall rules                                        │ │
│  │ • DDoS protection                                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Layer 2: Authentication & Authorization                 │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ • OAuth2/JWT tokens                                     │ │
│  │ • Bcrypt password hashing                               │ │
│  │ • Role-Based Access Control (RBAC)                      │ │
│  │ • Multi-tenant isolation                                │ │
│  │ • Session management                                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Layer 3: Data Security                                  │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ • Encryption at rest (AES-256)                          │ │
│  │ • Encrypted database connections                        │ │
│  │ • Secure credential storage                             │ │
│  │ • Data sanitization                                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Layer 4: Application Security                           │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ • Input validation                                      │ │
│  │ • SQL injection prevention (ORM)                        │ │
│  │ • XSS protection                                        │ │
│  │ • CSRF tokens                                           │ │
│  │ • Rate limiting                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Layer 5: Audit & Monitoring                             │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ • Comprehensive logging                                 │ │
│  │ • Activity audit trail                                  │ │
│  │ • Anomaly detection                                     │ │
│  │ • Alert system                                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Deployment Architecture (Production)

```
                                    ┌─────────────┐
                                    │   Clients   │
                                    └──────┬──────┘
                                           │
                                           │ HTTPS
                                           ↓
                              ┌────────────────────────┐
                              │   Load Balancer (CDN)  │
                              │   • SSL Termination    │
                              │   • DDoS Protection    │
                              └──────────┬─────────────┘
                                         │
                      ┌──────────────────┴──────────────────┐
                      │                                     │
            ┌─────────▼─────────┐              ┌──────────▼──────────┐
            │  Nginx (Static)   │              │  Nginx (API Proxy)  │
            │                   │              │                     │
            │  Dashboard Files  │              │  Rate Limiting      │
            └───────────────────┘              └──────────┬──────────┘
                                                          │
                                        ┌─────────────────┴─────────────────┐
                                        │                                   │
                             ┌──────────▼──────────┐         ┌─────────────▼─────────────┐
                             │   API Server 1      │         │    API Server 2           │
                             │   (Docker/PM2)      │         │    (Docker/PM2)           │
                             └──────────┬──────────┘         └─────────────┬─────────────┘
                                        │                                   │
                                        └──────────────┬────────────────────┘
                                                       │
                          ┌────────────────────────────┼────────────────────────────┐
                          │                            │                            │
                ┌─────────▼─────────┐    ┌────────────▼───────────┐   ┌───────────▼──────────┐
                │  PostgreSQL       │    │   Redis                │   │   Celery Workers     │
                │  (Primary)        │    │   • Cache              │   │   • Background Tasks │
                │                   │    │   • Sessions           │   │   • Async Jobs       │
                └─────────┬─────────┘    │   • Queue              │   └──────────────────────┘
                          │              └────────────────────────┘
                ┌─────────▼─────────┐
                │  PostgreSQL       │
                │  (Replica)        │
                │  (Read-only)      │
                └───────────────────┘


        ┌─────────────────┐                              ┌─────────────────┐
        │  Source PCs     │                              │  Target PCs     │
        │  (Agents)       │                              │  (Agents + MCP) │
        └─────────────────┘                              └─────────────────┘
```

---

**Note**: This is a living document. The architecture evolves as the system grows.

Last Updated: December 2024

