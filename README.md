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
📈 Prometheus at `http://localhost:9090`  
📊 Grafana at `http://localhost:3001` (admin/admin)

## 📚 Documentation

- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md) - System design and agent hierarchy
- [Architecture Diagrams](docs/ARCHITECTURE_DIAGRAMS.md) - Visual system diagrams
- [API Specifications](docs/API_SPECIFICATIONS.md) - REST API endpoints
- [API Security Implementation](docs/API_SECURITY_IMPLEMENTATION.md) - Security patterns
- [API Testing Guide](docs/API_TESTING.md) - **NEW!** Complete testing documentation
- [API Implementation Summary](docs/API_IMPLEMENTATION_SUMMARY.md) - **NEW!** Current progress
- [Database Documentation](docs/DATABASE.md) - Schema, migrations, and queries (590+ lines)
- [Monitoring Setup](monitoring/README.md) - **NEW!** Prometheus & Grafana monitoring

## ✅ Current Status

**Phase 1: Foundation - COMPLETED ✓**
- ✅ Technical architecture and documentation
- ✅ Development environment setup (Docker, configs)
- ✅ Database schema with 13 tables, 79 indexes, 8 triggers
- ✅ Migration and seed system
- ✅ Connection pooling and query helpers

**Phase 2: API Implementation - COMPLETED ✓**
- ✅ **32 REST endpoints** fully implemented
- ✅ JWT authentication with refresh token rotation
- ✅ Role-based authorization (admin, editor, writer, user)
- ✅ Article CRUD with soft deletes
- ✅ Categories and tags management
- ✅ Full-text search with relevance ranking
- ✅ Search suggestions and trending terms
- ✅ Comprehensive error handling and validation
- ✅ Testing documentation and scripts

**Phase 3: AI Agents - IN PROGRESS**
- ⏳ Agent integration with API
- ⏳ Task queue system
- ⏳ Agent orchestration

**Phase 4: Frontend - PENDING**
- ⏳ React/Vue application
- ⏳ Admin dashboard
- ⏳ Public website

## 🎯 API Endpoints

**32 endpoints across 5 resource groups:**

### Authentication (6 endpoints)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login with account locking
- `POST /api/v1/auth/refresh` - Token refresh with rotation
- `POST /api/v1/auth/logout` - Single device logout
- `POST /api/v1/auth/logout-all` - All devices logout
- `GET /api/v1/auth/me` - Get current user profile

### Articles (5 endpoints)
- `GET /api/v1/articles` - List articles (pagination, filtering, sorting)
- `GET /api/v1/articles/:id` - Get single article (by ID or slug)
- `POST /api/v1/articles` - Create article (auth required)
- `PUT /api/v1/articles/:id` - Update article (auth + ownership)
- `DELETE /api/v1/articles/:id` - Soft delete article (admin/editor)

### Categories (5 endpoints)
- `GET /api/v1/categories` - List categories with article counts
- `GET /api/v1/categories/:id` - Get category with children/articles
- `POST /api/v1/categories` - Create category (admin/editor)
- `PUT /api/v1/categories/:id` - Update category (admin/editor)
- `DELETE /api/v1/categories/:id` - Delete category (admin)

### Tags (7 endpoints)
- `GET /api/v1/tags` - List tags with usage counts
- `GET /api/v1/tags/:id` - Get tag with articles
- `GET /api/v1/tags/popular` - Get popular tags
- `GET /api/v1/tags/search` - Search tags by name
- `POST /api/v1/tags` - Create tag (admin/editor)
- `PUT /api/v1/tags/:id` - Update tag (admin/editor)
- `DELETE /api/v1/tags/:id` - Delete tag (admin)

### Search (4 endpoints)
- `GET /api/v1/search` - Full-text search with advanced filters
- `GET /api/v1/search/suggestions` - Auto-complete suggestions
- `GET /api/v1/search/trending` - Trending search terms
- `GET /api/v1/search/all` - Multi-entity search (articles, categories, tags, authors)

**See [docs/API_TESTING.md](docs/API_TESTING.md) for complete testing guide with examples.**

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

### Testing Commands
```bash
# Open a new terminal while server is running
.\scripts\test-api.ps1      # Run automated API tests (PowerShell)

# Or test individual endpoints
curl http://localhost:3000/api/v1/articles
curl http://localhost:3000/api/v1/categories
curl http://localhost:3000/api/v1/tags
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
