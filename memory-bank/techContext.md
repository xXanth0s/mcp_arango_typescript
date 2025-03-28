# Technical Context

## Technology Stack
- **Language**: TypeScript (ES2022)
- **Runtime**: Bun
- **Package Manager**: pnpm (with Bun for execution)
- **Database**: ArangoDB
- **Web Framework**: Express
- **Database Client**: arangojs
- **Development Tools**: ESLint

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

## Build & Run Scripts
- `bun run build`: Build with Bun's bundler targeting Node.js
- `bun run dev`: Run with hot-reloading during development
- `bun run start`: Run the built application
- `bun run db:init`: Initialize database schema
- `bun run setup`: Build and initialize database
- `bun run lint`: Run ESLint on source code

## Docker Configuration
Docker Compose file includes:
- ArangoDB latest image
- Persistent volume for data storage
- Port 8529 exposed for database access
- Root password configured

## Environment Variables
- `PORT`: API server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## Dependencies
- **arangojs**: Official ArangoDB JavaScript driver
- **express**: Web framework for API
- **typescript**: TypeScript compiler
- **bun**: JavaScript/TypeScript runtime and bundler

## Linting and Code Standards
- ESLint configured for TypeScript
- Strict type checking enabled
- Required function return types
- No unused variables allowed
- Console warnings flagged 