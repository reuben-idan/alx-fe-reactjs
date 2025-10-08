import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Profile from './components/Profile';
import BlogPost from './components/BlogPost';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';

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
