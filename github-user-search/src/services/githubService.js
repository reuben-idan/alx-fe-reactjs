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
 * Builds a search query string from search parameters
 * @param {Object} params - Search parameters
 * @param {string} params.username - Username to search for
 * @param {string} params.location - Filter by location
 * @param {number} params.minRepos - Minimum number of repositories
 * @param {string} params.language - Primary programming language
 * @returns {string} - Formatted query string for GitHub API
 */
const buildSearchQuery = (params) => {
  const { username, location, minRepos, language } = params;
  let queryParts = [];

  // Add username search (if provided)
  if (username && username.trim()) {
    queryParts.push(`${username.trim()} in:login`);
  } else {
    // If no username is provided, search for all users (with other filters)
    queryParts.push('type:user');
  }
  
  // Add location filter (if provided)
  if (location && location.trim()) {
    queryParts.push(`location:${location.trim()}`);
  }
  
  // Add minimum repositories filter (if provided)
  if (minRepos && !isNaN(minRepos) && minRepos > 0) {
    queryParts.push(`repos:>=${Math.floor(minRepos)}`);
  }
  
  // Add language filter (if provided)
  if (language && language.trim()) {
    queryParts.push(`language:${language.trim()}`);
  }

  // Join all query parts with spaces and encode for URL
  return queryParts.join('+');
};

/**
 * Fetches detailed user data for an array of users
 * @param {Array} users - Array of user objects from search
 * @returns {Promise<Array>} - Array of detailed user data
 */
const fetchUsersDetails = async (users) => {
  try {
    const userPromises = users.map(user => 
      api.get(`/users/${user.login}`).then(res => res.data)
    );
    return await Promise.all(userPromises);
  } catch (error) {
    console.error('Error fetching user details:', error);
    return [];
  }
};

/**
 * Searches for users on GitHub with advanced filters
 * @param {Object} searchParams - Search parameters
 * @param {string} searchParams.username - Username to search for
 * @param {string} searchParams.location - Filter by location
 * @param {number} searchParams.minRepos - Minimum number of repositories
 * @param {string} searchParams.language - Primary programming language
 * @param {number} searchParams.page - Page number for pagination
 * @param {number} searchParams.perPage - Number of results per page
 * @returns {Promise<{data: Object|null, error: string|null}>} - Search results and error if any
 */
export const searchUsers = async ({
  username = '',
  location = '',
  minRepos = 0,
  language = '',
  page = 1,
  perPage = 10
} = {}) => {
  try {
    // Validate input
    if (!username && !location && !minRepos && !language) {
      return {
        data: null,
        error: 'At least one search parameter is required.'
      };
    }

    // Build the search query
    const query = buildSearchQuery({ 
      username, 
      location, 
      minRepos: parseInt(minRepos, 10) || 0, 
      language 
    });
    
    // Validate page and perPage
    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const itemsPerPage = Math.min(100, Math.max(1, parseInt(perPage, 10) || 10));
    
    // Make the API request
    const response = await api.get('/search/users', {
      params: {
        q: query,
        page: currentPage,
        per_page: itemsPerPage,
        sort: 'followers',
        order: 'desc'
      }
    });

    // If no results, return early
    if (!response.data.items || response.data.items.length === 0) {
      return {
        data: {
          items: [],
          totalCount: 0,
          page: currentPage,
          perPage: itemsPerPage,
          hasMore: false
        },
        error: null
      };
    }

    // Fetch detailed user data for each result
    const usersWithDetails = await fetchUsersDetails(response.data.items);
    
    // Calculate if there are more results
    const totalResults = response.data.total_count;
    const hasMoreResults = (currentPage * itemsPerPage) < totalResults;

    return {
      data: {
        items: usersWithDetails,
        totalCount: totalResults,
        page: currentPage,
        perPage: itemsPerPage,
        hasMore: hasMoreResults
      },
      error: null
    };
  } catch (error) {
    console.error('Error searching users:', error);
    
    let errorMessage = 'An error occurred while searching for users.';
    
    if (error.response) {
      // Handle different HTTP error statuses
      switch (error.response.status) {
        case 403:
          errorMessage = 'API rate limit exceeded. Please try again later or use a GitHub token for higher limits.';
          break;
        case 422:
          errorMessage = 'Invalid search query. Please check your search parameters.';
          break;
        case 503:
          errorMessage = 'GitHub API is currently unavailable. Please try again later.';
          break;
        default:
          errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage = 'No response from GitHub. Please check your internet connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      data: null,
      error: errorMessage
    };
  }
};
