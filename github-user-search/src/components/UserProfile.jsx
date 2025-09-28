import React from 'react';

const UserProfile = ({ avatarUrl, name, login }) => {
return ( <div className="flex items-center space-x-4 md:max-w-sm">
<img
src={avatarUrl}
alt={`${name || login}'s avatar`}
className="rounded-full sm:w-24 sm:h-24 md:w-36 md:h-36"
/> <div>
{name && <h2 className="text-xl font-bold">{name}</h2>} <p className="text-gray-600">@{login}</p> </div> </div>
);
};

export default UserProfile;
