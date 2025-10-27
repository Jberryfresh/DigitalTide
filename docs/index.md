---
layout: default
title: DigitalTide Documentation
---

# DigitalTide Documentation

Welcome to the DigitalTide documentation! DigitalTide is an AI-powered autonomous news platform with intelligent agent orchestration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose

### Installation

```bash
# Clone the repository
git clone https://github.com/Jberryfresh/DigitalTide.git
cd DigitalTide

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start Docker services
docker-compose up -d

# Run database migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Start the development server
npm run dev
```

Server will be running at `http://localhost:3000`

---

## 📚 Documentation

### Architecture & Design

- [**Technical Architecture**](./TECHNICAL_ARCHITECTURE.html) - System architecture and component overview
- [**Architecture Diagrams**](./ARCHITECTURE_DIAGRAMS.html) - Visual system diagrams (Mermaid)
- [**API Specifications**](./API_SPECIFICATIONS.html) - Complete API documentation (32 endpoints)
- [**UI Wireframes**](./UI_WIREFRAMES.html) - User interface designs and mockups

### Development

- [**Coding Standards**](./CODING_STANDARDS.html) - JavaScript/Node.js coding conventions
- [**GitHub Actions**](./GITHUB_ACTIONS.html) - CI/CD pipeline documentation
- [**GitHub Setup**](./GITHUB_SETUP.html) - Repository configuration guide

### Legal & Compliance

- [**Legal Compliance**](./LEGAL_COMPLIANCE.html) - News aggregation legal requirements
- [**Terms of Service**](./TERMS_OF_SERVICE.html) - Platform terms and conditions
- [**Privacy Policy**](./PRIVACY_POLICY.html) - User data and privacy practices
- [**Content Usage Guidelines**](./CONTENT_USAGE_GUIDELINES.html) - Content acquisition and attribution
- [**Security Policy**](../.github/SECURITY.html) - Security practices and vulnerability reporting

---

## 🏗️ Architecture

DigitalTide is built with a modern, scalable architecture:

### Core Technologies

- **Backend**: Node.js 18+ with Express.js
- **Database**: PostgreSQL 15 with full-text search
- **Caching**: Redis 7 for session and data caching
- **Search**: Elasticsearch 8 for advanced article search
- **Vector DB**: Qdrant for semantic search
- **Containerization**: Docker & Docker Compose

### Key Features

- 🤖 **AI Agent Network**: Autonomous content curation and analysis
- 🔍 **Advanced Search**: Full-text and semantic search capabilities
- 📊 **Real-time Analytics**: Live metrics and monitoring
- 🔐 **Secure Authentication**: JWT-based auth with refresh tokens
- 📱 **Responsive Design**: Mobile-first UI approach
- ⚡ **High Performance**: Optimized for speed and scalability

---

## 🔧 API Overview

The DigitalTide API provides access to articles, categories, tags, and search functionality.

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

Most endpoints require JWT authentication:

```bash
# Login to get token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@digitaltide.com","password":"admin123"}'

# Use token in subsequent requests
curl -X GET http://localhost:3000/api/v1/articles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Quick Examples

**Get articles**:
```bash
GET /api/v1/articles?page=1&limit=10
```

**Search articles**:
```bash
GET /api/v1/search?q=technology&category=tech&page=1&limit=10
```

**Get article by ID**:
```bash
GET /api/v1/articles/:id
```

See [API Specifications](./API_SPECIFICATIONS.html) for complete documentation.

---

## 🤖 AI Agent System

DigitalTide uses a network of specialized AI agents:

### Agent Types

1. **Content Discovery Agent** - Finds trending news
2. **Quality Assessment Agent** - Evaluates article quality
3. **Fact-Checking Agent** - Verifies information accuracy
4. **Summarization Agent** - Creates concise summaries
5. **Categorization Agent** - Auto-categorizes content
6. **Sentiment Analysis Agent** - Analyzes article tone
7. **Recommendation Agent** - Personalizes user feeds

### Agent Communication

Agents communicate via message queues (Bull + Redis) for:
- Asynchronous processing
- Task distribution
- Result aggregation
- Error recovery

---

## 📖 Development Guide

### Project Structure

```
DigitalTide/
├── .agents/           # AI agent rules and configurations
├── .github/           # GitHub workflows, templates
├── database/          # Migrations, seeds, schema
├── docs/              # Documentation
├── scripts/           # Utility scripts
├── src/
│   ├── agents/        # AI agent implementations
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Express middleware
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── utils/         # Helper functions
│   └── index.js       # Application entry point
├── docker-compose.yml # Docker services
├── package.json       # Dependencies
└── README.md          # Main readme
```

### Development Workflow

1. **Create feature branch**: `git checkout -b phase-1/feature-name`
2. **Make changes**: Follow [Coding Standards](./CODING_STANDARDS.html)
3. **Write tests**: Maintain 80%+ coverage
4. **Run checks**: `npm run lint && npm test`
5. **Commit**: Use conventional commits: `[PHASE-1] feat: description - P1`
6. **Push**: `git push origin phase-1/feature-name`
7. **Create PR**: Fill out PR template completely
8. **Review**: Address feedback, ensure CI passes
9. **Merge**: Squash and merge to main

### Available Scripts

```bash
npm run dev              # Start development server with hot reload
npm start                # Start production server
npm test                 # Run tests with coverage
npm run lint             # Check code style
npm run lint:fix         # Auto-fix style issues
npm run format           # Format with Prettier

npm run db:migrate       # Run database migrations
npm run db:rollback      # Rollback last migration
npm run db:seed          # Seed database with test data
npm run db:setup         # Migrate + seed

npm run docker:up        # Start all Docker services
npm run docker:down      # Stop all Docker services
npm run docker:logs      # View Docker logs
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.spec.js
```

### Coverage Requirements

- **Overall**: 80% minimum
- **Critical paths**: 95% minimum
- **Utilities**: 90% minimum
- **Controllers**: 85% minimum

---

## 🔒 Security

### Reporting Vulnerabilities

Please report security vulnerabilities responsibly:

- **Email**: security@digitaltide.com
- **GitHub**: Use Security tab > Advisories

See our [Security Policy](../.github/SECURITY.html) for details.

### Security Features

- ✅ Input validation on all endpoints
- ✅ Rate limiting (100 req/15 min per IP)
- ✅ Helmet.js security headers
- ✅ JWT authentication with refresh tokens
- ✅ bcrypt password hashing
- ✅ Parameterized SQL queries
- ✅ CORS restrictions
- ✅ Environment variable secrets

---

## 📊 Project Status

### Current Phase: Phase 1 - Foundation

- ✅ Phase 1.1 - Documentation & Planning (100%)
- ✅ Phase 1.2 - Development Environment (100%)
- ✅ Phase 1.3 - Legal & Compliance (100%)
- 🔄 Phase 1.4 - GitHub Services (In Progress)
- ⏳ Phase 1.5 - External Services (Not Started)

See the [Project TODO](https://github.com/Jberryfresh/DigitalTide/blob/main/.agents/PROJECT_TODO.md) for detailed progress.

---

## 🤝 Contributing

We welcome contributions! Please:

1. Read [Coding Standards](./CODING_STANDARDS.html)
2. Fork the repository
3. Create a feature branch
4. Make your changes
5. Add tests
6. Submit a pull request

### PR Guidelines

- Follow PR template
- Include tests
- Update documentation
- Ensure CI passes
- Get approval from maintainers

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🔗 Links

- **GitHub**: [github.com/Jberryfresh/DigitalTide](https://github.com/Jberryfresh/DigitalTide)
- **Issues**: [Report bugs or request features](https://github.com/Jberryfresh/DigitalTide/issues)
- **Discussions**: [Join the community](https://github.com/Jberryfresh/DigitalTide/discussions)
- **Documentation**: You're here! 📍

---

## 💬 Support

Need help?

- 📖 Check the documentation
- 💡 Browse [Discussions](https://github.com/Jberryfresh/DigitalTide/discussions)
- 🐛 Report issues on [GitHub](https://github.com/Jberryfresh/DigitalTide/issues)
- 📧 Contact: support@digitaltide.com

---

## 🎯 Roadmap

### Phase 2: Core Features (Q1 2025)
- User authentication and profiles
- Article management
- Search functionality
- Category/tag management

### Phase 3: AI Agents (Q2 2025)
- AI agent network
- Content curation
- Fact-checking system
- Sentiment analysis

### Phase 4: Advanced Features (Q3 2025)
- Recommendation engine
- Real-time updates
- Analytics dashboard
- Mobile app

---

**Last Updated**: October 26, 2024  
**Version**: 1.0.0  
**Status**: Active Development
