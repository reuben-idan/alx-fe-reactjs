const UserCard = ({ user }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <img 
            src={user.avatar_url} 
            alt={user.login}
            className="w-20 h-20 rounded-full border-2 border-gray-200"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user.name || user.login}</h2>
            <p className="text-gray-600">@{user.login}</p>
            {user.bio && <p className="mt-2 text-gray-600">{user.bio}</p>}
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {user.location && (
            <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
              📍 {user.location}
            </span>
          )}
          {user.public_repos !== undefined && (
            <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
              📦 {user.public_repos} repos
            </span>
          )}
          {user.followers !== undefined && (
            <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
              👥 {user.followers} followers
            </span>
          )}
        </div>
        
        <div className="mt-4">
          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View Profile
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
