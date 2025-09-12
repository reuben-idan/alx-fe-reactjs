import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { HomeIcon, PlusIcon, HeartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import './App.css';
import RecipeList from './components/RecipeList';
import AddRecipeForm from './components/AddRecipeForm';
import RecipeDetails from './components/RecipeDetails';
import EditRecipeForm from './components/EditRecipeForm';
import useRecipeStore from './store/recipeStore';

// Layout component for consistent UI across routes
const Layout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              RecipeShare
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Home"
            >
              <HomeIcon className="h-6 w-6" />
            </Link>
            <Link
              to="/add"
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Add Recipe"
            >
              <PlusIcon className="h-6 w-6" />
            </Link>
            <Link
              to="/favorites"
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Favorites"
            >
              <HeartIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </header>

    {/* Main Content */}
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {children}
    </main>

    {/* Footer */}
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} RecipeShare. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
);

// Home component with search functionality
const Home = () => {
  const { setSearchTerm } = useRecipeStore();
  
  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Amazing Recipes</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Find and share your favorite recipes with the community
        </p>
        
        <div className="mt-6 max-w-xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search for recipes..."
            />
          </div>
        </div>
      </div>
      
      <RecipeList />
    </div>
  );
};

function App() {
  const { initializeRecipes } = useRecipeStore();

  // Initialize with sample recipes if empty
  useEffect(() => {
    initializeRecipes();
  }, [initializeRecipes]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Home />
          </Layout>
        } />
        <Route path="/add" element={
          <Layout>
            <AddRecipeForm />
          </Layout>
        } />
        <Route path="/recipe/:id" element={
          <Layout>
            <RecipeDetails />
          </Layout>
        } />
        <Route path="/edit/:id" element={
          <Layout>
            <EditRecipeForm />
          </Layout>
        } />
        <Route path="/favorites" element={
          <Layout>
            <RecipeList showFavorites={true} />
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
