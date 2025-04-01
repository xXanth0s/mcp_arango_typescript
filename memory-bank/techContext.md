# Technical Context

## Technology Stack
- **Language**: TypeScript (ES2022)
- **Runtime**: Bun
- **Package Manager**: pnpm (with Bun for execution)
- **Database**: ArangoDB
- **Protocol**: Model Context Protocol (MCP)
- **Database Client**: arangojs
- **Development Tools**: ESLint, MCP Inspector

## Project Configuration
- TypeScript is configured with strict type checking
- ESLint is set up with TypeScript-specific rules
- ES Modules format used instead of CommonJS
- Docker Compose for running ArangoDB
- Database initialization script included
- Bun used for execution and building

## Development Setup
1. **Bun**: Required for running the application and scripts
2. **pnpm**: Package manager for dependency management
3. **Docker**: Required for running ArangoDB in a container
4. **TypeScript**: For type-safe development
5. **MCP Inspector**: For testing MCP resources and tools

## Build & Run Scripts
- `pnpm run start`: Start the MCP server
- `pnpm run db:init`: Initialize database schema
- `pnpm run db:seed`: Seed the database with test data
- `pnpm run lint`: Run ESLint on source code
- `pnpm run inspector`: Run the MCP Inspector for interactive testing

## Docker Configuration
Docker Compose file includes:
- ArangoDB latest image
- Persistent volume for data storage
- Port 8529 exposed for database access
- Root password configured

## Claude Desktop Integration
- Configuration file with MCP server definition
- Bun path setup for macOS systems
- MCP Server accessible from Claude AI

## Dependencies
- **@modelcontextprotocol/sdk**: MCP server implementation
- **arangojs**: Official ArangoDB JavaScript driver
- **zod**: Schema validation for MCP tools
- **typescript**: TypeScript compiler
- **bun**: JavaScript/TypeScript runtime and bundler

## Linting and Code Standards
- ESLint configured for TypeScript
- Strict type checking enabled
- Required function return types
- No unused variables allowed
- Console warnings flagged 