import React from 'react';

const ProfileSettings = () => (
  <div className="profile-settings">
    <h3>Profile Settings</h3>
    <form className="settings-form">
      <div className="form-group">
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" defaultValue="johndoe" />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" defaultValue="john.doe@example.com" />
      </div>
      <div className="form-group">
        <label htmlFor="bio">Bio:</label>
        <textarea id="bio" rows="3" defaultValue="Software developer passionate about React and modern web technologies." />
      </div>
      <button type="submit" className="save-button">Save Changes</button>
    </form>
  </div>
);

export default ProfileSettings;
