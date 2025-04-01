# Product Context

## Purpose
This project provides a Model Context Protocol (MCP) server for an e-commerce application backed by ArangoDB. It demonstrates how to implement a graph database with MCP for standardized access to relationships between users, items, and orders.

## Problem Solved
Traditional SQL databases require complex joins to represent relationships between entities. This project showcases how graph databases (specifically ArangoDB) with MCP can:
1. Provide a standardized protocol for AI tools to interact with database content
2. Expose graph relationships between users, orders, and items in a consistent format
3. Enable custom queries and data retrieval through a unified interface
4. Allow AI assistants like Claude to retrieve and analyze complex relationship data

## Target Users
1. **AI Applications**: Claude and other AI assistants that leverage MCP
2. **Developers**: Learning ArangoDB, graph databases, and MCP integration
3. **Data Analysts**: Who need to query relationships through standardized interfaces
4. **LLM Developers**: Building tools that interact with structured data

## Core Use Cases
1. **Schema Information**:
   - Access database schema metadata
   - Understand collection structure and relationships
   - Explore graph definitions

2. **Collection Statistics**:
   - Retrieve document counts for collections
   - Get collection information and metadata
   - Monitor database statistics

3. **Custom Queries**:
   - Execute AQL queries against the database
   - Parameterized queries for dynamic data access
   - Complex graph traversals

4. **Specialized Data Access**:
   - Retrieve recent orders with items and user data
   - Access user purchase history
   - Identify popular items based on order data
   - Explore graph relationships through standardized patterns

## Claude Integration Goals
- Seamless access to database information
- Consistent response formatting
- Well-defined data models
- Efficient query responses
- Graph-based relationship exploration
- Integration with Claude Desktop 