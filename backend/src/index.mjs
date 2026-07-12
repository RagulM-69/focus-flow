import { generatePlanFromBedrock } from './bedrock.js';

/**
 * AWS Lambda Handler for FocusFlow Planner service.
 * Connects with API Gateway HTTP/REST proxy events.
 */
export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // Configured for open access in dev
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,POST'
  };

  // Handle API Gateway preflight pre-requests
  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    let body = {};
    if (event.body) {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    }

    const tasks = body.tasks || [];

    // Invoke Bedrock planner stub
    const plan = await generatePlanFromBedrock(tasks);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(plan)
    };
  } catch (error) {
    console.error('Error handling focus flow plan request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: error.message || 'Failed to generate productivity plan.'
      })
    };
  }
};
