# System Patterns

## Architecture Overview
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

## Key Design Patterns

### Repository Pattern
- **BaseRepository**: Generic base class for CRUD operations
- **Entity Repositories**: Extend base with entity-specific operations
- **QueryRepository**: For complex custom AQL queries

### Singleton Pattern
- Database connection is implemented as a singleton
- Ensures only one connection to ArangoDB exists

### MCP Resource/Tool Pattern
- **Resources**: Provide data about the system (schema, collections)
- **Tools**: Provide interactive functionality (queries, data retrieval)
- **Templates**: Allow parameterized resource URIs

## Database Schema Design
- **Document Collections**: For entity data (users, items, orders)
- **Edge Collections**: For relationships (user_orders, order_items)
- **Graph Definition**: Combines collections into navigable structure

## Error Handling Strategy
- Try-catch blocks in server resource/tool handlers
- Consistent error response format
- Detailed error messages where appropriate

## MCP Design Principles
- Standardized resource naming
- Consistent URI structure
- Clear tool parameters with validation
- Structured response formats
- Error formatting for client comprehension

## Transaction Handling
- ArangoDB transactions for multi-document operations
- Ensures atomicity when creating orders with multiple items

## Query Optimization
- Strategic indexing on frequently accessed fields
- Efficient AQL queries with appropriate filters

## Code Organization

```
src/
├── models/        # Data models & interfaces
├── repositories/  # Data access layer
├── schemas/       # Database schema definitions
├── scripts/       # Utility scripts (db init, seed)
├── services/      # Database connection
└── mcp-server.ts  # MCP server entry point
``` 