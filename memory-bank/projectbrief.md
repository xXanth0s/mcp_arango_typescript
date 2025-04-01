# Project Brief: ArangoDB MCP Server

## Overview
A TypeScript project implementing a Model Context Protocol (MCP) server that interacts with ArangoDB. The application provides a standardized interface for querying and retrieving data about users, items, and orders in an e-commerce-like system, using ArangoDB's graph capabilities for relationships between entities.

## Core Requirements
1. TypeScript project with ESLint
2. MCP server implementation with standardized resources and tools
3. ArangoDB database integration
4. pnpm package management
5. Docker Compose for ArangoDB setup
6. Database schema with graph relationships
7. Repository pattern for data access
8. Claude Desktop integration support

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
3. MCP resources for schema and collection information
4. MCP tools for custom AQL queries and data retrieval
5. Proper error handling
6. Database initialization scripts
7. Docker for database deployment
8. Seamless integration with Claude Desktop 