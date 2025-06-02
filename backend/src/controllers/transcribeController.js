import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Generate an ephemeral token for OpenAI's WebRTC API configured for transcription
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

    // Create a regular session but configured for transcription
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        // Configure for transcription-only mode
        modalities: ["text", "audio"],
        instructions: "You are a transcription assistant. Only transcribe what you hear, do not respond or generate replies.",
        voice: "alloy",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 1200
        },
        tool_choice: "none",
        temperature: 0.6
      }),
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return res.status(response.status).json({
        error: {
          message: errorData.error?.message || 'Failed to create session',
          type: errorData.error?.type || 'unknown_error',
        }
      });
    }

    // Get the response data
    const data = await response.json();
    
    // Send back the complete session data including client_secret
    res.json(data);
  } catch (error) {
    console.error('Error creating session:', error);
    next(error);
  }
}; 