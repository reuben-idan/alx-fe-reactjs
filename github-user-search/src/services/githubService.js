import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: GITHUB_API_URL,
  headers: {
    'Accept': 'application/vnd.github.v3+json'
  },
  timeout: 10000 // 10 seconds
});

/**
 * Fetches user data from GitHub API
 * @param {string} username - GitHub username to search for
 * @returns {Promise<{data: Object|null, error: string|null}>} - User data and error if any
 */
export const fetchUserData = async (username) => {
  if (!username || typeof username !== 'string' || !username.trim()) {
    return {
      data: null,
      error: 'Please enter a valid GitHub username.'
    };
  }

  try {
    const response = await api.get(`/users/${encodeURIComponent(username.trim())}`);
    return {
      data: response.data,
      error: null
    };
  } catch (error) {
    console.error('GitHub API Error:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 404) {
        return {
          data: null,
          error: `User '${username}' not found.`
        };
      }
      
      if (error.response.status === 403) {
        // GitHub API rate limit exceeded
        const resetTime = error.response.headers['x-ratelimit-reset'];
        const resetDate = resetTime ? new Date(resetTime * 1000).toLocaleTimeString() : 'shortly';
        
        return {
          data: null,
          error: `API rate limit exceeded. Please try again after ${resetDate}.`
        };
      }
      
      return {
        data: null,
        error: `GitHub API error: ${error.response.status} ${error.response.statusText}`
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        data: null,
        error: 'No response from GitHub. Please check your internet connection.'
      };
    } else {
      // Something happened in setting up the request
      return {
        data: null,
        error: error.message || 'An error occurred while processing your request.'
      };
    }
  }
};

/**
 * Searches for users on GitHub
 * @param {string} query - Search query
 * @returns {Promise<Object>} - Search results from GitHub API
 */
export const searchUsers = async (query) => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/search/users`, {
      params: { q: query }
    });
    return {
      data: response.data.items,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: 'An error occurred while searching for users.'
    };
  }
};
