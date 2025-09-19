import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const GITHUB_API_URL = 'https://api.github.com';
const USERS_ENDPOINT = '/search/users';
const USER_DETAILS_ENDPOINT = '/users';

// Default rate limit values (will be updated from response headers)
let rateLimitRemaining = 60;
let rateLimitReset = 0;
let rateLimitUsed = 0;
let rateLimitTotal = 60;

// Create a custom axios instance with cache
const axiosInstance = axios.create({
  baseURL: GITHUB_API_URL,
  timeout: 15000, // 15 seconds
  headers: {
    'Accept': 'application/vnd.github.v3+json, application/vnd.github.mercy-preview+json',
    'X-GitHub-Api-Version': '2022-11-28' // Specify API version
  }
});

// Add caching to axios instance (5 minute cache by default)
const api = setupCache(axiosInstance, {
  ttl: 5 * 60 * 1000, // 5 minutes
  methods: ['get'],
  cachePredicate: {
    statusCheck: (status) => status >= 200 && status < 400,
    // Don't cache error responses
    responseMatch: (response) => response.status >= 200 && response.status < 400,
  },
  etag: true,
  interpretHeader: true,
  // Don't cache requests with query parameters that include timestamps
  exclude: { query: false },
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

// Response interceptor for error handling and rate limiting
api.interceptors.response.use(
  (response) => {
    // Update rate limit information from headers
    if (response.headers['x-ratelimit-remaining'] !== undefined) {
      rateLimitRemaining = parseInt(response.headers['x-ratelimit-remaining']);
      rateLimitReset = parseInt(response.headers['x-ratelimit-reset']) * 1000; // Convert to ms
      rateLimitUsed = parseInt(response.headers['x-ratelimit-used']);
      rateLimitTotal = parseInt(response.headers['x-ratelimit-limit']);
      
      if (rateLimitRemaining < 10) {
        console.warn(`GitHub API rate limit low: ${rateLimitRemaining}/${rateLimitTotal} requests remaining`);
        console.warn(`Rate limit resets at: ${new Date(rateLimitReset).toLocaleTimeString()}`);
      }
    }
    
    return response;
  },
  async (error) => {
    if (!error.response) {
      // Network error or server not reachable
      error.message = 'Unable to connect to GitHub. Please check your internet connection.';
      return Promise.reject(error);
    }
    
    const { status, data } = error.response;
    const resetTime = error.response.headers['x-ratelimit-reset'] 
      ? new Date(parseInt(error.response.headers['x-ratelimit-reset']) * 1000) 
      : null;
    
    switch (status) {
      case 403: // Forbidden - typically rate limit exceeded
        if (error.response.headers['x-ratelimit-remaining'] === '0') {
          error.message = `API rate limit exceeded. Resets at ${resetTime.toLocaleTimeString()}. ` +
                         (rateLimitTotal === 60 
                           ? 'Add a GitHub personal access token for higher limits.' 
                           : 'Please try again later.');
        } else {
          error.message = 'Access to this resource is forbidden. You may not have the necessary permissions.';
        }
        break;
      case 404: // Not Found
        error.message = 'The requested resource was not found.';
        break;
      case 422: // Unprocessable Entity
        error.message = 'Invalid search parameters. Please adjust your search and try again.';
        break;
      case 401: // Unauthorized
        error.message = 'Authentication failed. Please check your GitHub token.';
        // Clear invalid token
        localStorage.removeItem('github_token');
        break;
      case 500: // Internal Server Error
      case 502: // Bad Gateway
      case 503: // Service Unavailable
      case 504: // Gateway Timeout
        error.message = 'GitHub service is currently unavailable. Please try again later.';
        break;
      default:
        error.message = data?.message || 'An unexpected error occurred. Please try again.';
    }
    
    // Add additional debug info in development
    if (process.env.NODE_ENV === 'development') {
      console.error('GitHub API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config.url,
        method: error.config.method,
        params: error.config.params,
        response: data
      });
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
 * Get current rate limit information
 * @returns {Object} Rate limit information
 */
export const getRateLimitInfo = () => ({
  remaining: rateLimitRemaining,
  total: rateLimitTotal,
  used: rateLimitUsed,
  reset: rateLimitReset,
  resetIn: Math.max(0, Math.ceil((rateLimitReset - Date.now()) / 1000)), // seconds until reset
  percentageUsed: Math.round((rateLimitUsed / rateLimitTotal) * 100)
});

/**
 * Check if rate limit is close to being exceeded
 * @param {number} [buffer=5] - Buffer for remaining requests
 * @returns {boolean} True if rate limit is close to being exceeded
 */
export const isRateLimitLow = (buffer = 5) => {
  return rateLimitRemaining <= buffer;
};

/**
 * Fetches detailed user data from GitHub API
 * @param {string} username - GitHub username to fetch
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
 * @param {string} [params.username=''] - Username to search for
 * @param {string} [params.name=''] - Full name to search for
 * @param {string} [params.location=''] - Filter by location
 * @param {string} [params.company=''] - Filter by company
 * @param {number} [params.minRepos=0] - Minimum number of repositories
 * @param {number} [params.maxRepos=0] - Maximum number of repositories
 * @param {number} [params.minFollowers=0] - Minimum number of followers
 * @param {number} [params.maxFollowers=0] - Maximum number of followers
 * @param {string} [params.language=''] - Primary programming language
 * @param {string} [params.created=''] - Created date filter (e.g., '>2020-01-01')
 * @param {string} [params.type=''] - User type (user, org)
 * @param {boolean} [params.hireable] - If user is hireable
 * @returns {string} - Formatted query string for GitHub API
 */
const buildSearchQuery = (params = {}) => {
  const {
    username = '',
    name = '',
    location = '',
    company = '',
    minRepos = 0,
    maxRepos = 0,
    minFollowers = 0,
    maxFollowers = 0,
    language = '',
    created = '',
    type = '',
    hireable
  } = params;

  const queryParts = [];

  // Username search (login)
  if (username) {
    queryParts.push(`${username} in:login`);
  }

  // Full name search
  if (name) {
    queryParts.push(`${name} in:name`);
  }

  // Location filter
  if (location) {
    queryParts.push(`location:${location}`);
  }

  // Company filter
  if (company) {
    queryParts.push(`company:${company}`);
  }

  // Repository count filters
  if (minRepos > 0) {
    queryParts.push(`repos:>=${minRepos}`);
  }
  if (maxRepos > 0) {
    queryParts.push(`repos:<=${maxRepos}`);
  }

  // Follower count filters
  if (minFollowers > 0) {
    queryParts.push(`followers:>=${minFollowers}`);
  }
  if (maxFollowers > 0) {
    queryParts.push(`followers:<=${maxFollowers}`);
  }

  // Language filter (from user's repositories)
  if (language) {
    queryParts.push(`language:${language}`);
  }

  // Account creation date filter
  if (created) {
    queryParts.push(`created:${created}`);
  }

  // User type filter
  if (type) {
    queryParts.push(`type:${type}`);
  }

  // Hireable filter
  if (hireable !== undefined) {
    queryParts.push(`hireable:${hireable}`);
  }

  // If no specific filters, search for all users
  if (queryParts.length === 0) {
    queryParts.push('type:user');
  }

  return queryParts.join('+');
};

/**
 * Fetches detailed user data for an array of users with batching and rate limiting
 * @param {Array} users - Array of user objects from search
 * @returns {Promise<Array>} - Array of detailed user data
 */
export const fetchUsersDetails = async (users) => {
  if (!users || !Array.isArray(users) || users.length === 0) {
    return [];
  }
  
  // If we have a lot of users, only fetch details for the first 30 to avoid rate limiting
  const maxUsersToFetch = 30;
  const usersToFetch = users.length > maxUsersToFetch 
    ? users.slice(0, maxUsersToFetch) 
    : users;
  
  // Check if we have enough rate limit remaining
  if (isRateLimitLow(usersToFetch.length + 5)) { // +5 buffer for other requests
    console.warn(`Skipping user details fetch due to low rate limit (${rateLimitRemaining} remaining)`);
    return users; // Return original users without details
  }

  // Process users in batches to avoid rate limiting
  const batchSize = 3; // Reduced from 5 to be more conservative
  const batches = [];
  
  for (let i = 0; i < usersToFetch.length; i += batchSize) {
    // Check rate limit before each batch
    if (isRateLimitLow(batchSize + 2)) { // +2 buffer for other requests
      console.warn(`Stopping batch processing due to low rate limit (${rateLimitRemaining} remaining)`);
      break;
    }
    
    const batch = usersToFetch.slice(i, i + batchSize);
    const userPromises = batch.map(user => 
      api.get(`/users/${encodeURIComponent(user.login)}`, {
        // Add cache control headers
        headers: {
          'Cache-Control': 'max-age=300', // 5 minutes
          'If-None-Match': user.etag // Use etag for conditional requests
        }
      })
        .then(response => {
          // Update rate limit info from response
          if (response.headers['x-ratelimit-remaining']) {
            rateLimitRemaining = parseInt(response.headers['x-ratelimit-remaining']);
            rateLimitReset = parseInt(response.headers['x-ratelimit-reset']) * 1000;
          }
          return response.data;
        })
        .catch(error => {
          if (error.response?.status === 304) {
            // Not modified - use cached data if available
            return user;
          }
          console.error(`Error fetching user ${user.login}:`, error);
          return user; // Return original user data if details fetch fails
        })
    );
    
    // Wait for all requests in the batch to complete
    const batchResults = await Promise.all(userPromises);
    batches.push(...batchResults);
    
    // Add a small delay between batches to avoid hitting rate limits
    if (i + batchSize < usersToFetch.length) {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Increased delay
    }
  }
  
  // Combine the detailed data with the original user data
  const result = batches.map((userDetails, index) => {
    // If we got detailed data, merge it with the original user data
    if (userDetails && typeof userDetails === 'object') {
      return {
        ...usersToFetch[index],
        ...userDetails,
        // Preserve the original avatar URL if the detailed one fails to load
        avatar_url: userDetails.avatar_url || usersToFetch[index].avatar_url,
        // Add a flag to indicate if we have detailed data
        _hasDetails: true
      };
    }
    // If we didn't get detailed data, return the original user data
    return {
      ...usersToFetch[index],
      _hasDetails: false
    };
  });
  
  return result;
};

/**
 * Search for GitHub users with advanced filtering and pagination
 * @param {Object} params - Search parameters
 * @param {string} [params.username=''] - Username to search for
 * @param {string} [params.name=''] - Full name to search for
 * @param {string} [params.location=''] - Filter by location
 * @param {string} [params.company=''] - Filter by company
 * @param {number} [params.minRepos=0] - Minimum number of repositories
 * @param {number} [params.maxRepos=0] - Maximum number of repositories
 * @param {number} [params.minFollowers=0] - Minimum number of followers
 * @param {number} [params.maxFollowers=0] - Maximum number of followers
 * @param {string} [params.language=''] - Primary programming language
 * @param {string} [params.created=''] - Created date filter (e.g., '>2020-01-01')
 * @param {string} [params.type=''] - User type (user, org)
 * @param {boolean} [params.hireable] - If user is hireable
 * @param {number} [params.page=1] - Page number (1-based)
 * @param {number} [params.perPage=10] - Results per page (max 100)
 * @param {string} [params.sort='followers'] - Sort field (followers, repositories, joined)
 * @param {string} [params.order='desc'] - Sort order (asc, desc)
 * @returns {Promise<{data: Object|null, error: string|null}>} - Search results and error if any
 */
export const searchUsers = async ({
  username = '',
  name = '',
  location = '',
  company = '',
  minRepos = 0,
  maxRepos = 0,
  minFollowers = 0,
  maxFollowers = 0,
  language = '',
  created = '',
  type = '',
  hireable,
  page = 1,
  perPage = 10,
  sort = 'followers',
  order = 'desc'
} = {}) => {
  try {
    // Check rate limit before making the request
    if (isRateLimitLow(5)) {
      const resetTime = new Date(rateLimitReset).toLocaleTimeString();
      return {
        data: null,
        error: `API rate limit almost exhausted. Only ${rateLimitRemaining} requests remaining until ${resetTime}.`
      };
    }

    // Build the search query
    const query = buildSearchQuery({
      username,
      name,
      location,
      company,
      minRepos,
      maxRepos,
      minFollowers,
      maxFollowers,
      language,
      created,
      type,
      hireable
    });

    if (!query) {
      return { data: { items: [], total_count: 0, incomplete_results: false }, error: null };
    }

    // Validate page and perPage
    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const itemsPerPage = Math.min(100, Math.max(1, parseInt(perPage, 10) || 10));
    
    // Make the API request
    const response = await api.get('/search/users', {
      params: {
        q: query,
        page,
        per_page: Math.min(Math.max(1, perPage), 100), // Clamp between 1-100
        sort,
        order,
        _t: Date.now() // Prevent caching
      },
      cancelToken: cancelTokenSource.token,
      // Add timeout for the request (in addition to the axios instance timeout)
      timeout: 10000 // 10 seconds
    });

    // If no results, return empty array
    if (!response.data || !response.data.items) {
      return { 
        data: { 
          items: [], 
          total_count: 0, 
          incomplete_results: false 
        }, 
        error: null 
      };
    }

    try {
      // Fetch detailed user data for each user in the results
      const usersWithDetails = await fetchUsersDetails(response.data.items);
      
      return {
        data: {
          ...response.data,
          items: usersWithDetails
        },
        error: null
      };
    } catch (detailsError) {
      // If we can't get details, return the basic user data we have
      console.warn('Could not fetch user details:', detailsError);
      return {
        data: response.data,
        error: 'User search completed, but some details could not be loaded.'
      };
    }
  } catch (error) {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    if (axios.isCancel(error)) {
      return { data: null, error: 'Search was cancelled' };
    } 
    
    if (error.response) {
      // Handle different HTTP status codes
      switch (error.response.status) {
        case 403:
          if (error.response.headers['x-ratelimit-remaining'] === '0') {
            const resetTime = new Date(parseInt(error.response.headers['x-ratelimit-reset']) * 1000);
            errorMessage = `Rate limit exceeded. Resets at ${resetTime.toLocaleTimeString()}`;
          } else {
            errorMessage = 'Access to this resource is forbidden. You may need to authenticate.';
          }
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 422:
          errorMessage = 'Invalid search query. Please check your search parameters.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = 'GitHub service is currently unavailable. Please try again later.';
          break;
        default:
          errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response from GitHub. Please check your internet connection.';
    } else if (error.message) {
      // Something happened in setting up the request
      errorMessage = error.message;
    }
    
    console.error('Search error:', { error, message: errorMessage });
    
    return {
      data: null,
      error: errorMessage
    };
  }
};
