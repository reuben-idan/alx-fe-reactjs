import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="home">
    <h1>Welcome to React Router Advanced Demo</h1>
    <p>This demo showcases advanced routing features in React:</p>
    <ul>
      <li>✅ Nested Routes (Profile → Details & Settings)</li>
      <li>✅ Dynamic Routes (Blog Posts)</li>
      <li>✅ Protected Routes (Authentication required)</li>
      <li>✅ Route Navigation & Guards</li>
    </ul>
    <div className="nav-links">
      <Link to="/profile" className="nav-link">Go to Profile</Link>
      <Link to="/blog/1" className="nav-link">Read Blog Post 1</Link>
      <Link to="/protected" className="nav-link">Protected Route (Login Required)</Link>
    </div>
  </div>
);

export default Home;
