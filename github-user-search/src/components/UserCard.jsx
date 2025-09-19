const UserCard = ({ user }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <img 
            src={user.avatar_url} 
            alt={user.login}
            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-gray-200 object-cover"
          />
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-800">{user.name || user.login}</h2>
            <a 
              href={user.html_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              @{user.login}
            </a>
            
            {user.bio && (
              <p className="mt-2 text-gray-600">{user.bio}</p>
            )}
            
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
              {user.company && (
                <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                  🏢 {user.company}
                </span>
              )}
              {user.location && (
                <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                  📍 {user.location}
                </span>
              )}
              {user.blog && (
                <a 
                  href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full hover:bg-gray-200"
                >
                  🌐 {user.blog.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
            
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
              <div className="text-center">
                <div className="font-bold text-gray-800">{user.public_repos}</div>
                <div className="text-sm text-gray-600">Repositories</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-800">{user.followers}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-800">{user.following}</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
            </div>
            
            <div className="mt-6">
              <a
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
