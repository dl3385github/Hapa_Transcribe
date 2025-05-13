/**
 * API Service
 * Handles all communication with the backend API
 */

// API base URL - read from environment or default to localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Get an ephemeral token from the backend
 * @param apiKey OpenAI API key
 * @returns Promise with the ephemeral token and expiration time
 */
export const getEphemeralToken = async (apiKey: string): Promise<{ token: string, expires_at: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/transcribe/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In a production app with proper auth, we'd use a different auth method
        // but for this simplified version, we'll pass the OpenAI key directly
        'X-API-Key': apiKey
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get ephemeral token');
    }

    const data = await response.json();
    return {
      token: data.token,
      expires_at: data.expires_at
    };
  } catch (error) {
    console.error('Error fetching ephemeral token:', error);
    throw error;
  }
};

/**
 * Check if the backend API is healthy
 * @returns Promise with health status
 */
export const checkApiHealth = async (): Promise<{ status: string, timestamp: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error('API health check failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API health check error:', error);
    throw error;
  }
}; 