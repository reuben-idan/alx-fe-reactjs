import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const GITHUB_API_URL = 'https://api.github.com/search/users?q';

// Create a custom axios instance with cache
const axiosInstance = axios.create({
  baseURL: GITHUB_API_URL,
  timeout: 15000, // 15 seconds
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28' // Specify API version
  }
});

// Add caching to axios instance (5 minute cache by default)
const api = setupCache(axiosInstance, {
  ttl: 5 * 60 * 1000, // 5 minutes
  methods: ['get'],
  cachePredicate: {
    statusCheck: (status) => status >= 200 && status < 400,
  },
  etag: true,
  interpretHeader: true,
});

// Request interceptor for auth and common headers
api.interceptors.request.use(
  (config) => {
    // Add GitHub token if available in localStorage
    const token = localStorage.getItem('github_token');
    if (token) {
      config.headers.Authorization = `token ${token}`;
    }
    
    // Add timestamp to prevent caching for certain requests
    if (config.method === 'get' && !config.params?._t) {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Check rate limit headers
    const rateLimitRemaining = response.headers['x-ratelimit-remaining'];
    const rateLimitReset = response.headers['x-ratelimit-reset'];
    
    if (rateLimitRemaining && parseInt(rateLimitRemaining) < 10) {
      console.warn(`GitHub API rate limit low: ${rateLimitRemaining} requests remaining`);
      
      if (rateLimitReset) {
        const resetTime = new Date(parseInt(rateLimitReset) * 1000);
        console.warn(`Rate limit resets at: ${resetTime.toLocaleString()}`);
      }
    }
    
    return response;
  },
  (error) => {
    // Handle rate limit errors
    if (error.response?.status === 403 && 
        error.response?.headers['x-ratelimit-remaining'] === '0') {
      const resetTime = new Date(
        parseInt(error.response.headers['x-ratelimit-reset']) * 1000
      );
      error.message = `API rate limit exceeded. Resets at ${resetTime.toLocaleTimeString()}. ` +
                     'Please add a GitHub token for higher limits.';
    }
    
    return Promise.reject(error);
  }
);

// Cancel token source for request cancellation
export const cancelTokenSource = axios.CancelToken.source();

// Function to cancel all pending requests
export const cancelAllRequests = (message = 'Request canceled by user') => {
  cancelTokenSource.cancel(message);
};

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
  const queryParts = [];

  // Always include type:user for user search
  queryParts.push('type:user');
  
  // Add username search with fuzzy matching if provided
  if (username?.trim()) {
    const usernameQuery = username.trim();
    // If it looks like an exact username match (no spaces, no special chars except -_)
    if (/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(usernameQuery)) {
      queryParts.push(`user:${usernameQuery}`);
    } else {
      // For more complex queries, use in:login for partial matches
      queryParts.push(`${usernameQuery} in:login`);
    }
  }
  
  // Add location filter with proper encoding
  if (location?.trim()) {
    // Handle multi-word locations by wrapping in quotes
    const locationQuery = location.trim();
    if (locationQuery.includes(' ')) {
      queryParts.push(`location:\"${locationQuery}\"`);
    } else {
      queryParts.push(`location:${locationQuery}`);
    }
  }
  
  // Add minimum repositories filter
  if (minRepos && !isNaN(minRepos) && minRepos > 0) {
    queryParts.push(`repos:>=${Math.floor(minRepos)}`);
  }
  
  // Add language filter with validation
  if (language?.trim()) {
    // Basic validation to prevent injection
    const langQuery = language.trim().replace(/[^\w\+\#\-]/g, '');
    if (langQuery) {
      queryParts.push(`language:${langQuery}`);
    }
  }

  // Join all query parts with spaces
  return queryParts.join('+');
};

/**
 * Fetches detailed user data for an array of users with batching and rate limiting
 * @param {Array} users - Array of user objects from search
 * @returns {Promise<Array>} - Array of detailed user data
 */
const fetchUsersDetails = async (users) => {
  if (!users || !Array.isArray(users) || users.length === 0) {
    return [];
  }

  // Process users in batches to avoid rate limiting
  const BATCH_SIZE = 5; // Number of parallel requests
  const BATCH_DELAY = 1000; // 1 second delay between batches
  const results = [];
  
  try {
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      
      // Process current batch in parallel
      const batchPromises = batch.map(user => 
        api.get(`/users/${encodeURIComponent(user.login)}`, {
          cancelToken: cancelTokenSource.token,
          // Use cache for user details but with a shorter TTL
          cache: { ttl: 2 * 60 * 1000 } // 2 minutes
        })
          .then(response => {
            // Add additional metadata
            const userData = response.data;
            return {
              ...userData,
              // Add derived fields
              account_age: userData.created_at 
                ? Math.floor((new Date() - new Date(userData.created_at)) / (1000 * 60 * 60 * 24 * 365))
                : null,
              has_organization: userData.type === 'Organization'
            };
          })
          .catch(error => {
            if (axios.isCancel(error)) {
              console.log('Request canceled:', error.message);
              return null;
            }
            console.error(`Error fetching user ${user.login}:`, error);
            return { 
              ...user, 
              error: error.response?.status === 404 ? 'User not found' : 'Failed to fetch details',
              status: error.response?.status || 500
            };
          })
      );

      // Wait for current batch to complete
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(Boolean));
      
      // Add delay between batches if not the last batch
      if (i + BATCH_SIZE < users.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }
    
    return results;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('User details fetch canceled:', error.message);
      return [];
    }
    console.error('Error in fetchUsersDetails:', error);
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
/**
 * Search for GitHub users with advanced filtering and pagination
 * @param {Object} params - Search parameters
 * @param {string} [params.username=''] - Username to search for
 * @param {string} [params.location=''] - Filter by location
 * @param {number} [params.minRepos=0] - Minimum number of repositories
 * @param {string} [params.language=''] - Primary programming language
 * @param {number} [params.page=1] - Page number (1-based)
 * @param {number} [params.perPage=10] - Results per page (max 100)
 * @param {string} [params.sort='followers'] - Sort field (followers, repositories, joined)
 * @param {string} [params.order='desc'] - Sort order (asc, desc)
 * @returns {Promise<{data: Object|null, error: string|null}>} - Search results and error if any
 */
export const searchUsers = async ({
  username = '',
  location = '',
  minRepos = 0,
  language = '',
  page = 1,
  perPage = 10,
  sort = 'followers',
  order = 'desc'
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
    
    // Make the API request with cancellation support
    const response = await api.get('/search/users', {
      params: {
        q: query,
        page: currentPage,
        per_page: itemsPerPage,
        sort: ['followers', 'repositories', 'joined'].includes(sort) ? sort : 'followers',
        order: order === 'asc' ? 'asc' : 'desc',
        // Add cache control headers
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'If-None-Match': '' // Allow conditional requests
      },
      cancelToken: cancelTokenSource.token,
      // Cache search results for 1 minute
      cache: { ttl: 60 * 1000 }
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

    // Get rate limit info from headers if available
    const rateLimit = {
      remaining: parseInt(response.headers['x-ratelimit-remaining']) || 0,
      limit: parseInt(response.headers['x-ratelimit-limit']) || 60,
      reset: response.headers['x-ratelimit-reset'] 
        ? new Date(parseInt(response.headers['x-ratelimit-reset']) * 1000)
        : null
    };

    // Fetch detailed user data for each result
    const usersWithDetails = await fetchUsersDetails(response.data.items);
    
    // Calculate if there are more results
    const totalResults = Math.min(response.data.total_count, 1000); // GitHub returns max 1000 results
    const hasMoreResults = (currentPage * itemsPerPage) < totalResults;
    
    // Add rate limit info to the response
    const rateLimitInfo = {
      remaining: rateLimit.remaining,
      limit: rateLimit.limit,
      reset: rateLimit.reset,
      used: rateLimit.limit - rateLimit.remaining,
      remainingPercentage: Math.round((rateLimit.remaining / rateLimit.limit) * 100)
    };

    return {
      data: {
        items: usersWithDetails,
        totalCount: totalResults,
        page: currentPage,
        perPage: itemsPerPage,
        hasMore: hasMoreResults,
        rateLimit: rateLimitInfo,
        query: query // Return the constructed query for debugging
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
