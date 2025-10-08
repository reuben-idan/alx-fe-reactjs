import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, login, logout } = useAuth();
  const location = useLocation();
  const [showLogin, setShowLogin] = React.useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    if (login(username, password)) {
      setShowLogin(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // If not authenticated, redirect to home with return path
  if (!isAuthenticated) {
    if (!showLogin) {
      return (
        <div className="protected-route">
          <h2>Authentication Required</h2>
          <p>You need to log in to access this protected content.</p>
          <button onClick={() => setShowLogin(true)} className="login-button">
            Login
          </button>
        </div>
      );
    }

    return (
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" className="login-button">Login</button>
          <button type="button" onClick={() => setShowLogin(false)} className="cancel-button">
            Cancel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="protected-content">
      {children}
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
};

export default ProtectedRoute;
