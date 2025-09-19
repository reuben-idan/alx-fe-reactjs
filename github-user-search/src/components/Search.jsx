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
      
      if (!error && data) {
        setResults(prev => ({
          items: [...prev.items, ...data.items],
          totalCount: data.total_count,
          page: nextPage,
          perPage: results.perPage,
          hasMore: (nextPage * results.perPage) < data.total_count
        }));
      }
    } catch (err) {
      console.error('Error loading more results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">GitHub User Search</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
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
            
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 h-[42px] rounded-md text-white font-medium ${
                  isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
          
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Search
              <svg 
                className={`ml-1 w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 9l-7 7-7-7" 
                />
              </svg>
            </button>
          </div>
          
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-200">
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
                      {lang}
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
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
          <div className="flex items-center">
            <img 
              src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" 
              alt="GitHub logo" 
              className="h-8 w-8 mr-3"
            />
            <div>
              <p className="font-medium">
                {error.includes('not found') ? 'Looks like we cant find any users' : error}
              </p>
              {error.includes('not found') && (
                <p className="mt-1 text-sm">Please adjust your search criteria and try again.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {results.items.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {results.totalCount.toLocaleString()} {results.totalCount === 1 ? 'user' : 'users'} found
            </h2>
            {results.totalCount > 10 && (
              <div className="text-sm text-gray-600">
                Showing {Math.min(results.items.length, results.perPage * results.page)} of {results.totalCount}
              </div>
            )}
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {results.items.map((user) => (
              <div 
                key={user.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => handleUserCardClick(user.login)}
              >
                <UserCard 
                  user={{
                    ...user,
                    ...(userDetails[user.login] || {})
                  }} 
                />
              </div>
            ))}
          </div>
          
          {results.hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className={`px-6 py-2 rounded-md text-white font-medium ${
                  isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
      
      {!isLoading && results.items.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;
