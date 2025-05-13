import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Generate an ephemeral token for OpenAI's WebRTC API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const generateEphemeralToken = async (req, res, next) => {
  try {
    // Get the API key from the request header or use the server's API key
    const apiKey = req.headers['x-api-key'] || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(401).json({
        error: {
          message: 'API key is required. Provide it via X-API-Key header or configure it on the server.'
        }
      });
    }

    // Request an ephemeral token from OpenAI exactly as shown in the documentation
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Using the correct realtime model as shown in the documentation
        model: 'gpt-4o-realtime-preview-2024-12-17',
      }),
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return res.status(response.status).json({
        error: {
          message: errorData.error?.message || 'Failed to generate ephemeral token',
          type: errorData.error?.type || 'unknown_error',
        }
      });
    }

    // Get the response data
    const data = await response.json();
    
    // Send back the JSON we received from the OpenAI REST API
    // This matches the example in the documentation
    res.send(data);
  } catch (error) {
    console.error('Error generating ephemeral token:', error);
    next(error);
  }
}; 