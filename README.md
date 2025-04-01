# MCP ArangoDB Server

This project implements a Model Context Protocol (MCP) server for ArangoDB, providing a standardized interface for querying and interacting with ArangoDB databases. It leverages ArangoDB's graph capabilities to manage users, items, and orders data.

## Prerequisites

- Node.js (v18 or higher)
- Bun runtime
- Docker and Docker Compose
- ArangoDB (runs in Docker)
- pnpm package manager

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Start ArangoDB using Docker:
```bash
docker-compose up -d
```

3. Initialize the database schema:
```bash
pnpm run db:init
```

4. Seed the database with test data:
```bash
pnpm run db:seed
```


## Using the MCP Inspector

The MCP Inspector provides a web interface to test and explore the MCP server:

```bash
pnpm run inspector
```

This will start the MCP Inspector and the MCP server, allowing you to interactively test resources and tools.

## Integrating with Claude Desktop

To use this MCP server with Claude Desktop:

1. For macOS: Make Bun available in the system path (if Claude Desktop can't find it):
```bash
sudo ln -s $(which bun) /usr/local/bin/bun
```
This makes Bun executable accessible without specifying a full path, which is sometimes required for Claude Desktop on macOS.

2. Create or edit your Claude Desktop configuration file:
```bash
nano ~/.claude-desktop/config.json
```

3. Add the following configuration (adjust the path as needed):
```json
{
  "mcpServers": {
    "mcp_arango_server2": {
      "command": "bun",
      "args": [
        "/path/to/your/mcp_arango_server/src/mcp-server.ts"
      ]
    }
  }
}
```

4. Restart Claude Desktop to apply the changes

## Architecture

The project implements a Model Context Protocol (MCP) server that connects directly to ArangoDB:

```
┌─────────────┐
│  MCP Server │  Protocol Handler & Resource/Tool Management
├─────────────┤
│ Repositories│  Data Access Layer
├─────────────┤
│   ArangoDB  │  Graph Database
└─────────────┘
```

### Key Design Patterns
- Repository Pattern for data access
- Singleton Pattern for database connection
- Resource/Tool-based API model (MCP)

## Database Schema

- **Document Collections**: 
  - Users: Store customer information
  - Items: Products that can be ordered
  - Orders: Customer orders
- **Edge Collections**:
  - User-Order: Edge with purchase date
  - Order-Item: Edge with amount/quantity

## MCP Features

- Schema information resources
- Collection statistics resources
- Custom AQL query tool
- Recent orders tool
- User purchase history tool
- Popular items tool
- Standardized protocol for model context providers

## Project Structure

```
src/
├── repositories/  # Data access layer
├── schemas/       # Database schema definitions
├── services/      # Database connection service
├── scripts/       # Database initialization and seeding
└── mcp-server.ts  # MCP server entry point
```

## Available Scripts

- `pnpm run start`: Start the MCP server - only for testing if it has compilation errors
- `pnpm run db:init`: Initialize database schema
- `pnpm run db:seed`: Seed the database with test data
- `pnpm run lint`: Run ESLint on source code
- `pnpm run inspector`: Run the MCP Inspector for interactive testing

## Development Tools

- TypeScript with strict type checking
- ESLint configured for TypeScript
- ES Modules format
- Bun for execution and building 