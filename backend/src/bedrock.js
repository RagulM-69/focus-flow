import { buildPrompt } from './prompt.js';
import { formatResponse } from './responseFormatter.js';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

/**
 * Invokes Amazon Bedrock Runtime using the Converse API with Amazon Nova Lite.
 * Reads AWS Region from process.env.AWS_REGION with fallback to ap-south-1.
 *
 * @param {Array} tasks - List of task objects from the frontend client.
 * @returns {Promise<Object>} Formatted ProductivityPlan JSON output.
 */
export async function generatePlanFromBedrock(tasks) {
  // 1. Compile LLM input prompt instructions
  const prompt = buildPrompt(tasks);

  // 2. Initialize Bedrock Runtime Client
  const region = process.env.AWS_REGION || 'ap-south-1';
  const client = new BedrockRuntimeClient({ region });

  // 3. Set Converse parameters (Nova Lite expects messages content block format)
  const converseParams = {
    modelId: 'global.amazon.nova-2-lite-v1:0',
    messages: [
      {
        role: 'user',
        content: [
          {
            text: prompt
          }
        ]
      }
    ],
    inferenceConfig: {
      maxTokens: 2000,
      temperature: 0.2
    }
  };

  try {
    const command = new ConverseCommand(converseParams);

    // Send command to Amazon Bedrock Runtime endpoint
    const response = await client.send(command);

    // 4. Extract generated text content
    const textResponse = response.output?.message?.content?.[0]?.text;

    if (!textResponse) {
      throw new Error('Converse API completed successfully but returned an empty text content block.');
    }

    // 5. Structure and validate response schema via responseFormatter
    return formatResponse(textResponse, tasks);
  } catch (error) {
    console.error('Amazon Bedrock Converse API invocation failed:', error);

    // Provide a descriptive runtime error back to the Lambda handler
    throw new Error(`Amazon Bedrock integration service failure: ${error.message}`);
  }
}
