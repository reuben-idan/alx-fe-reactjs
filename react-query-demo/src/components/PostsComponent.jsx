import React from 'react';
import { useQuery } from '@tanstack/react-query';
import './PostsComponent.css';

const PostsComponent = () => {
  // Function to fetch posts from JSONPlaceholder API
  const fetchPosts = async () => {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return response.json();
  };

  // Using useQuery hook to manage data fetching
  const {
    data: posts,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery('posts', fetchPosts, {
    // Cache data for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep data in cache for 10 minutes
    cacheTime: 10 * 60 * 1000,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="posts-container">
        <h2>Posts (React Query Demo)</h2>
        <div className="loading">Loading posts...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="posts-container">
        <h2>Posts (React Query Demo)</h2>
        <div className="error">
          Error loading posts: {error.message}
        </div>
        <button onClick={() => refetch()} className="refetch-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="posts-container">
      <h2>Posts (React Query Demo)</h2>

      <div className="posts-header">
        <p>Total Posts: {posts?.length || 0}</p>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="refetch-button"
        >
          {isFetching ? 'Refreshing...' : 'Refresh Posts'}
        </button>
      </div>

      <div className="posts-list">
        {posts?.slice(0, 10).map((post) => (
          <div key={post.id} className="post-card">
            <h3>{post.title}</h3>
            <p>{post.body}</p>
            <div className="post-meta">
              <span>User ID: {post.userId}</span>
              <span>Post ID: {post.id}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="cache-info">
        <p>
          💡 React Query is caching this data. Navigate away and come back to see cached data in action!
        </p>
        <p>
          🔄 Click "Refresh Posts" to manually refetch data and see loading states.
        </p>
      </div>
    </div>
  );
};

export default PostsComponent;
