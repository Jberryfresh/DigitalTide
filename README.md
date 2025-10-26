# DigitalTide 🌊

**AI-Powered Autonomous News Platform with Intelligent Agent Orchestration**

> A revolutionary news platform that autonomously discovers, researches, writes, and publishes high-quality articles through a coordinated network of specialized AI agents.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18.0.0+)
- Docker Desktop
- Git

### Setup
```bash
# Install dependencies
npm install

# Copy and configure environment
copy .env.example .env

# Start Docker services
npm run docker:up

# Run migrations and start dev server
npm run db:migrate
npm run dev
```

🎉 API running at `http://localhost:3000`

## 📚 Documentation

- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [API Specifications](docs/API_SPECIFICATIONS.md)
- [Project Goals](.agents/PROJECT_GOALS.md)
- [Development TODO](.agents/PROJECT_TODO.md)

## 🛠️ Development

```bash
npm run dev          # Start development server
npm test             # Run tests
npm run docker:up    # Start services
npm run db:migrate   # Run database migrations
```

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
