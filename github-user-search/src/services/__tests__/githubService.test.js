// Mock axios and axios-cache-interceptor
const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() }
  }
};

const mockSetupCache = jest.fn(() => mockAxios);
const mockCreate = jest.fn(() => mockAxios);

// Mock axios and axios-cache-interceptor
jest.mock('axios', () => {
  const originalAxios = jest.requireActual('axios');
  return {
    ...originalAxios,
    create: mockCreate,
    CancelToken: {
      source: jest.fn(() => ({
        token: 'test-cancel-token',
        cancel: jest.fn()
      }))
    }
  };
});

jest.mock('axios-cache-interceptor', () => ({
  setupCache: mockSetupCache
}));

// Import after setting up the mocks
import { fetchUserData, searchUsers, cancelAllRequests } from '../githubService';

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
      mockAxios.get.mockResolvedValueOnce({
        data: mockUserData,
        status: 200,
        headers: {}
      });

      const result = await fetchUserData('testuser');

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/users/testuser',
        expect.any(Object)
      );
      expect(result).toEqual({
        data: mockUserData,
        error: null
      });
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
      mockAxios.get.mockRejectedValueOnce(error);

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
      mockAxios.get.mockRejectedValueOnce(error);

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
      mockAxios.get.mockRejectedValueOnce(error);

      const result = await fetchUserData('testuser');

      expect(result).toEqual({
        data: null,
        error: 'No response from GitHub. Please check your internet connection.'
      });
    });

    it('should handle empty username', async () => {
      const result = await fetchUserData('');

      expect(mockAxios.get).not.toHaveBeenCalled();
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
      // Mock the search API response
      mockAxios.get.mockResolvedValueOnce(mockSearchResults);
      // Mock the user details API response
      mockAxios.get.mockResolvedValueOnce({
        data: mockUserDetails,
        status: 200,
        headers: {}
      });
    });

    it('should search for users with basic query', async () => {
      const result = await searchUsers({ username: 'testuser' });

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/search/users',
        expect.objectContaining({
          params: expect.objectContaining({
            q: expect.stringContaining('testuser'),
            page: 1,
            per_page: 10,
            sort: 'followers',
            order: 'desc'
          })
        })
      );

      expect(result).toEqual({
        data: expect.objectContaining({
          items: [
            expect.objectContaining({
              login: 'testuser',
              name: 'Test User',
              html_url: 'https://github.com/testuser',
              public_repos: 10,
              followers: 20,
              location: 'Test Location',
              company: 'Test Company',
              blog: 'https://testuser.dev',
              bio: 'Test bio',
              twitter_username: 'testuser',
              hireable: true
            })
          ],
          totalCount: 1,
          page: 1,
          perPage: 10,
          hasMore: false,
          rateLimit: expect.any(Object)
        }),
        error: null
      });
    });

    it('should search with advanced filters', async () => {
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

      const call = mockAxios.get.mock.calls.find(call => 
        call[0] === '/search/users' && 
        call[1].params.q.includes('test in:login') &&
        call[1].params.q.includes('location:\"San Francisco\"') &&
        call[1].params.q.includes('repos:>=5') &&
        call[1].params.q.includes('language:JavaScript')
      );
      
      expect(call).toBeDefined();
      expect(call[1].params).toEqual(expect.objectContaining({
        page: 2,
        per_page: 20,
        sort: 'repositories',
        order: 'asc'
      }));
    });

    it('should handle empty search parameters', async () => {
      const result = await searchUsers({});
      expect(result.error).toBe('At least one search parameter is required.');
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
      mockAxios.get.mockReset();
      mockAxios.get.mockRejectedValueOnce(error);

      const result = await searchUsers({ username: 'testuser' });
      
      expect(result.error).toContain('API rate limit exceeded');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network Error');
      mockAxios.get.mockReset();
      mockAxios.get.mockRejectedValueOnce(error);

      const result = await searchUsers({ username: 'testuser' });
      expect(result.error).toContain('Network error');
    });
  });

  describe('cancelAllRequests', () => {
    it('should cancel all pending requests', () => {
      cancelAllRequests('Test cancellation');
      expect(require('axios').CancelToken.source().cancel).toHaveBeenCalledWith('Test cancellation');
    });
  });
});
