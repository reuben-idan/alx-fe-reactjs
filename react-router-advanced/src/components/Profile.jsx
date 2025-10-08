import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import ProfileOverview from './ProfileOverview';
import ProfileDetails from './ProfileDetails';
import ProfileSettings from './ProfileSettings';

const Profile = () => (
  <div className="profile">
    <h2>User Profile</h2>
    <p>Welcome to your profile page!</p>

    <nav className="profile-nav">
      <Link to="details" className="profile-link">Profile Details</Link>
      <Link to="settings" className="profile-link">Profile Settings</Link>
    </nav>

    <Routes>
      <Route path="details" element={<ProfileDetails />} />
      <Route path="settings" element={<ProfileSettings />} />
      <Route path="/" element={<ProfileOverview />} />
    </Routes>
  </div>
);

export default Profile;
