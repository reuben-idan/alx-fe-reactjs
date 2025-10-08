import React from 'react';
import { Routes, Route, Link, useNavigate, BrowserRouter } from 'react-router-dom';
import './App.css';

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

const ProfileOverview = () => (
  <div className="profile-overview">
    <h3>Profile Overview</h3>
    <p>This is the main profile page. Click on the tabs above to navigate to specific sections.</p>
  </div>
);

const ProfileDetails = () => (
  <div className="profile-details">
    <h3>Profile Details</h3>
    <div className="details-content">
      <p><strong>Name:</strong> John Doe</p>
      <p><strong>Email:</strong> john.doe@example.com</p>
      <p><strong>Member Since:</strong> January 2023</p>
      <p><strong>Location:</strong> San Francisco, CA</p>
    </div>
  </div>
);

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

const BlogPost = () => {
  const { id } = React.useParams();
  const navigate = useNavigate();

  // Mock blog post data
  const posts = {
    1: {
      title: 'Getting Started with React Router',
      content: 'React Router is a powerful library for handling routing in React applications. It allows you to build single-page applications with navigation without the page refreshing.',
      author: 'Jane Smith',
      date: '2024-01-15'
    },
    2: {
      title: 'Advanced React Patterns',
      content: 'Learn about advanced React patterns including Higher-Order Components, Render Props, and Compound Components. These patterns help you write more reusable and maintainable React code.',
      author: 'Mike Johnson',
      date: '2024-01-10'
    },
    3: {
      title: 'State Management in Modern React',
      content: 'Explore different state management solutions for React applications, from React Context to Redux Toolkit and Zustand. Choose the right tool for your project.',
      author: 'Sarah Wilson',
      date: '2024-01-05'
    }
  };

  const post = posts[id];

  if (!post) {
    return (
      <div className="blog-post">
        <h2>Post Not Found</h2>
        <p>The blog post you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')} className="back-button">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="blog-post">
      <div className="post-header">
        <button onClick={() => navigate('/')} className="back-button">← Back to Home</button>
        <div className="post-meta">
          <span className="post-date">{post.date}</span>
          <span className="post-author">by {post.author}</span>
        </div>
      </div>
      <h1>{post.title}</h1>
      <div className="post-content">
        <p>{post.content}</p>
        <p>This is a dynamic route example where the post ID ({id}) is extracted from the URL parameter.</p>
      </div>
      <div className="post-navigation">
        <Link to={`/blog/${parseInt(id) - 1}`} className={`nav-link ${parseInt(id) <= 1 ? 'disabled' : ''}`}>
          ← Previous Post
        </Link>
        <Link to={`/blog/${parseInt(id) + 1}`} className={`nav-link ${parseInt(id) >= 3 ? 'disabled' : ''}`}>
          Next Post →
        </Link>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [showLogin, setShowLogin] = React.useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsAuthenticated(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

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
            <input type="text" id="username" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" required />
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

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile/*" element={<Profile />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/protected" element={
              <ProtectedRoute>
                <div className="protected-page">
                  <h1>Protected Content</h1>
                  <p>This content is only visible to authenticated users.</p>
                  <p>You have successfully logged in and can access this protected route!</p>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
