import { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiMapPin, 
  FiCode, 
  FiUsers, 
  FiChevronDown, 
  FiChevronUp, 
  FiGithub, 
  FiFilter,
  FiGrid,
  FiMap,
  FiList,
  FiStar,
  FiClock,
  FiUserCheck,
  FiX
} from 'react-icons/fi';
import { searchUsers } from '../services/githubService';
import UserCard from './UserCard';
import dynamic from 'next/dynamic';

// Dynamically import the Map component to avoid SSR issues
const MapWithNoSSR = dynamic(
  () => import('./Map'),
  { ssr: false }
);

// html_url is used in the UserCard component to link to GitHub profiles

// List of popular programming languages for the dropdown
const POPULAR_LANGUAGES = [
  '', // Empty option for no language filter
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'C++', 'C', 'Go',
  'Ruby', 'Swift', 'Kotlin', 'Rust', 'Dart', 'Scala', 'R', 'Objective-C', 'Shell',
  'PowerShell', 'Perl', 'Lua', 'Haskell', 'Clojure', 'Elixir', 'Erlang'
].filter((value, index, self) => self.indexOf(value) === index).sort();

// Sort options
const SORT_OPTIONS = [
  { value: 'best-match', label: 'Best match' },
  { value: 'followers', label: 'Most followers' },
  { value: 'repositories', label: 'Most repositories' },
  { value: 'joined', label: 'Most recently joined' },
  { value: 'repositories-desc', label: 'Fewest repositories' },
];

// View modes
const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  MAP: 'map'
};

const Search = () => {
  // Search form state
  const [searchParams, setSearchParams] = useState({
    username: '',
    location: '',
    minRepos: '',
    language: '',
    minFollowers: '',
    maxFollowers: '',
    created: '',
    sort: 'best-match',
    order: 'desc',
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [filters, setFilters] = useState({
    hasLocation: false,
    hasBio: false,
    hasHireable: false,
  });
  
  // Results state
  const [results, setResults] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    perPage: 10,
    hasMore: false,
    rateLimit: {
      remaining: 30,
      limit: 30,
      reset: null,
    },
  });
  
  // Map state
  const [mapCenter, setMapCenter] = useState({
    lat: 20,
    lng: 0,
    zoom: 2,
  });
  
  // Track if user has scrolled to the bottom
  const [isAtBottom, setIsAtBottom] = useState(false);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Toggle view mode
  const toggleViewMode = (mode) => {
    setViewMode(mode);
    // Store view mode preference in localStorage
    localStorage.setItem('githubUserSearchViewMode', mode);
  };
  
  // Load view mode preference on component mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem('githubUserSearchViewMode');
    if (savedViewMode && Object.values(VIEW_MODES).includes(savedViewMode)) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate at least one search parameter is provided
    const hasSearchCriteria = Object.entries(searchParams).some(
      ([key, value]) => 
        value && 
        value.toString().trim() !== '' && 
        !['sort', 'order', 'page', 'perPage'].includes(key)
    );
    
    if (!hasSearchCriteria) {
      setError('Please provide at least one search parameter');
      return;
    }
    
    // Validate minFollowers and maxFollowers
    if (searchParams.minFollowers && searchParams.maxFollowers && 
        parseInt(searchParams.minFollowers) > parseInt(searchParams.maxFollowers)) {
      setError('Minimum followers cannot be greater than maximum followers');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Build query parameters
      const queryParams = {
        ...searchParams,
        page: 1, // Reset to first page on new search
        perPage: results.perPage,
        sort: searchParams.sort === 'best-match' ? undefined : searchParams.sort,
        order: searchParams.sort === 'best-match' ? undefined : searchParams.order,
      };
      
      // Add filters to query
      const queryWithFilters = {
        ...queryParams,
        ...(filters.hasLocation && { hasLocation: true }),
        ...(filters.hasBio && { hasBio: true }),
        ...(filters.hasHireable && { hasHireable: true }),
      };
      
      const { data, error: searchError } = await searchUsers(queryWithFilters);
      
      if (searchError) {
        setError(searchError);
        return;
      }
      
      setResults({
        items: data.items || [],
        totalCount: data.totalCount || 0,
        page: 1,
        perPage: results.perPage,
        hasMore: data.items && data.totalCount ? data.items.length < data.totalCount : false,
        rateLimit: data.rateLimit || results.rateLimit,
      });
      
      // Update map center if we have location-based results
      if (data.items?.some(user => user.location)) {
        updateMapCenter(data.items);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred while searching. Please try again.');
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
    if (isLoading || isLoadingMore || !results.hasMore) return;
    
    const nextPage = results.page + 1;
    setIsLoadingMore(true);
    
    try {
      const { data, error: searchError } = await searchUsers({
        ...searchParams,
        page: nextPage,
        perPage: results.perPage,
        sort: searchParams.sort === 'best-match' ? undefined : searchParams.sort,
        order: searchParams.sort === 'best-match' ? undefined : searchParams.order,
      });
      
      if (searchError) {
        setError(searchError);
        return;
      }
      
      // Combine existing items with new items
      setResults(prev => ({
        items: [...prev.items, ...(data.items || [])],
        totalCount: data.totalCount || prev.totalCount,
        page: nextPage,
        perPage: results.perPage,
        hasMore: data.items && data.totalCount 
          ? (prev.items.length + data.items.length) < data.totalCount 
          : false,
        rateLimit: data.rateLimit || prev.rateLimit,
      }));
      
      // Update map with new results
      if (data.items?.some(user => user.location)) {
        updateMapCenter([...results.items, ...data.items].filter(user => user.location));
      }
    } catch (err) {
      console.error('Error loading more results:', err);
      setError('Failed to load more results. Please try again.');
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  // Update map center based on user locations
  const updateMapCenter = (users) => {
    if (!users || users.length === 0) return;
    
    // Filter users with valid locations
    const usersWithLocations = users.filter(user => user.location);
    
    if (usersWithLocations.length === 0) return;
    
    // Simple average of coordinates (in a real app, you'd want to geocode the locations)
    const avgLat = usersWithLocations.reduce((sum, user) => sum + (user.lat || 0), 0) / usersWithLocations.length;
    const avgLng = usersWithLocations.reduce((sum, user) => sum + (user.lng || 0), 0) / usersWithLocations.length;
    
    // Only update if we have valid coordinates
    if (!isNaN(avgLat) && !isNaN(avgLng)) {
      setMapCenter({
        lat: avgLat,
        lng: avgLng,
        zoom: 4, // Zoom in a bit when we have a location
      });
    }
  };
  
  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const bottomPosition = document.documentElement.offsetHeight - 200; // 200px before bottom
      
      if (scrollPosition >= bottomPosition && !isLoading && !isLoadingMore && results.hasMore) {
        loadMoreResults();
      }
      
      // Update isAtBottom state for UI feedback
      setIsAtBottom(window.innerHeight + window.scrollY >= document.body.offsetHeight - 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, isLoadingMore, results.hasMore]);
  };
  
  // Toggle advanced search options
  const toggleAdvancedSearch = () => {
    setShowAdvanced(!showAdvanced);
    
    // Scroll to search form when opening advanced options
    if (!showAdvanced) {
      setTimeout(() => {
        document.getElementById('search-form')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };
  
  // Format date for date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };
  
  // Reset search
  const resetSearch = () => {
    setSearchParams({
      username: '',
      location: '',
      minRepos: '',
      language: '',
      minFollowers: '',
      maxFollowers: '',
      created: '',
      sort: 'best-match',
      order: 'desc',
    });
    setFilters({
      hasLocation: false,
      hasBio: false,
      hasHireable: false,
    });
    setResults({
      items: [],
      totalCount: 0,
      page: 1,
      perPage: 10,
      hasMore: false,
      rateLimit: {
        remaining: 30,
        limit: 30,
        reset: null,
      },
    });
    setError('');
  };
  
  // Get filter count for the filter button badge
  const getActiveFilterCount = () => {
    let count = 0;
    
    // Count search params
    count += Object.entries(searchParams).filter(([key, value]) => 
      value && value.toString().trim() !== '' && 
      !['sort', 'order', 'page', 'perPage'].includes(key)
    ).length;
    
    // Count filters
    count += Object.values(filters).filter(Boolean).length;
    
    return count;
  };
  
  // Format rate limit reset time
  const formatRateLimitReset = (resetTime) => {
    if (!resetTime) return '';
    
    const now = new Date();
    const resetDate = new Date(resetTime);
    const diffMs = resetDate - now;
    const diffMins = Math.ceil(diffMs / 60000);
    
    if (diffMins <= 0) return 'now';
    return `in ${diffMins} min${diffMins > 1 ? 's' : ''}`;
  };
  
  // Calculate rate limit percentage
  const rateLimitPercentage = Math.round((results.rateLimit.remaining / results.rateLimit.limit) * 100);
  
  // Get rate limit status color
  const getRateLimitColor = () => {
    if (rateLimitPercentage < 10) return 'bg-red-500';
    if (rateLimitPercentage < 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <FiGithub className="h-10 w-10 text-gray-900 mr-3" />
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              GitHub User Search
            </h1>
          </div>
          
          {/* Rate limit indicator */}
          <div className="flex items-center text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
            <span className="hidden sm:inline mr-2">API Rate Limit:</span>
            <div className="flex items-center">
              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className={`h-2 rounded-full ${getRateLimitColor()}`}
                  style={{ width: `${Math.max(5, rateLimitPercentage)}%` }}
                ></div>
              </div>
              <span className="font-medium">
                {results.rateLimit.remaining} / {results.rateLimit.limit}
              </span>
              {results.rateLimit.reset && (
                <span className="ml-1 text-gray-500 text-xs">
                  (resets {formatRateLimitReset(results.rateLimit.reset)})
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="space-y-6">
          {/* Search form */}
          <form 
            id="search-form"
            onSubmit={handleSubmit} 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md"
          >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiGithub className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={searchParams.username}
                    onChange={handleInputChange}
                    placeholder="Search by username..."
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={searchParams.location}
                    onChange={handleInputChange}
                    placeholder="Filter by location..."
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={toggleAdvancedSearch}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center px-3 py-1.5 rounded-full border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <FiFilter className="mr-1.5 h-3.5 w-3.5" />
                    {showAdvanced ? 'Hide' : 'Show'} Advanced
                    {getActiveFilterCount() > 0 && (
                      <span className="ml-1.5 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        {getActiveFilterCount()}
                      </span>
                    )}
                    {showAdvanced ? (
                      <FiChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <FiChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </button>
                  
                  {/* View mode toggle */}
                  <div className="hidden sm:flex items-center space-x-1 bg-gray-100 p-1 rounded-full">
                    <button
                      type="button"
                      onClick={() => toggleViewMode(VIEW_MODES.GRID)}
                      className={`p-1.5 rounded-full ${viewMode === VIEW_MODES.GRID ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      title="Grid view"
                    >
                      <FiGrid className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleViewMode(VIEW_MODES.LIST)}
                      className={`p-1.5 rounded-full ${viewMode === VIEW_MODES.LIST ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      title="List view"
                    >
                      <FiList className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleViewMode(VIEW_MODES.MAP)}
                      className={`p-1.5 rounded-full ${viewMode === VIEW_MODES.MAP ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      title="Map view"
                    >
                      <FiMap className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={resetSearch}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-md text-white font-medium flex items-center justify-center ${
                      isLoading 
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'
                    } transition-all min-w-[100px]`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                      </>
                    ) : (
                      <>
                        <FiSearch className="mr-1.5 h-4 w-4" />
                        Search
                      </>
                    )}
                  </button>
                </div>
              </div>

            {showAdvanced && (
              <div className="space-y-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="minRepos" className="block text-sm font-medium text-gray-700 mb-1">
                      Min Repositories
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCode className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="minRepos"
                        name="minRepos"
                        min="0"
                        value={searchParams.minRepos}
                        onChange={handleInputChange}
                        placeholder="Minimum repositories"
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="minFollowers" className="block text-sm font-medium text-gray-700 mb-1">
                      Min Followers
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUsers className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="minFollowers"
                        name="minFollowers"
                        min="0"
                        value={searchParams.minFollowers}
                        onChange={handleInputChange}
                        placeholder="Minimum followers"
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="maxFollowers" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Followers (optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUsers className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="maxFollowers"
                        name="maxFollowers"
                        min="0"
                        value={searchParams.maxFollowers}
                        onChange={handleInputChange}
                        placeholder="Maximum followers"
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Language
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCode className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        id="language"
                        name="language"
                        value={searchParams.language}
                        onChange={handleInputChange}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  
                  <div>
                    <label htmlFor="created" className="block text-sm font-medium text-gray-700 mb-1">
                      Created After
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiClock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="created"
                        name="created"
                        value={searchParams.created}
                        onChange={handleInputChange}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                      Sort By
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiFilter className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        id="sort"
                        name="sort"
                        value={searchParams.sort}
                        onChange={handleInputChange}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        disabled={isLoading}
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Additional filters */}
                <div className="pt-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Filters</h4>
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="hasLocation"
                        checked={filters.hasLocation}
                        onChange={handleFilterChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Has location</span>
                    </label>
                    
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="hasBio"
                        checked={filters.hasBio}
                        onChange={handleFilterChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Has bio</span>
                    </label>
                    
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="hasHireable"
                        checked={filters.hasHireable}
                        onChange={handleFilterChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Hireable</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Loading state */}
        {isLoading && !results.items.length && (
          <div className="text-center py-16">
            <div className="inline-flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-lg font-medium text-gray-700">Searching GitHub...</p>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                Finding developers that match your search criteria. This may take a moment.
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error.includes('not found') ? 'No users found' : 'Search Error'}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error.includes('not found') ? 'We couldn\'t find any users matching your search. Try adjusting your criteria.' : error}</p>
                </div>
                <div className="mt-3 flex space-x-3">
                  <button
                    type="button"
                    onClick={resetSearch}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    Clear search
                  </button>
                  {error.includes('rate limit') && (
                    <a
                      href="https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Learn about rate limits
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results.items.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {results.totalCount.toLocaleString()} {results.totalCount === 1 ? 'User' : 'Users'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {results.totalCount > 1 ? 'Developers found' : 'Developer found'} matching your search
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {results.totalCount > 10 && (
                  <div className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                    Showing {Math.min(results.items.length, results.perPage * results.page)} of {results.totalCount.toLocaleString()}
                  </div>
                )}
                
                {/* Mobile view mode toggle */}
                <div className="sm:hidden flex items-center space-x-1 bg-gray-100 p-1 rounded-full">
                  <button
                    type="button"
                    onClick={() => toggleViewMode(VIEW_MODES.GRID)}
                    className={`p-1.5 rounded-full ${viewMode === VIEW_MODES.GRID ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    title="Grid view"
                  >
                    <FiGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleViewMode(VIEW_MODES.LIST)}
                    className={`p-1.5 rounded-full ${viewMode === VIEW_MODES.LIST ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    title="List view"
                  >
                    <FiList className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleViewMode(VIEW_MODES.MAP)}
                    className={`p-1.5 rounded-full ${viewMode === VIEW_MODES.MAP ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    title="Map view"
                  >
                    <FiMap className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Map View */}
            {viewMode === VIEW_MODES.MAP && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[500px] relative">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-0">
                  <p className="text-gray-400">Loading map...</p>
                </div>
                <MapWithNoSSR 
                  users={results.items.filter(user => user.location)}
                  center={mapCenter}
                  zoom={mapCenter.zoom}
                  className="h-full w-full z-10"
                />
              </div>
            )}
            
            {/* Grid/List View */}
            {viewMode !== VIEW_MODES.MAP && (
              <div className={`${viewMode === VIEW_MODES.GRID ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}`}>
                {results.items.map((user) => (
                  <UserCard 
                    key={user.id}
                    user={{
                      ...user,
                      ...(userDetails[user.login] || {})
                    }}
                    onClick={() => handleUserCardClick(user.login)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {/* Load more button */}
            {results.hasMore && (
              <div className="text-center pt-6">
                <button
                  onClick={loadMoreResults}
                  disabled={isLoadingMore}
                  className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors ${
                    isLoadingMore ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoadingMore ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading more users...
                    </>
                  ) : (
                    'Load More Users'
                  )}
                </button>
                <p className="mt-2 text-sm text-gray-500">
                  Showing {Math.min(results.items.length, results.perPage * results.page).toLocaleString()} of {results.totalCount.toLocaleString()} users
                </p>
              </div>
            )}
            
            {/* Floating scroll to top button */}
            {isAtBottom && results.items.length > 5 && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 right-6 bg-white p-3 rounded-full shadow-lg border border-gray-200 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                aria-label="Scroll to top"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            )}
          </div>
        )}

          {/* Empty state */}
          {!isLoading && results.items.length === 0 && !error && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="h-10 w-10 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900">No users found</h3>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                We couldn't find any developers matching your search criteria. Try adjusting your filters or search query.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={resetSearch}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <FiX className="mr-2 h-4 w-4" />
                  Clear all filters
                </button>
                <button
                  onClick={toggleAdvancedSearch}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <FiFilter className="mr-2 h-4 w-4" />
                  Adjust search
                </button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Search tips:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-500">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Try different keywords
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Check your spelling
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Use more general terms
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
