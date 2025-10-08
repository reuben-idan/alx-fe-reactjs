import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const BlogPost = () => {
  const { id } = useParams();
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

export default BlogPost;
