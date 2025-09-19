import { useState } from 'react';
import { FiSearch, FiMapPin, FiCode, FiUsers, FiChevronDown, FiChevronUp, FiGithub } from 'react-icons/fi';
import { searchUsers } from '../services/githubService';
import UserCard from './UserCard';

// html_url is used in the UserCard component to link to GitHub profiles

// List of popular programming languages for the dropdown
const POPULAR_LANGUAGES = [
  '', // Empty option for no language filter
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'C++', 'C', 'Go',
  'Ruby', 'Swift', 'Kotlin', 'Rust', 'Dart', 'Scala', 'R', 'Objective-C', 'Shell',
  'PowerShell', 'Perl', 'Lua', 'Haskell', 'Clojure', 'Elixir', 'Erlang'
].filter((value, index, self) => self.indexOf(value) === index).sort();

const Search = () => {
  // Search form state
  const [searchParams, setSearchParams] = useState({
    username: '',
    location: '',
    minRepos: '',
    language: ''
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Results state
  const [results, setResults] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    perPage: 10,
    hasMore: false
  });
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate at least one search parameter is provided
    const hasSearchCriteria = Object.values(searchParams).some(
      value => value && value.toString().trim() !== ''
    );
    
    if (!hasSearchCriteria) {
      setError('Please provide at least one search parameter');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const { data, error: searchError } = await searchUsers({
        ...searchParams,
        page: 1, // Reset to first page on new search
        perPage: results.perPage
      });
      
      if (searchError) {
        setError(searchError);
        return;
      }
      
      setResults({
        items: data.items || [],
        totalCount: data.total_count || 0,
        page: 1,
        perPage: results.perPage,
        hasMore: data.items && data.total_count ? data.items.length < data.total_count : false
      });
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
      setResults(prev => ({
        ...prev,
        items: [],
        totalCount: 0,
        hasMore: false
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  // State to store detailed user data
  const [userDetails, setUserDetails] = useState({});
  
  // Fetch detailed user data from GitHub API
  const fetchUserData = async (username) => {
    if (!username) return null;
    
    try {
      // Check if we already have the data
      if (userDetails[username]) {
        return userDetails[username];
      }
      
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (!response.ok) {
        throw new Error('User not found');
      }
      const data = await response.json();
      
      // Cache the user data
      setUserDetails(prev => ({
        ...prev,
        [username]: data
      }));
      
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };
  
  // Function to handle user card click and fetch additional data
  const handleUserCardClick = async (username) => {
    if (!userDetails[username]) {
      setIsLoading(true);
      await fetchUserData(username);
      setIsLoading(false);
    }
  };

  // Handle loading more results
  const loadMoreResults = async () => {
    if (isLoading || !results.hasMore) return;
    
    const nextPage = results.page + 1;
    setIsLoading(true);
    
    try {
      const { data, error: searchError } = await searchUsers({
        ...searchParams,
        page: nextPage,
        perPage: results.perPage
      });
      
      if (searchError) {
        setError(searchError);
        return;
      }
      
      // Combine existing items with new items
      setResults(prev => ({
        items: [...prev.items, ...(data.items || [])],
        totalCount: data.total_count || prev.totalCount,
        page: nextPage,
        perPage: results.perPage,
        hasMore: data.items && data.total_count 
          ? (prev.items.length + data.items.length) < data.total_count 
          : false
      }));
    } catch (err) {
      console.error('Error loading more results:', err);
      setError('Failed to load more results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle advanced search options
  const toggleAdvancedSearch = () => {
    setShowAdvanced(!showAdvanced);
  };
  
  // Reset search
  const resetSearch = () => {
    setSearchParams({
      username: '',
      location: '',
      minRepos: '',
      language: ''
    });
    setResults({
      items: [],
      totalCount: 0,
      page: 1,
      perPage: 10,
      hasMore: false
    });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-10">
          <FiGithub className="h-10 w-10 text-gray-900 mr-3" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            GitHub User Search
          </h1>
        </div>
        
        {/* Main content */}
        <div className="space-y-8">
        {/* Search form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={searchParams.username}
                onChange={handleInputChange}
                placeholder="Search by username..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleAdvancedSearch}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Search
                {showAdvanced ? (
                  <FiChevronUp className="ml-1 h-4 w-4" />
                ) : (
                  <FiChevronDown className="ml-1 h-4 w-4" />
                )}
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={searchParams.location}
                    onChange={handleInputChange}
                    placeholder="Filter by location..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="minRepos" className="block text-sm font-medium text-gray-700 mb-1">
                    Min Repositories
                  </label>
                  <input
                    type="number"
                    id="minRepos"
                    name="minRepos"
                    min="0"
                    value={searchParams.minRepos}
                    onChange={handleInputChange}
                    placeholder="Minimum repositories"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={searchParams.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    disabled={isLoading}
                  >
                    <option value="">Any Language</option>
                    {POPULAR_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang || 'Any Language'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </form>

        {isLoading && !results.items.length && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Searching for users...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl shadow-sm" role="alert">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">
                  {error.includes('not found') ? 'No users found' : 'Search Error'}
                </h3>
                <div className="mt-1 text-sm text-red-600">
                  <p>{error.includes('not found') ? 'We couldn\'t find any users matching your search.' : error}</p>
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={resetSearch}
                    className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Clear search
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {results.items.length > 0 && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {results.totalCount.toLocaleString()} {results.totalCount === 1 ? 'User' : 'Users'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {results.totalCount > 1 ? 'Developers found' : 'Developer found'} matching your search
                </p>
              </div>
              {results.totalCount > 10 && (
                <div className="mt-3 sm:mt-0 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                  Showing {Math.min(results.items.length, results.perPage * results.page)} of {results.totalCount}
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {results.items.map((user) => (
                <UserCard 
                  key={user.id}
                  user={{
                    ...user,
                    ...(userDetails[user.login] || {})
                  }}
                  onClick={() => handleUserCardClick(user.login)}
                />
              ))}
            </div>

            {results.hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreResults}
                  disabled={isLoading}
                  className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

          {!isLoading && results.items.length === 0 && !error && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No users found</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <div className="mt-6">
                <button
                  onClick={resetSearch}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Clear search
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
