# MCP Integration Quick Reference

## What is MCP?

Model Context Protocol (MCP) allows AI agents to interact with external systems (databases, files, APIs) in a standardized way.

## DigitalTide MCP Setup

### 1. Prerequisites

```bash
# Ensure Node.js 18+ is installed
node --version

# Ensure npx is available
npx --version
```

### 2. Environment Variables

Add to `.env`:

```bash
# Required for GitHub MCP server
GITHUB_TOKEN=ghp_your_github_token_here

# Required for Brave Search MCP server
BRAVE_API_KEY=your_brave_api_key_here
```

### 3. VS Code Configuration

MCP servers are configured in `.vscode/mcp-settings.json` (already created).

**To test MCP servers are working:**

1. Open VS Code Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Search for "MCP: Check Server Status"
3. Verify all servers show as "Available"

### 4. Available MCP Servers

| Server | Purpose | Status |
|--------|---------|--------|
| **postgres** | Database queries | ✅ Ready |
| **fetch** | HTTP requests | ✅ Ready |
| **memory** | Context storage | ✅ Ready |
| **github** | GitHub operations | ⚠️ Needs `GITHUB_TOKEN` |
| **brave-search** | Web search | ⚠️ Needs `BRAVE_API_KEY` |
| **filesystem** | File operations | ✅ Ready |
| **sequential-thinking** | Multi-step reasoning | ✅ Ready |

### 5. Testing MCP Servers Manually

```bash
# Test PostgreSQL server
npx -y @modelcontextprotocol/server-postgres "postgresql://postgres:postgres@localhost:5432/digitaltide"

# Test Fetch server
npx -y @modelcontextprotocol/server-fetch

# Test Memory server
npx -y @modelcontextprotocol/server-memory

# Test GitHub server (requires token)
GITHUB_PERSONAL_ACCESS_TOKEN=your_token npx -y @modelcontextprotocol/server-github

# Test Brave Search (requires API key)
BRAVE_API_KEY=your_key npx -y @modelcontextprotocol/server-brave-search

# Test Filesystem server
npx -y @modelcontextprotocol/server-filesystem .

# Test Sequential Thinking server
npx -y @modelcontextprotocol/server-sequential-thinking
```

### 6. Check MCP Status via API

```bash
# Get MCP health status
curl http://localhost:3000/api/v1/news/mcp/health

# Get MCP usage statistics (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/news/mcp/stats
```

### 7. MCP Client Usage (Phase 3)

```javascript
import mcpClient from './services/mcp/mcpClient.js';

// Example: Query database via MCP
const articles = await mcpClient.postgresQuery(
  'SELECT * FROM articles WHERE published = true LIMIT 5'
);

// Example: Fetch web content via MCP
const content = await mcpClient.fetch('https://example.com/article');

// Example: Store agent memory via MCP
await mcpClient.memoryStore('last_task', {
  taskId: '123',
  timestamp: new Date(),
  result: 'success'
});

// Example: Search web via MCP
const searchResults = await mcpClient.braveSearch('latest AI news');

// Example: Read file via MCP
const fileContent = await mcpClient.filesystemRead('./content/article.md');
```

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    DigitalTide Server                     │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │             AI Agents (Phase 3)                 │    │
│  │  - Content Curator                              │    │
│  │  - Research Agent                               │    │
│  │  - Writer Agent                                 │    │
│  │  - Quality Control Agent                        │    │
│  └──────────────────┬──────────────────────────────┘    │
│                     │                                     │
│  ┌──────────────────▼──────────────────────────────┐    │
│  │          MCP Client Wrapper                     │    │
│  │      (src/services/mcp/mcpClient.js)            │    │
│  └──────────────────┬──────────────────────────────┘    │
│                     │                                     │
└─────────────────────┼─────────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
    ┌────▼───┐   ┌───▼────┐  ┌───▼────┐
    │Postgres│   │  Fetch │  │ Memory │  ...
    │ MCP    │   │  MCP   │  │  MCP   │
    └────────┘   └────────┘  └────────┘
```

## Getting API Keys

### GitHub Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `read:org`, `write:discussion`
4. Copy token to `.env` as `GITHUB_TOKEN`

### Brave Search API
1. Go to https://brave.com/search/api/
2. Sign up for free tier (2,000 queries/month)
3. Copy API key to `.env` as `BRAVE_API_KEY`

## Troubleshooting

### MCP servers not starting
- Check VS Code Output panel → "MCP Servers"
- Verify environment variables are set
- Ensure PostgreSQL/Redis are running

### "Module not found" errors
- MCP servers run via `npx -y` (auto-installs latest)
- No manual npm install needed
- Check internet connection

### PostgreSQL connection errors
- Verify Docker is running: `docker ps`
- Check database credentials match `.env`
- Test connection: `psql -h localhost -U postgres -d digitaltide`

## Phase 3 Integration Roadmap

1. **Agent Base Classes** - Create abstract Agent class
2. **MCP Integration** - Connect agents to MCP client
3. **Tool Registration** - Register MCP tools per agent
4. **Workflow Engine** - Multi-agent orchestration
5. **Monitoring** - MCP call logging and metrics

## Resources

- **MCP Docs:** https://modelcontextprotocol.io
- **MCP GitHub:** https://github.com/modelcontextprotocol
- **VS Code Extension:** https://marketplace.visualstudio.com/items?itemName=modelcontextprotocol.mcp
- **DigitalTide MCP Setup:** `docs/MCP_SETUP.md`

## Support

Questions? Check:
1. `docs/MCP_SETUP.md` - Comprehensive guide
2. MCP GitHub Issues - Known problems
3. VS Code Output panel - Real-time logs
4. `/api/v1/news/mcp/health` - Server status
