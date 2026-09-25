# EQInt Savvy - Full Application Monorepo

This monorepo combines both components of the EQInt Savvy application into a single repository that can be cloned and run with one command.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      eqint-savvy-full (this repo)               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │ eqint-savvy-desktop     │  │ hcm-ai-agent                │  │
│  │ (submodule)             │  │ (submodule)                 │  │
│  │                         │  │                             │  │
│  │ • Electron Desktop App  │  │ • FastAPI Python Backend    │  │
│  │ • React Overlay UI      │  │ • Oracle HCM REST/SOAP      │  │
│  │ • Node.js/Fastify API   │  │ • Payroll Reconciliation    │  │
│  │   (Port 4000)           │  │ • RAG Pipeline + Vector DB  │  │
│  │ • Prisma + PostgreSQL   │  │   (Port 8080)               │  │
│  └─────────────────────────┘  └─────────────────────────────┘  │
│           │                              │                      │
│           └──────────────┬───────────────┘                      │
│                          ▼                                      │
│              ┌───────────────────────┐                          │
│              │ Shared Infrastructure │                          │
│              │ • PostgreSQL (5432)   │                          │
│              │ • Redis (6379)        │                          │
│              └───────────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start (Windows)

### Option 1: One-click Batch File (Easiest)
```cmd
git clone --recurse-submodules https://github.com/Chetanya-Kaushal/eqint-savvy-full.git
cd eqint-savvy-full
start-windows.bat
```

### Option 2: PowerShell (More Control)
```powershell
git clone --recurse-submodules https://github.com/Chetanya-Kaushal/eqint-savvy-full.git
cd eqint-savvy-full
.\start-windows.ps1
```

### Option 3: Cross-platform (Node.js)
```bash
git clone --recurse-submodules https://github.com/Chetanya-Kaushal/eqint-savvy-full.git
cd eqint-savvy-full
npm install
npm start
```

## What Happens Automatically

The startup scripts will:

1. **Check prerequisites** - Node.js 18+, Python 3.11+, Docker (optional)
2. **Start infrastructure** - PostgreSQL & Redis via Docker Compose
3. **Set up Python backend** - Creates venv, installs dependencies from `requirements.txt`
4. **Set up Node.js backend** - Installs dependencies, runs Prisma migrations
5. **Start all services**:
   - HCM AI Python API → `http://localhost:8080`
   - Savvy Node.js API → `http://localhost:4000`
   - Electron Desktop App → Opens in new window

## Manual Setup (If Automatic Fails)

### Prerequisites
- **Node.js 18+** - https://nodejs.org/
- **Python 3.11+** - https://python.org/
- **Docker Desktop** - https://docker.com/products/docker-desktop/ (for PostgreSQL/Redis)
- **Git** - https://git-scm.com/

### Clone with Submodules
```bash
git clone --recurse-submodules https://github.com/Chetanya-Kaushal/eqint-savvy-full.git
cd eqint-savvy-full
```

### If Already Cloned Without Submodules
```bash
git submodule update --init --recursive
```

### Configure Environment Variables

#### HCM AI Python Backend (`hcm-ai-agent/.env`)
```bash
cd hcm-ai-agent
cp .env.example .env
# Edit .env with your Oracle HCM credentials:
# - ORACLE_HCM_FUSION_URL
# - ORACLE_HCM_USERNAME
# - ORACLE_HCM_PASSWORD
# - ORACLE_HCM_TENANT_ID
# - Database/Redis URLs (defaults work with Docker)
```

#### Savvy Desktop Backend (`eqint-savvy-desktop/backend/.env`)
```bash
cd eqint-savvy-desktop/backend
cp .env.example .env
# Edit .env with:
# - DATABASE_URL (PostgreSQL)
# - SESSION_JWT_SECRET (generate: openssl rand -base64 32)
# - FIELD_ENCRYPTION_KEY (generate: openssl rand -base64 32)
# - OIDC_* settings (your Identity Provider)
```

### Start Services Manually

**Terminal 1 - Infrastructure:**
```bash
cd eqint-savvy-desktop/backend
docker-compose up -d
```

**Terminal 2 - Python Backend (Port 8080):**
```bash
cd hcm-ai-agent
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn src.api.server:app --host 0.0.0.0 --port 8080 --reload
```

**Terminal 3 - Node.js Backend (Port 4000):**
```bash
cd eqint-savvy-desktop/backend/services/api
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

**Terminal 4 - Electron App:**
```bash
cd eqint-savvy-desktop
npm install
npm run prestart
npm start
```

## Available Commands

From the monorepo root:

```bash
# Install all dependencies
npm run install:all

# Start infrastructure only
npm run docker:up

# Stop infrastructure
npm run docker:down

# Run Python backend only (dev)
npm run dev:python

# Run Node.js backend only (dev)
npm run dev:api

# Run Electron app only (dev)
npm run dev:desktop

# Build Windows installer
npm run build:desktop

# Update submodules to latest
npm run submodule:update
```

## Ports

| Service | Port | Description |
|---------|------|-------------|
| HCM AI Python API | 8080 | Oracle HCM integration, RAG, payroll reconciliation |
| Savvy Node.js API | 4000 | Authentication, user management, proxies to Python |
| PostgreSQL | 5432 | Primary database (shared) |
| Redis | 6379 | Caching, sessions, Celery broker |
| Electron Dev Server | 3000 | React dev server (if running separately) |

## Configuration Files

| File | Purpose |
|------|---------|
| `hcm-ai-agent/.env` | Oracle HCM credentials, Python backend config |
| `hcm-ai-agent/.env.example` | Template for Python backend |
| `eqint-savvy-desktop/backend/.env` | Node.js backend config, JWT secrets, OIDC |
| `eqint-savvy-desktop/backend/.env.example` | Template for Node.js backend |
| `eqint-savvy-desktop/backend/docker-compose.yml` | PostgreSQL & Redis containers |

## Oracle HCM Cloud Setup

1. **Create Service Account** in Oracle HCM Cloud:
   - Role: `HR Specialist` or `HCM Integration Specialist`
   - Enable: REST API access, SOAP access for BI Publisher

2. **Get URLs from your tenant**:
   - Fusion URL: `https://{tenant}.fa.{region}.oraclecloud.com`
   - REST API: `{fusion_url}/hcmRestApi/resources/latest`
   - SOAP: `{fusion_url}/xmlpserver/services`

3. **Add to `hcm-ai-agent/.env`**:
   ```env
   ORACLE_HCM_FUSION_URL=https://your-tenant.fa.us2.oraclecloud.com
   ORACLE_HCM_REST_URL=https://your-tenant.fa.us2.oraclecloud.com/hcmRestApi/resources/latest
   ORACLE_HCM_SOAP_URL=https://your-tenant.fa.us2.oraclecloud.com/xmlpserver/services
   ORACLE_HCM_USERNAME=XX_SVC_ACCT_HR_SUPERUSER
   ORACLE_HCM_PASSWORD=your_password
   ORACLE_HCM_TENANT_ID=your_tenant_id
   ```

## Windows-Specific Notes

### Oracle Instant Client (for direct DB queries)
If using direct Oracle DB connections:
1. Download Oracle Instant Client from Oracle website
2. Extract to `C:\oracle\instantclient_21_10`
3. Add to System PATH
4. Set `ORACLE_DB_HOST`, `ORACLE_DB_PORT`, `ORACLE_DB_SERVICE` in `.env`

### Windows Service (Production)
To run Python backend as a Windows service:
```powershell
# Install NSSM (Non-Sucking Service Manager)
# https://nssm.cc/download

nssm install "EQInt HCM AI" "C:\path\to\python.exe" "-m uvicorn src.api.server:app --host 0.0.0.0 --port 8080"
nssm set "EQInt HCM AI" AppDirectory "C:\path\to\eqint-savvy-full\hcm-ai-agent"
nssm set "EQInt HCM AI" AppEnvironmentExtra "PATH=C:\path\to\eqint-savvy-full\hcm-ai-agent\venv\Scripts;%PATH%"
nssm start "EQInt HCM AI"
```

### Building Windows Installer
```bash
cd eqint-savvy-desktop
npm run build
# Output: dist/EQInt Savvy.exe (portable) or NSIS installer
```

## Troubleshooting

### "Submodule directories not found"
```bash
git submodule update --init --recursive
```

### "Port already in use"
```bash
# Find and kill process on port 8080/4000
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Python backend fails to start
- Check `hcm-ai-agent/.env` exists and has valid Oracle credentials
- Verify Python 3.11+ is installed
- Check virtual environment: `venv\Scripts\activate && python -c "import oracledb"`

### Electron app won't launch
- Run `npm run prestart` in `eqint-savvy-desktop` first
- Check Node.js version compatibility
- Try: `npm rebuild` in `eqint-savvy-desktop`

### Database connection errors
- Ensure Docker is running: `docker ps`
- Check PostgreSQL: `docker exec -it <container> psql -U savvy -d savvy`
- Verify `DATABASE_URL` in `eqint-savvy-desktop/backend/.env`

## Repository Structure

```
eqint-savvy-full/
├── .gitmodules                 # Submodule configuration
├── package.json                # Root scripts for managing both apps
├── start.js                    # Cross-platform startup (Node.js)
├── start-windows.bat           # Windows batch startup
├── start-windows.ps1           # Windows PowerShell startup
├── README.md                   # This file
├── eqint-savvy-desktop/        # Submodule: Electron + Node.js
│   ├── backend/
│   │   ├── docker-compose.yml  # PostgreSQL + Redis
│   │   ├── .env.example
│   │   └── services/api/       # Fastify + Prisma API
│   ├── src/                    # Electron + React source
│   └── package.json
└── hcm-ai-agent/               # Submodule: Python FastAPI
    ├── src/
    │   ├── api/                # FastAPI routes
    │   ├── connectors/         # Oracle HCM connectors
    │   ├── reconciliation/     # Payroll reconciliation
    │   ├── rag/                # RAG pipeline
    │   └── oracle/             # Oracle modules
    ├── requirements.txt
    ├── Dockerfile
    ├── .env.example
    └── FULL_APP_SETUP.md       # Detailed setup guide
```

## Submodule Repositories

| Component | Repository | Description |
|-----------|------------|-------------|
| **eqint-savvy-desktop** | [Chetanya-Kaushal/eqint-savvy-desktop](https://github.com/Chetanya-Kaushal/eqint-savvy-desktop) | Electron desktop app + Node.js backend |
| **hcm-ai-agent** | [Chetanya-Kaushal/hcm-ai-agent](https://github.com/Chetanya-Kaushal/hcm-ai-agent) | Python HCM AI backend |

## License

MIT License - See individual submodule repositories for their licenses.

## Support

- **Issues**: Create issues in the respective submodule repositories
- **Documentation**: See `hcm-ai-agent/FULL_APP_SETUP.md` for detailed setup
- **Oracle HCM**: Refer to Oracle HCM Cloud documentation