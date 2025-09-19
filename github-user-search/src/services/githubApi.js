import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com';

/**
 * Search for GitHub users
 * @param {string} query - Search query
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [perPage=10] - Number of results per page
 * @returns {Promise} - Promise with search results
 */
export const searchUsers = async (query, page = 1, perPage = 10) => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/search/users`, {
      params: {
        q: query,
        page,
        per_page: perPage,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Get user details
 * @param {string} username - GitHub username
 * @returns {Promise} - Promise with user details
 */
export const getUserDetails = async (username) => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/users/${username}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user details for ${username}:`, error);
    throw error;
  }
};
