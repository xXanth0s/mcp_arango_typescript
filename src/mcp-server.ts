// Load environment variables
import 'dotenv/config';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { executeQuery } from './repositories/QueryRepository.js';
import { COLLECTIONS, GRAPH, INDEXES } from './schemas/schema.js';
import { validateQuery } from './services/queryValidator.js';

// Get the NODE_ENV from environment or default to development
const NODE_ENV = process.env.NODE_ENV || 'development';
console.log(`Starting MCP server in ${NODE_ENV} mode`);


// Create the MCP server
const server = new McpServer({
  name: 'arango-db-server',
  version: '1.0.0',
  description: 'Server for querying ArangoDB and getting schema information'
});

// Schema resource - provides information about the ArangoDB schema
server.resource(
  'schema',
  'schema://main',
  async () => ({
    contents: [{
      uri: 'schema://main',
      text: JSON.stringify({
        collections: COLLECTIONS,
        graph: GRAPH,
        indexes: INDEXES
      }, null, 2)
    }]
  })
);


// Query tool - allows executing custom AQL queries with LLM validation
server.tool(
  'query',
  {
    query: z.string().describe('AQL query to execute against the database'),
    bindVars: z.record(z.any()).optional().describe('Bind variables to use in the parameterized query'),
  },
  async ({ query, bindVars = {} }) => {
    try {
      // Validate the query for safety (not destructive and doesn't use/expose personal data)
      try {
          const validation = await validateQuery(query);
          
          // If the query is not safe, return an error
          if (!validation.isSafe) {
            return {
              content: [{
                type: 'text',
                text: `Query validation failed: This query appears to be unsafe. ${validation.reason}`
              }],
              isError: true
            };
          }
        } catch (validationError) {
          console.warn('Query validation failed:', validationError instanceof Error ? validationError.message : String(validationError));
          return {
            content: [{
              type: 'text',
              text: `Query execution aborted: Unable to validate query safety. ${validationError instanceof Error ? validationError.message : String(validationError)}`
            }],
            isError: true
          };
        }
      
      // Execute the query
      const results = await executeQuery(query, bindVars);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(results, null, 2)
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{
          type: 'text',
          text: `Error executing query: ${errorMessage}`
        }],
        isError: true
      };
    }
  }
);


// Connect to stdio transport for MCP communication
const transport = new StdioServerTransport();
await server.connect(transport);

// Export the server for potential programmatic use
export default server; 