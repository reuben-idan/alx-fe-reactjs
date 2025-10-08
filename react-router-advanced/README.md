# Advanced Routing in React with React Router

This project demonstrates advanced routing techniques in React using React Router v7. The application showcases nested routes, protected routes, dynamic routing, and seamless navigation patterns.

## 🚀 Features Implemented

### ✅ Nested Routes
- **Profile Component** with nested sub-routes:
  - `ProfileOverview` - Main profile page
  - `ProfileDetails` - User profile information
  - `ProfileSettings` - User settings form

### ✅ Dynamic Routing
- **Blog Posts** with dynamic URL parameters
- Route: `/blog/:id` (where `:id` can be 1, 2, 3, etc.)
- Displays different content based on the URL parameter
- Includes navigation between posts and error handling for non-existent posts

### ✅ Protected Routes
- **Authentication Simulation** with login/logout functionality
- Protected route component that guards sensitive content
- Redirects unauthenticated users to login form
- Persistent authentication state during session

### ✅ Advanced Navigation
- Responsive navigation bar with active link highlighting
- Back button functionality in blog posts
- Seamless navigation between all route types

## 🛠️ Technical Implementation

### Project Structure
```
src/
├── App.jsx          # Main application with all routes
├── main.jsx         # Entry point with BrowserRouter
├── App.css          # Styling for all components
└── index.css        # Global styles
```

### Key Components

#### App.jsx
- **Routes Configuration**: Defines all application routes
- **Nested Routing**: Profile component with child routes
- **Dynamic Routing**: Blog posts with URL parameters
- **Protected Routes**: Authentication wrapper component

#### Route Definitions
```javascript
// Nested Routes
<Route path="/profile/*" element={<Profile />}>
  <Route path="details" element={<ProfileDetails />} />
  <Route path="settings" element={<ProfileSettings />} />
  <Route path="/" element={<ProfileOverview />} />
// Dynamic Routes
<Route path="/blog/:id" element={<BlogPost />} />
// Protected Routes
<Route path="/protected" element={
  <ProtectedRoute>
    <ProtectedContent />
  </ProtectedRoute>
} />
```

#### Protected Route Component
- Simulates authentication state
- Conditionally renders login form or protected content
- Provides logout functionality

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation & Setup

1. **Navigate to the project directory:**
   ```bash
   cd react-router-advanced
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Available Routes

| Route | Description | Type |
|-------|-------------|------|
| `/` | Home page with navigation links | Static |
| `/profile` | Profile overview page | Nested Parent |
| `/profile/details` | User profile details | Nested Child |
| `/profile/settings` | Profile settings form | Nested Child |
| `/blog/1` | Blog post #1 | Dynamic |
| `/blog/2` | Blog post #2 | Dynamic |
| `/blog/3` | Blog post #3 | Dynamic |
| `/protected` | Protected content (login required) | Protected |

## 🔐 Authentication Flow

1. **Visit Protected Route**: Navigate to `/protected`
2. **Authentication Required**: Login form appears
3. **Login Process**:
   - Enter any username and password
   - Click "Login" button
4. **Access Granted**: Protected content becomes visible
5. **Logout**: Click "Logout" button to end session

## 🎯 Testing the Features

### Nested Routes Testing
1. Navigate to `/profile`
2. Click "Profile Details" or "Profile Settings"
3. Verify URL changes and content updates
4. Use browser back/forward buttons

### Dynamic Routes Testing
1. Navigate to `/blog/1`
2. Try different post IDs: `/blog/1`, `/blog/2`, `/blog/3`
3. Test non-existent post: `/blog/999`
4. Use Previous/Next Post navigation

### Protected Routes Testing
1. Navigate to `/protected`
2. Click "Login" button
3. Enter credentials and submit
4. Verify protected content appears
5. Click "Logout" and verify access is restricted

## 📚 React Router Concepts Demonstrated

### 1. Nested Routes (`/profile/*`)
- Parent route with wildcard (`/*`) allows child routes
- Child routes are relative to parent path
- Uses `<Routes>` within parent component

### 2. Dynamic Routes (`/blog/:id`)
- URL parameters extracted using `useParams()` hook
- Parameter validation and error handling
- Dynamic content rendering based on parameters

### 3. Protected Routes Pattern
- Higher-Order Component pattern for route protection
- Conditional rendering based on authentication state
- Redirect/guard logic implementation

### 4. Navigation Patterns
- Programmatic navigation using `useNavigate()` hook
- Link component for declarative navigation
- Active link styling and state management

## 🔧 Customization

### Adding New Blog Posts
Edit the `posts` object in `BlogPost` component:

```javascript
const posts = {
  1: { title: '...', content: '...', author: '...', date: '...' },
  // Add more posts here
};
```

### Modifying Protected Routes
Update the `ProtectedRoute` component to integrate with real authentication services.

### Styling
All components use CSS modules with BEM methodology. Modify `App.css` for styling changes.

## 🐛 Troubleshooting

### Common Issues

1. **Routes not working**: Ensure `BrowserRouter` wraps the `App` component in `main.jsx`
2. **Nested routes not rendering**: Check that parent route uses wildcard (`/*`) pattern
3. **Dynamic routes showing 404**: Verify parameter names match in route definition and `useParams()`

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📖 Learning Resources

- [React Router Documentation](https://reactrouter.com/)
- [React Router v7 Migration Guide](https://reactrouter.com/upgrading/v7)
- [Advanced React Patterns](https://www.patterns.dev/posts)
- [React Authentication Patterns](https://auth0.com/blog/react-authentication-guide/)

## 🎉 Success Criteria Met

✅ **React Router Setup**: Project configured with React Router v7
✅ **Nested Routes**: Profile component with Details and Settings sub-routes
✅ **Dynamic Routing**: Blog posts with variable URL parameters
✅ **Protected Routes**: Authentication simulation with route protection
✅ **Functional Testing**: All routes tested and working correctly
✅ **Seamless Navigation**: Smooth transitions between all route types

## 📝 Next Steps

Consider implementing these enhancements:
- Route-based code splitting for performance
- Real authentication integration (JWT, OAuth)
- Route transition animations
- Breadcrumb navigation
- Search functionality with query parameters
