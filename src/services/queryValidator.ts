import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from '@langchain/openai';
import 'dotenv/config';
import { z } from 'zod';


/**
 * Validates an AQL query for security and privacy concerns:
 * 1. Checks if the query is destructive (INSERT, UPDATE, DELETE, REMOVE operations)
 * 2. Checks if the query uses personal user data (email, name)
 * 3. Checks if the query would return personal user data
 */
export async function validateQuery(query: string): Promise<{
  isSafe: boolean;
  reason: string;
}> {
  // Load environment variables
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
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
You are a database security and privacy expert tasked with evaluating ArangoDB AQL queries for three criteria:

1. Destructiveness: Determine if the query modifies data or schema
2. Personal Data Usage: Check if the query uses personal user data in filters or conditions. Not included into personal user data are ids, which are always present in ArangoDB.
3. Personal Data Exposure: Analyze if the query would return personal user data in results.

For this validation:
- Personal data includes user emails, names, addresses, phone numbers, or any personally identifiable information. The ID of a user is not personal data.
- Pay close attention to any "users" collection references and their fields. The collection can still be used for other purposes than personal data, like joining with other collections.
- Look for email, name, or similar fields being accessed or returned

Query to analyze: {query}

`,
      inputVariables: ["query"],
    });

    // Generate the prompt
    const prompt = await promptTemplate.format({ query });
    
    const responseSchema = z.object({
      isDestructive: z.boolean(),
      usesPersonalData: z.boolean(),
      exposesPersonalData: z.boolean(),
      reason: z.string(),
    });
    const structuredModel = model.withStructuredOutput(responseSchema);
    // Get the LLM response
    const response = await structuredModel.invoke(prompt);
    
    // A query is safe only if it's not destructive AND doesn't use personal data AND doesn't expose personal data
    const isSafe = !(response.isDestructive || response.usesPersonalData || response.exposesPersonalData);
    
    return {
      isSafe,
      reason: response.reason || 'No reason provided'
    };
  } catch (error) {
    console.error('Query validation error:', error);
    throw new Error(`Query validation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}