// Mock axios before importing the module that uses it
const mockGet = jest.fn();

jest.mock('axios', () => {
  return {
    create: jest.fn(() => ({
      get: mockGet
    }))
  };
});

// Import after setting up the mock
import { fetchUserData } from '../githubService';

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
      mockGet.mockResolvedValueOnce({
        data: mockUserData,
        status: 200,
        headers: {}
      });

      const result = await fetchUserData('testuser');

      expect(mockGet).toHaveBeenCalledWith(
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
});
