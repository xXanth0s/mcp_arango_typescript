# Project Brief: TypeScript ArangoDB API

## Overview
A TypeScript project with Express API that interacts with ArangoDB. The application provides APIs to manage users, items, and orders in an e-commerce-like system, using ArangoDB's graph capabilities for relationships between entities.

## Core Requirements
1. TypeScript project with ESLint
2. Node.js Express API backend
3. ArangoDB database integration
4. pnpm package management
5. Docker Compose for ArangoDB setup
6. Database schema with graph relationships
7. Repository pattern for data access
8. RESTful API endpoints for CRUD operations

## Data Model
- **Users**: Store customer information
- **Items**: Products that can be ordered
- **Orders**: Customer orders with links to users and items
- **Relationships**:
  - User-Order: Edge with purchase date
  - Order-Item: Edge with amount/quantity

## Technical Goals
1. Well-structured TypeScript codebase
2. ArangoDB for data storage with graph capabilities
3. Clean API endpoints for all entities
4. Custom AQL queries when needed
5. Proper error handling
6. Database initialization scripts
7. Docker for database deployment 