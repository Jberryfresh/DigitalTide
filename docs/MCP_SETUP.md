# MCP Server Integration Guide

## Overview

Model Context Protocol (MCP) servers enable AI agents to autonomously interact with databases, file systems, web APIs, and other external resources. This guide explains how to set up MCP servers for DigitalTide's AI agents.

## Architecture

```
┌─────────────────┐
│  AI Agents      │
│  (Phase 3)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MCP Client     │
│  Wrapper        │
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┬────────┐
    ▼         ▼        ▼        ▼        ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│Postgres│ │Fetch │ │Memory│ │GitHub│ │Brave │
│ Server │ │Server│ │Server│ │Server│ │Search│
└────────┘ └──────┘ └──────┘ └──────┘ └──────┘
```

## Priority MCP Servers

### P1 - CRITICAL (Required for Phase 3)

#### 1. PostgreSQL Server
**Repository:** `@modelcontextprotocol/server-postgres`
**Purpose:** Direct database queries for AI agents
**Use Cases:**
- Agents can query articles, categories, tags directly
- Real-time data analysis
- Dynamic content discovery

**Configuration:**
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:postgres@localhost:5432/digitaltide"
      ]
    }
  }
}
```

#### 2. Fetch Server
**Repository:** `@modelcontextprotocol/server-fetch`
**Purpose:** HTTP requests for web scraping and API calls
**Use Cases:**
- Fetch article content from URLs
- Call external APIs
- Web scraping for research

**Configuration:**
```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

#### 3. Memory Server
**Repository:** `@modelcontextprotocol/server-memory`
**Purpose:** Persistent context storage across agent sessions
**Use Cases:**
- Remember user preferences
- Store agent decision history
- Context carryover between tasks

**Configuration:**
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

#### 4. GitHub Server
**Repository:** `@modelcontextprotocol/server-github`
**Purpose:** GitHub operations (issues, PRs, code)
**Use Cases:**
- Create issues for bugs
- Submit PRs for improvements
- Read repository documentation

**Configuration:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your-token>"
      }
    }
  }
}
```

### P2 - HIGH (Enhanced capabilities)

#### 5. Brave Search Server
**Repository:** `@modelcontextprotocol/server-brave-search`
**Purpose:** Web search for research and fact-checking
**Use Cases:**
- Research topics before writing
- Fact-check article claims
- Find trending topics

**Configuration:**
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "<your-key>"
      }
    }
  }
}
```

#### 6. Filesystem Server
**Repository:** `@modelcontextprotocol/server-filesystem`
**Purpose:** File operations (read, write, manage)
**Use Cases:**
- Save articles to markdown
- Manage logs
- Template processing

**Configuration:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/allowed/paths"
      ]
    }
  }
}
```

#### 7. Sequential Thinking Server
**Repository:** `@modelcontextprotocol/server-sequential-thinking`
**Purpose:** Multi-step reasoning chains
**Use Cases:**
- Complex editorial decisions
- Multi-stage article analysis
- Strategic planning

**Configuration:**
```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

## Installation Methods

### Method 1: VS Code Integration (Recommended)

1. Install VS Code MCP extension
2. Add to `.vscode/mcp-settings.json`:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:postgres@localhost:5432/digitaltide"
      ]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${env:GITHUB_TOKEN}"
      }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${env:BRAVE_API_KEY}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "${workspaceFolder}"
      ]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

### Method 2: Claude Desktop Integration

1. Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
   or `%APPDATA%/Claude/claude_desktop_config.json` (Windows)

2. Add same configuration as above

### Method 3: Programmatic (Node.js)

For direct Node.js integration (Phase 3 implementation):

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Initialize MCP client
const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-postgres', connectionString],
});

const client = new Client({
  name: 'digitaltide-agent',
  version: '1.0.0',
}, {
  capabilities: {},
});

await client.connect(transport);

// Use MCP tools
const result = await client.callTool({
  name: 'query',
  arguments: {
    sql: 'SELECT * FROM articles LIMIT 10'
  }
});
```

## Environment Variables

Add to `.env`:

```bash
# MCP Server Configuration
GITHUB_TOKEN=ghp_your_github_token
BRAVE_API_KEY=your_brave_api_key

# PostgreSQL (already configured)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=digitaltide
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

## Security Considerations

1. **Database Access:** MCP postgres server has full database access. Ensure proper authentication.
2. **File System:** Limit filesystem server to specific directories only.
3. **API Keys:** Never commit API keys. Use environment variables.
4. **GitHub Token:** Use fine-grained tokens with minimal scopes.

## Testing MCP Servers

Test each server after installation:

```bash
# Test Postgres server
npx -y @modelcontextprotocol/server-postgres "postgresql://postgres:postgres@localhost:5432/digitaltide"

# Test Fetch server
npx -y @modelcontextprotocol/server-fetch

# Test Memory server
npx -y @modelcontextprotocol/server-memory

# Test GitHub server (requires token)
GITHUB_PERSONAL_ACCESS_TOKEN=your_token npx -y @modelcontextprotocol/server-github
```

## Integration with Phase 3 Agents

### Agent Framework Integration

```javascript
import { Agent } from './agents/base/Agent.js';
import mcpClient from './services/mcp/mcpClient.js';

class ContentCuratorAgent extends Agent {
  async execute(task) {
    // Use MCP postgres to query articles
    const articles = await mcpClient.postgres.query({
      sql: 'SELECT * FROM articles WHERE published = false LIMIT 5'
    });

    // Use MCP fetch to get article content
    const content = await mcpClient.fetch.get({
      url: articles[0].url
    });

    // Use MCP memory to store context
    await mcpClient.memory.store({
      key: 'last_curated_articles',
      value: articles.map(a => a.id)
    });

    return articles;
  }
}
```

## Roadmap

### Phase 2.8 (Current)
- ✅ Document MCP architecture
- ✅ Identify priority servers
- ⏳ Create MCP client wrapper
- ⏳ Add configuration files
- ⏳ Create health check endpoints

### Phase 3 (Next)
- Integrate MCP with AI agents
- Build agent-specific MCP workflows
- Add MCP call logging and monitoring
- Implement MCP fallback strategies

## Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [MCP GitHub Repository](https://github.com/modelcontextprotocol)
- [MCP Server Examples](https://github.com/modelcontextprotocol/servers)
- [VS Code MCP Extension](https://marketplace.visualstudio.com/items?itemName=modelcontextprotocol.mcp)

## Support

For MCP-related issues:
1. Check MCP server logs in VS Code Output panel
2. Verify environment variables are set correctly
3. Test servers independently before integration
4. Review MCP GitHub issues for known problems
