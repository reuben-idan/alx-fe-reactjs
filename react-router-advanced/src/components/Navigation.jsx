import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => (
  <nav className="main-nav">
    <div className="nav-container">
      <Link to="/" className="nav-logo">React Router Demo</Link>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
        <Link to="/blog/1" className="nav-link">Blog</Link>
        <Link to="/protected" className="nav-link">Protected</Link>
      </div>
    </div>
  </nav>
);

export default Navigation;
