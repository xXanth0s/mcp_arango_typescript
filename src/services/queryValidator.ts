import { ChatOpenAI, OpenAI } from '@langchain/openai';
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from 'zod';
import 'dotenv/config';

// Load environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

/**
 * Determines if a query is destructive (INSERT, UPDATE, DELETE, REMOVE operations)
 * using OpenAI LLM for validation
 */
export async function isDestructiveQuery(query: string): Promise<{
  isDestructive: boolean;
  reason: string;
}> {
  try {
    // Check for OpenAI API key
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required for query validation');
    }
    
    // Initialize the OpenAI model
    const model: ChatOpenAI = new ChatOpenAI({
      modelName: OPENAI_MODEL,
      temperature: 0,
      openAIApiKey: OPENAI_API_KEY,
    });
    
    // Create prompt template for validation
    const promptTemplate = new PromptTemplate({
      template: `
You are a database security expert tasked with evaluating ArangoDB AQL queries to determine 
if they are destructive (modifying data) or non-destructive (read-only).

Please analyze the following AQL query and determine if it is destructive. A destructive 
query will INSERT, UPDATE, REPLACE, DELETE, REMOVE, CREATE, DROP, or otherwise modify data 
or schema. A non-destructive query will only READ data (RETURN, FOR, FILTER, SORT, LIMIT, etc.).

Query: {query}

`,
      inputVariables: ["query"],
    });

    // Generate the prompt
    const prompt = await promptTemplate.format({ query });
    
    const responseSchema = z.object({
      isDestructive: z.boolean(),
      reason: z.string(),
    });
    const structuredModel = model.withStructuredOutput(responseSchema);
    // Get the LLM response
    const response = await structuredModel.invoke(prompt);
    
    try {
      return {
        isDestructive: response.isDestructive,
        reason: response.reason || 'No reason provided'
      };
    } catch (parseError) {
      console.error('Failed to parse LLM response:', response);
      throw new Error('Failed to parse validation response from LLM');
    }
  } catch (error) {
    console.error('Query validation error:', error);
    throw new Error(`Query validation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
} 