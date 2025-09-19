// Mock axios first
jest.mock('axios', () => {
  const mockGet = jest.fn();
  const mockPost = jest.fn();
  
  const mockAxiosInstance = {
    get: mockGet,
    post: mockPost,
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    }
  };
  
  const originalAxios = jest.requireActual('axios');
  const mockCreate = jest.fn(() => mockAxiosInstance);
  
  return {
    ...originalAxios,
    create: mockCreate,
    CancelToken: {
      source: jest.fn(() => ({
        token: 'test-cancel-token',
        cancel: jest.fn()
      }))
    },
    // Export mocks for testing
    __mockGet: mockGet,
    __mockPost: mockPost
  };
});

// Mock axios-cache-interceptor
jest.mock('axios-cache-interceptor', () => ({
  setupCache: jest.fn(instance => instance)
}));

// Import after setting up the mocks
import { fetchUserData, searchUsers, cancelAllRequests } from '../githubService';

// Get the mocked functions
const { __mockGet: mockGet, __mockPost: mockPost } = require('axios');

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

global.localStorage = localStorageMock;

describe('GitHub Service', () => {
  const mockUserData = {
    login: 'testuser',
    name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    html_url: 'https://github.com/testuser',
    public_repos: 10,
    followers: 20,
    following: 5,
    company: 'Test Company',
    location: 'Test Location',
    blog: 'https://testuser.dev',
    bio: 'Test bio'
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('fetchUserData', () => {
    it('should fetch user data successfully', async () => {
      // Mock successful API response
      const mockResponse = {
        data: mockUserData,
        status: 200,
        headers: {}
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await fetchUserData('testuser');

      expect(mockGet).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        data: expect.objectContaining({
          login: 'testuser',
          name: 'Test User'
        }),
        error: null
      }));
    });

    it('should handle 404 error when user is not found', async () => {
      // Mock 404 error response
      const error = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'Not Found' }
        }
      };
      mockGet.mockRejectedValueOnce(error);

      const result = await fetchUserData('nonexistentuser');

      expect(result).toEqual({
        data: null,
        error: "User 'nonexistentuser' not found."
      });
    });

    it('should handle API rate limit exceeded', async () => {
      // Mock rate limit error
      const resetTime = Math.floor(Date.now() / 1000) + 300; // 5 minutes from now
      const error = {
        response: {
          status: 403,
          statusText: 'Forbidden',
          headers: {
            'x-ratelimit-reset': resetTime.toString()
          },
          data: { message: 'API rate limit exceeded' }
        }
      };
      mockGet.mockRejectedValueOnce(error);

      const result = await fetchUserData('testuser');
      const resetDate = new Date(resetTime * 1000).toLocaleTimeString();

      expect(result).toEqual({
        data: null,
        error: `API rate limit exceeded. Please try again after ${resetDate}.`
      });
    });

    it('should handle network errors', async () => {
      // Mock network error
      const error = {
        request: {},
        message: 'Network Error'
      };
      mockGet.mockRejectedValueOnce(error);

      const result = await fetchUserData('testuser');

      expect(result).toEqual({
        data: null,
        error: 'No response from GitHub. Please check your internet connection.'
      });
    });

    it('should handle empty username', async () => {
      const result = await fetchUserData('');

      expect(mockGet).not.toHaveBeenCalled();
      expect(result).toEqual({
        data: null,
        error: 'Please enter a valid GitHub username.'
      });
    });
  });

  describe('searchUsers', () => {
    const mockSearchResults = {
      data: {
        total_count: 1,
        incomplete_results: false,
        items: [
          {
            login: 'testuser',
            id: 1,
            node_id: 'MDQ6VXNlcjE=',
            avatar_url: 'https://example.com/avatar.jpg',
            html_url: 'https://github.com/testuser',
            type: 'User',
            score: 1.0
          }
        ]
      },
      status: 200,
      headers: {
        'x-ratelimit-remaining': '29',
        'x-ratelimit-limit': '30',
        'x-ratelimit-reset': (Date.now() / 1000 + 3600).toString()
      }
    };

    const mockUserDetails = {
      login: 'testuser',
      id: 1,
      name: 'Test User',
      company: 'Test Company',
      blog: 'https://testuser.dev',
      location: 'Test Location',
      email: 'test@example.com',
      hireable: true,
      bio: 'Test bio',
      twitter_username: 'testuser',
      public_repos: 10,
      public_gists: 5,
      followers: 20,
      following: 10,
      created_at: '2011-01-25T18:44:36Z',
      updated_at: '2023-01-01T00:00:00Z'
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should search for users with basic query', async () => {
      // Mock the search API response
      mockGet.mockResolvedValueOnce({
        data: {
          items: [
            { login: 'testuser', id: 1, html_url: 'https://github.com/testuser' }
          ],
          total_count: 1,
          incomplete_results: false
        },
        status: 200,
        headers: {}
      });
      
      // Mock the user details API response
      mockGet.mockResolvedValueOnce({
        data: mockUserDetails,
        status: 200,
        headers: {}
      });

      const result = await searchUsers({ username: 'testuser' });

      // Verify the API was called with the correct parameters
      expect(mockGet).toHaveBeenCalled();
      
      // Verify the result structure
      expect(result).toEqual({
        data: expect.objectContaining({
          items: [
            expect.objectContaining({
              login: 'testuser',
              name: 'Test User'
            })
          ],
          totalCount: 1,
          hasMore: false,
          page: 1,
          perPage: 10
        }),
        error: null
      });
    });

    it('should search with advanced filters', async () => {
      // Mock the search API response
      mockGet.mockResolvedValueOnce({
        data: { items: [], total_count: 0 },
        status: 200,
        headers: {}
      });

      await searchUsers({
        username: 'test',
        location: 'San Francisco',
        minRepos: 5,
        language: 'JavaScript',
        page: 2,
        perPage: 20,
        sort: 'repositories',
        order: 'asc'
      });

      // Verify the API was called with the correct parameters
      expect(mockGet).toHaveBeenCalledWith(
        '/search/users',
        expect.objectContaining({
          params: expect.objectContaining({
            q: 'type:user+user:test+location:"San Francisco"+repos:>=5+language:JavaScript',
            page: 2,
            per_page: 20,
            sort: 'repositories',
            order: 'asc',
            'Cache-Control': 'public, max-age=300',
            'If-None-Match': ''
          }),
          cache: { ttl: 60000 },
          cancelToken: 'test-cancel-token'
        })
      );
    });

    it('should handle API rate limit exceeded', async () => {
      const resetTime = Math.floor(Date.now() / 1000) + 300; // 5 minutes from now
      const error = {
        response: {
          status: 403,
          statusText: 'Forbidden',
          headers: {
            'x-ratelimit-remaining': '0',
            'x-ratelimit-reset': resetTime.toString()
          },
          data: { message: 'API rate limit exceeded' }
        }
      };
      
      // Override the mock for this test
      mockGet.mockReset();
      mockGet.mockRejectedValueOnce(error);

      const result = await searchUsers({ username: 'testuser' });
      
      expect(result.error).toContain('API rate limit exceeded');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network Error');
      mockGet.mockRejectedValueOnce(error);

      const result = await searchUsers({ username: 'testuser' });
      expect(result.error).toContain('Network Error');
    });
  });

  describe('cancelAllRequests', () => {
    it('should cancel all pending requests', () => {
      // Import the module and get the cancelTokenSource
      const githubService = require('../githubService');
      
      // Spy on the cancel method of the cancelTokenSource
      const cancelSpy = jest.spyOn(githubService.cancelTokenSource, 'cancel');
      
      // Call the function we're testing
      const message = 'Test cancellation';
      githubService.cancelAllRequests(message);
      
      // Verify the cancel function was called with the right message
      expect(cancelSpy).toHaveBeenCalledWith(message);
      
      // Clean up
      cancelSpy.mockRestore();
    });
  });
});
