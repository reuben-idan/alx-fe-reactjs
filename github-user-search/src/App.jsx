import { useState, useEffect } from 'react';
import { searchUsers, getUserDetails } from './services/githubApi';
import SearchBar from './components/SearchBar';
import UserCard from './components/UserCard';

function App() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery);
    setLoading(true);
    setError(null);
    
    try {
      const data = await searchUsers(searchQuery);
      // Fetch additional details for each user
      const usersWithDetails = await Promise.all(
        data.items.map(user => getUserDetails(user.login))
      );
      setUsers(usersWithDetails);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          GitHub User Search
        </h1>
        
        <SearchBar onSearch={handleSearch} />
        
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Searching GitHub users...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {!loading && users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
        
        {!loading && users.length === 0 && query && !error && (
          <div className="text-center py-8">
            <p className="text-gray-600">No users found. Try a different search term.</p>
          </div>
        )}
        
        {!loading && !query && users.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Search GitHub Users</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Enter a username or keyword in the search bar above to find GitHub users.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
