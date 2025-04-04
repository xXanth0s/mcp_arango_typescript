// Load environment variables
import 'dotenv/config';

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { QueryRepository } from './repositories/QueryRepository.js';
import { COLLECTIONS, GRAPH, INDEXES } from './schemas/schema.js';
import { isDestructiveQuery } from './services/queryValidator.js';

// Get the NODE_ENV from environment or default to development
const NODE_ENV = process.env.NODE_ENV || 'development';
console.log(`Starting MCP server in ${NODE_ENV} mode`);

const queryRepo = new QueryRepository();

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

// Collections resource - provides information about specific collections
server.resource(
  'collection',
  new ResourceTemplate('collection://{collectionName}', { list: undefined }),
  async (uri, { collectionName }) => {
    try {
      const collectionInfo = await queryRepo.executeQuery(`
        RETURN DOCUMENT("_collections/${collectionName}")
      `);
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(collectionInfo, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          text: `Error: Collection '${collectionName}' not found or inaccessible`
        }]
      };
    }
  }
);

// Document counts resource - provides count of documents in collections
server.resource(
  'stats',
  'stats://collections',
  async () => {
    const collectionCounts: Record<string, number | string> = {};
    
    // Get counts for all document collections
    for (const collection of Object.values(COLLECTIONS)) {
      try {
        const result = await queryRepo.executeQuery<number>(`
          RETURN LENGTH(${collection})
        `);
        collectionCounts[collection] = result[0] as number;
      } catch (error) {
        collectionCounts[collection] = 'Error counting documents';
      }
    }
    
    return {
      contents: [{
        uri: 'stats://collections',
        text: JSON.stringify(collectionCounts, null, 2)
      }]
    };
  }
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
      // Check if the query is destructive using LLM validation
      try {
          const validation = await isDestructiveQuery(query);
          
          // If the query is destructive, return an error
          if (validation.isDestructive) {
            return {
              content: [{
                type: 'text',
                text: `Query validation failed: This query appears to be destructive. ${validation.reason}
                
To execute this query anyway, set skipValidation: true`
              }],
              isError: true
            };
          }
        } catch (validationError) {
          // If validation fails (e.g., no API key), warn but allow query to proceed
          console.warn('Query validation skipped:', validationError instanceof Error ? validationError.message : String(validationError));
        }
      
      // Execute the query
      const results = await queryRepo.executeQuery(query, bindVars);
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

// Recent orders tool - get recent orders with their items
server.tool(
  'recent-orders',
  {
    limit: z.number().optional().describe('Maximum number of recent orders to retrieve (default: 10)')
  },
  async ({ limit = 10 }) => {
    try {
      const results = await queryRepo.getRecentOrdersWithItems(limit);
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
          text: `Error retrieving recent orders: ${errorMessage}`
        }],
        isError: true
      };
    }
  }
);

// User purchase history tool
server.tool(
  'user-purchase-history',
  {
    userKey: z.string().describe('The unique key (_key) of the user to retrieve purchase history for')
  },
  async ({ userKey }) => {
    try {
      const results = await queryRepo.getUserPurchaseHistory(userKey);
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
          text: `Error retrieving user purchase history: ${errorMessage}`
        }],
        isError: true
      };
    }
  }
);

// Popular items tool
server.tool(
  'popular-items',
  {
    limit: z.number().optional().describe('Maximum number of popular items to retrieve (default: 10)')
  },
  async ({ limit = 10 }) => {
    try {
      const results = await queryRepo.getPopularItems(limit);
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
          text: `Error retrieving popular items: ${errorMessage}`
        }],
        isError: true
      };
    }
  }
);

// Add resource and tool descriptions for client discovery
server.resource(
  'descriptions',
  'descriptions://mcp-arango',
  async () => {
    return {
      contents: [{
        uri: 'descriptions://mcp-arango',
        text: JSON.stringify({
          resources: {
            schema: 'Provides complete information about the database schema, including collections, graph definitions, and indexes configured in the ArangoDB database',
            collection: 'Retrieves detailed information about a specific ArangoDB collection, including its properties and configuration',
            stats: 'Provides document counts for all collections in the database, giving a quick overview of the data volume in each collection'
          },
          tools: {
            query: 'Executes a custom AQL query against the ArangoDB database with optional bind variables for parameterized queries. Uses LLM validation to prevent destructive operations by default. Set skipValidation:true to bypass validation for data modification queries.',
            'recent-orders': 'Retrieves the most recent orders along with their items and user information, providing a complete view of recent purchase activities in the system.',
            'user-purchase-history': 'Retrieves the complete purchase history for a specific user, including all orders, their items, quantities, and pricing information.',
            'popular-items': 'Identifies and returns the most popular items based on total sales quantity, providing insights into top-selling products.'
          },
          prompts: {
            'aql-query': 'Provides assistance in generating AQL queries by explaining the database structure and available collections.'
          }
        }, null, 2)
      }]
    };
  }
);

// Connect to stdio transport for MCP communication
const transport = new StdioServerTransport();
await server.connect(transport);

// Export the server for potential programmatic use
export default server; 