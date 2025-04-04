# Product Context

## Purpose
This project provides a Model Context Protocol (MCP) server for an e-commerce application backed by ArangoDB. It demonstrates how to implement a graph database with MCP for standardized access to relationships between users, items, and orders, and includes LLM-based validation to prevent accidental data modification.

## Problem Solved
Traditional SQL databases require complex joins to represent relationships between entities. This project showcases how graph databases (specifically ArangoDB) with MCP can:
1. Provide a standardized protocol for AI tools to interact with database content
2. Expose graph relationships between users, orders, and items in a consistent format
3. Enable custom queries and data retrieval through a unified interface
4. Allow AI assistants like Claude to retrieve and analyze complex relationship data
5. Prevent accidental data modification through LLM validation

## Target Users
1. **AI Applications**: Claude and other AI assistants that leverage MCP
2. **Developers**: Learning ArangoDB, graph databases, and MCP integration
3. **Data Analysts**: Who need to query relationships through standardized interfaces
4. **LLM Developers**: Building tools that interact with structured data
5. **Database Administrators**: Who want to prevent accidental data modification

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
   - Safe query execution with LLM validation

4. **Specialized Data Access**:
   - Retrieve recent orders with items and user data
   - Access user purchase history
   - Identify popular items based on order data
   - Explore graph relationships through standardized patterns

5. **Data Protection**:
   - Validate query safety with LLM
   - Prevent destructive operations by default
   - Provide informative validation results
   - Allow explicit override for intentional modifications

## Claude Integration Goals
- Seamless access to database information
- Consistent response formatting
- Well-defined data models
- Efficient query responses
- Graph-based relationship exploration
- Integration with Claude Desktop
- Safe query execution with validation 