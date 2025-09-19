import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com';

/**
 * Fetches user data from GitHub API
 * @param {string} username - GitHub username to search for
 * @returns {Promise<Object>} - User data from GitHub API
 */
export const fetchUserData = async (username) => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/users/${username}`);
    return {
      data: response.data,
      error: null
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return {
        data: null,
        error: 'User not found. Please check the username and try again.'
      };
    }
    return {
      data: null,
      error: 'An error occurred while fetching user data. Please try again later.'
    };
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
