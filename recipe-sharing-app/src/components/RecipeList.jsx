import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import useRecipeStore from '../store/recipeStore';

const RecipeList = ({ showFavorites = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  
  // Get state and actions from the store
  const { 
    recipes, 
    filteredRecipes, 
    favorites,
    toggleFavorite, 
    setSearchTerm: setStoreSearchTerm,
    generateRecommendations,
    deleteRecipe 
  } = useRecipeStore();

  // Update search term in store when it changes
  useEffect(() => {
    setStoreSearchTerm(searchTerm);
  }, [searchTerm, setStoreSearchTerm]);

  // Generate recommendations when component mounts
  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      deleteRecipe(id);
    }
  };

  const handleFavorite = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
  };

  // Filter recipes based on search term and favorites filter
  let displayRecipes = searchTerm ? filteredRecipes : [...recipes];
  
  // If on favorites page, filter to only show favorited recipes
  if (showFavorites) {
    displayRecipes = displayRecipes.filter(recipe => 
      favorites.includes(recipe.id)
    );
  }
  
  // Update search term in store when it changes
  useEffect(() => {
    setStoreSearchTerm(searchTerm);
    
    // Clear search when navigating away from the current page
    return () => setStoreSearchTerm('');
  }, [searchTerm, setStoreSearchTerm, location.pathname]);

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No recipes yet. Add your first recipe to get started!</p>
        <Link 
          to="/add" 
          className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Recipe
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Recipes</h1>
        <Link 
          to="/add"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Add New Recipe
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayRecipes.map((recipe) => (
          <Link 
            to={`/recipe/${recipe.id}`} 
            key={recipe.id}
            className="block group"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
              {/* Recipe Image */}
              <div className="h-48 bg-gray-200 overflow-hidden">
                {recipe.image ? (
                  <img 
                    src={recipe.image} 
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              
              {/* Recipe Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {recipe.title}
                  </h2>
                  <button 
                    onClick={(e) => handleFavorite(e, recipe.id)}
                    className="text-red-400 hover:text-red-600 focus:outline-none"
                    aria-label={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {recipe.isFavorite ? (
                      <HeartIconSolid className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIconOutline className="h-6 w-6" />
                    )}
                  </button>
                </div>
                
                <p className="text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                
                <div className="mt-auto">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="mr-4">⏱️ {recipe.prepTime}</span>
                    <span>👥 {recipe.servings} servings</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {recipe.cuisine}
                    </span>
                    <div className="space-x-2">
                      <Link 
                        to={`/edit/${recipe.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={(e) => handleDelete(recipe.id, e)}
                        className="text-sm text-red-600 hover:text-red-800 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {searchTerm && displayRecipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No recipes found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default RecipeList;
