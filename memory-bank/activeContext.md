# Active Context

## Current Focus
The project is currently implementing an MCP server that provides access to ArangoDB data. The system offers standardized resources and tools for accessing users, items, and orders data with the appropriate relationships between them. We've transitioned to a pure MCP implementation, removing the Express API components, and added LLM-based validation for query operations.

## Open Issues
1. **Type Integration**: Ensuring proper type definitions for MCP server resources and tools
2. **ArangoDB Transaction API**: Error with transaction implementation in the QueryRepository
3. **Collection Naming**: Docker service vs. ArangoDB collection naming inconsistency may cause issues
4. **MCP Tool Parameters**: Ensuring proper validation of tool parameters with Zod schemas
5. **LLM Response Parsing**: Ensure consistent JSON format from OpenAI responses

## Next Steps
1. Enhance MCP resources with more detailed schema information
2. Add additional specialized MCP tools for common query patterns
3. Implement proper error handling for ArangoDB connections
4. Add comprehensive MCP Inspector tests
5. Create documentation for Claude Desktop integration
6. Verify that all scripts work correctly with Bun and pnpm
7. Improve LLM query validation with fallback mechanisms

## Recent Changes
1. Removed Express API and related components
2. Converted to pure MCP server implementation
3. Updated documentation to reflect MCP focus
4. Added Claude Desktop integration instructions
5. Streamlined project structure
6. Added MCP Inspector for testing
7. Simplified the architecture to focus on MCP and ArangoDB
8. Added LLM-based query validation using OpenAI and Langchain

## Current Decisions
1. Using ES Modules instead of CommonJS
2. Implementing repository pattern for data access
3. Storing edges with metadata (amount, date) between entities
4. Using AQL template literals for queries
5. Explicit typing of all functions and parameters
6. Using MCP for standardized database access
7. Supporting Claude Desktop integration
8. Using LLM validation for destructive AQL queries
9. Requiring OpenAI API key for query validation

## Working Notes
- ArangoDB should be running before MCP server starts (dependency)
- Database initialization should be run after first deployment
- All repositories follow similar patterns for consistency
- Error responses are standardized across MCP tools and resources
- MCP resources provide metadata about database structure
- MCP tools enable complex queries and data retrieval
- Claude Desktop configuration needs to be updated to use the MCP server
- Environment variable OPENAI_API_KEY is required for query validation
- Destructive queries need skipValidation flag to execute 