import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request an ephemeral token from the backend using the OpenAI API key
 */
export const getEphemeralToken = async (apiKey: string): Promise<any> => {
  try {
    const response = await apiClient.post('/api/transcribe/token', {}, {
      headers: {
        'X-API-Key': apiKey
      }
    });
    
    // Return the complete response data which includes client_secret
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.error?.message || error.message;
      
      // Format nicer error messages based on status codes
      if (statusCode === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key and try again.');
      } else if (statusCode === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Error getting ephemeral token: ${errorMessage}`);
      }
    }
    throw error;
  }
};

/**
 * Check server health
 */
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/api/health');
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export default {
  getEphemeralToken,
  checkServerHealth
}; 