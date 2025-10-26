# DigitalTide 🌊

**AI-Powered Autonomous News Platform with Intelligent Agent Orchestration**

> A revolutionary news platform that autonomously discovers, researches, writes, and publishes high-quality articles through a coordinated network of specialized AI agents.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18.0.0+)
- Docker Desktop
- Git
- PostgreSQL 16+ (via Docker)

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
copy .env.example .env
# Edit .env and add your API keys

# 3. Start Docker services (PostgreSQL, Redis, Elasticsearch, Qdrant)
npm run docker:up

# 4. Wait 10 seconds for services to initialize, then set up database
npm run db:setup

# 5. Verify database setup
node scripts/verify-database.js

# 6. Start development server
npm run dev
```

🎉 API running at `http://localhost:3000`  
📊 Database admin at `http://localhost:8080` (Adminer)  
🔴 Redis commander at `http://localhost:8081`

## 📚 Documentation

- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md) - System design and agent hierarchy
- [Architecture Diagrams](docs/ARCHITECTURE_DIAGRAMS.md) - Visual system diagrams
- [API Specifications](docs/API_SPECIFICATIONS.md) - REST API endpoints
- [API Security Implementation](docs/API_SECURITY_IMPLEMENTATION.md) - Security patterns
- [Database Documentation](docs/DATABASE.md) - Schema, migrations, and queries
- [Project Goals](.agents/PROJECT_GOALS.md) - Vision and objectives
- [Development TODO](.agents/PROJECT_TODO.md) - Implementation roadmap

## 🛠️ Development

### Server Commands
```bash
npm run dev          # Start development server with hot reload
npm run start        # Start production server
npm test             # Run test suite with coverage
npm run lint         # Check code style
npm run format       # Format code with Prettier
```

### Docker Commands
```bash
npm run docker:up       # Start all services
npm run docker:down     # Stop all services
npm run docker:logs     # View service logs
npm run docker:restart  # Restart services
npm run docker:clean    # Remove all containers and volumes
```

### Database Commands
```bash
npm run db:migrate          # Run pending migrations
npm run db:migrate:status   # Check migration status
npm run db:seed             # Load seed data
npm run db:setup            # Run migrations + seed data
npm run db:reset            # Reset entire database (destructive!)
node scripts/verify-database.js  # Verify database setup
```

## 🗄️ Database

**PostgreSQL Schema:**
- ✅ 13+ tables with relationships
- ✅ Full-text search indexes
- ✅ Automatic timestamp triggers
- ✅ Enum types for status fields
- ✅ Migration and seed system

**Key Tables:**
- `users` - Authentication and profiles
- `articles` - Content with quality scoring
- `categories`, `tags` - Content organization
- `sources` - News source management
- `agent_tasks` - AI job queue
- `analytics_events` - User tracking

See [docs/DATABASE.md](docs/DATABASE.md) for complete schema documentation.

## 🤖 AI Agents

- **COO Agent** - Master orchestrator
- **Crawler Agent** - News discovery
- **Research Agent** - Fact verification
- **Writer Agent** - Content generation
- **Quality Control** - Content validation
- **SEO Agent** - Search optimization
- **Publisher Agent** - Content distribution

## 🔒 Security

- Multi-layer security architecture
- JWT authentication with refresh tokens
- Rate limiting and DDoS protection
- Comprehensive input validation
- Regular security audits

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for the future of autonomous journalism**
