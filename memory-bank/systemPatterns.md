# System Patterns

## Architecture Overview
The project follows a layered architecture pattern with clear separation of concerns:

```
┌─────────────┐
│   Express   │  HTTP API & Routing
├─────────────┤
│ Controllers │  Request Handling & Response Formatting
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

### Model-View-Controller (MVC)
- **Models**: Define data structures (User, Item, Order)
- **Views**: JSON responses from API
- **Controllers**: Handle requests via routes

### Data Transfer Objects (DTO)
- Safe response transformations (e.g., removing password from User)
- Clear request/response structures

## Database Schema Design
- **Document Collections**: For entity data (users, items, orders)
- **Edge Collections**: For relationships (user_orders, order_items)
- **Graph Definition**: Combines collections into navigable structure

## Error Handling Strategy
- Try-catch blocks in route handlers
- Central error middleware
- HTTP status code mapping

## API Design Principles
- RESTful resource naming
- Consistent URL structure
- HTTP verbs for CRUD operations
- Proper status codes
- Error response format standardization

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
├── routes/        # API routes & controllers
├── schemas/       # Database schema definitions
├── scripts/       # Utility scripts (db init)
├── services/      # Database connection
└── index.ts       # App entry point
``` 