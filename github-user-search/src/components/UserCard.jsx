import { FiGithub, FiLink } from 'react-icons/fi';

const UserCard = ({ user, onClick }) => {
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
    <div 
      className="h-full flex flex-col group"
      onClick={onClick}
    >
      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-gray-200">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative">
            <div className="relative group-hover:scale-105 transition-transform duration-300">
              <img 
                src={user.avatar_url} 
                alt={user.login}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-gray-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.login)}&background=random`;
                }}
              />
              {user.hireable && (
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-md border border-white">
                  Hireable
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 w-full min-w-0">
            <div className="flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {user.name || user.login}
                    </h2>
                    <a 
                      href={user.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                      title="View on GitHub"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FiGithub className="h-5 w-5" />
                    </a>
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    <span>@{user.login}</span>
                  </div>
                </div>
                
                {user.blog && (
                  <a 
                    href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
                    title={user.blog}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FiLink className="mr-1.5 h-3 w-3 flex-shrink-0" />
                    <span className="truncate max-w-[120px]">{formatBlogUrl(user.blog)}</span>
                  </a>
                )}
              </div>
              
              {/* User Bio */}
              {user.bio && (
                <p className="mt-3 text-gray-600 text-sm leading-relaxed line-clamp-2">
                  {user.bio}
                </p>
              )}
              
              {/* User Stats */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl text-center group-hover:bg-gray-100 transition-colors">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatNumber(user.public_repos || 0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Repositories</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl text-center group-hover:bg-gray-100 transition-colors">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatNumber(user.followers || 0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Followers</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl text-center group-hover:bg-gray-100 transition-colors">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatNumber(user.following || 0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Following</div>
                </div>
              </div>
              
              {/* User Meta */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {user.company && (
                    <div className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-medium rounded-full border border-gray-200">
                      <svg className="h-3 w-3 mr-1.5 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                      <span className="truncate max-w-[120px]">{user.company}</span>
                    </div>
                  )}
                  
                  {user.location && (
                    <div className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-medium rounded-full border border-gray-200">
                      <svg className="h-3 w-3 mr-1.5 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate max-w-[120px]">{user.location}</span>
                    </div>
                  )}
                  
                  {joinDate && (
                    <div className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-medium rounded-full border border-gray-200">
                      <svg className="h-3 w-3 mr-1.5 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate">Joined {joinDate}</span>
                    </div>
                  )}
                </div>
                
                {user.blog && (
                  <div className="mt-3">
                    <a 
                      href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      title={user.blog}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FiLink className="mr-1.5 h-3.5 w-3.5" />
                      <span className="truncate max-w-[200px] sm:max-w-none">
                        {formatBlogUrl(user.blog)}
                      </span>
                    </a>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Full Profile on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
