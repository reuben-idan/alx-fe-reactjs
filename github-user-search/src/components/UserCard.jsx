import { FiGithub, FiMapPin, FiLink, FiBriefcase, FiCalendar, FiStar, FiGitBranch } from 'react-icons/fi';

const UserCard = ({ user }) => {
  // Format the date when the user joined GitHub
  const joinDate = user.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  // Format the user's blog URL
  const formatBlogUrl = (url) => {
    if (!url) return '';
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
    return cleanUrl.length > 30 ? `${cleanUrl.substring(0, 30)}...` : cleanUrl;
  };
  
  // Format large numbers with K/M/B suffixes
  const formatNumber = (num) => {
    if (!num && num !== 0) return 'N/A';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };
  
  // Calculate account age in years
  const getAccountAge = () => {
    if (!user.created_at) return null;
    const created = new Date(user.created_at);
    const now = new Date();
    return Math.floor((now - created) / (1000 * 60 * 60 * 24 * 365));
  };
  
  const accountAge = getAccountAge();

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-blue-100">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex-shrink-0 relative">
            <img 
              src={user.avatar_url} 
              alt={user.login}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-gray-200 object-cover hover:ring-2 hover:ring-blue-500 transition-all duration-300"
            />
            {user.hireable && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                Hireable
              </div>
            )}
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="text-center md:text-left">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                    {user.name || user.login}
                  </h2>
                  <a 
                    href={user.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="View on GitHub"
                  >
                    <FiGithub className="h-5 w-5" />
                  </a>
                </div>
                <div className="text-sm text-gray-600">
                  <span>@{user.login}</span>
                </div>
                <a 
                  href={user.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center text-sm text-white bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-md transition-colors"
                >
                  <FiGithub className="mr-1 h-3 w-3" />
                  <span>View Profile</span>
                </a>
              </div>
              
              <div className="mt-2 md:mt-0 flex justify-center md:justify-end space-x-2">
                {user.blog && (
                  <a 
                    href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full hover:bg-blue-100 transition-colors"
                    title={user.blog}
                  >
                    <FiLink className="mr-1 h-3 w-3" />
                    <span className="truncate max-w-[100px] md:max-w-[150px]">{formatBlogUrl(user.blog)}</span>
                  </a>
                )}
              </div>
            </div>
            
            {/* User Stats */}
            <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-3 text-sm text-gray-600">
              {user.public_repos !== undefined && (
                <div className="flex items-center" title="Public Repositories">
                  <FiGitBranch className="mr-1 h-4 w-4 text-gray-500" />
                  <span className="font-medium">{formatNumber(user.public_repos)}</span>
                  <span className="ml-1 text-xs">repos</span>
                </div>
              )}
              
              {user.followers !== undefined && (
                <div className="flex items-center" title="Followers">
                  <FiUsers className="mr-1 h-4 w-4 text-gray-500" />
                  <span className="font-medium">{formatNumber(user.followers)}</span>
                  <span className="ml-1 text-xs">followers</span>
                </div>
              )}
              
              {user.following !== undefined && (
                <div className="flex items-center" title="Following">
                  <FiUsers className="mr-1 h-4 w-4 text-gray-500" />
                  <span className="font-medium">{formatNumber(user.following)}</span>
                  <span className="ml-1 text-xs">following</span>
                </div>
              )}
            </div>
            
            {/* User Bio */}
            {user.bio && (
              <p className="mt-2 text-gray-600 text-sm">{user.bio}</p>
            )}
            
            <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
              {user.company && (
                <span className="inline-flex items-center px-2.5 py-0.5 bg-blue-50 text-blue-800 text-xs font-medium rounded-full">
                  <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                  {user.company}
                </span>
              )}
              
              {user.location && (
                <span className="inline-flex items-center px-2.5 py-0.5 bg-green-50 text-green-800 text-xs font-medium rounded-full">
                  <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {user.location}
                </span>
              )}
              
              {joinDate && (
                <span className="inline-flex items-center px-2.5 py-0.5 bg-purple-50 text-purple-800 text-xs font-medium rounded-full">
                  <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Joined {joinDate}
                </span>
              )}
            </div>
            
            {user.blog && (
              <div className="mt-2">
                <a 
                  href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:underline text-sm"
                  title={user.blog}
                >
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 1 1 0 001.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                  {formatBlogUrl(user.blog)}
                </a>
              </div>
            )}
            
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 p-2 rounded-lg">
                <div className="font-bold text-gray-800 text-lg">{user.public_repos || 0}</div>
                <div className="text-xs text-gray-500">Repos</div>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <div className="font-bold text-gray-800 text-lg">{user.followers || 0}</div>
                <div className="text-xs text-gray-500">Followers</div>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <div className="font-bold text-gray-800 text-lg">{user.following || 0}</div>
                <div className="text-xs text-gray-500">Following</div>
              </div>
            </div>
            
            <div className="mt-4">
              <a
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 1 1 0 001.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
                View Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
