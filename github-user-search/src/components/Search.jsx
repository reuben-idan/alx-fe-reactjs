import { useState } from 'react';
import { fetchUserData } from '../services/githubService';
import UserCard from './UserCard';

const Search = () => {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await fetchUserData(username);
      
      if (error) {
        setError(error);
        setUserData(null);
      } else {
        setUserData(data);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">GitHub User Search</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub username..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className={`px-6 py-2 rounded-md text-white font-medium ${loading || !username.trim() ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Searching for user...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
          <p className="font-medium">
            {error.includes('not found') ? 'Looks like we can\'t find the user' : error}
          </p>
          {error.includes('not found') && (
            <p className="mt-1 text-sm">Please check the username and try again.</p>
          )}
        </div>
      )}

      {userData && (
        <div className="mt-8">
          <UserCard user={userData} />
        </div>
      )}
    </div>
  );
};

export default Search;
