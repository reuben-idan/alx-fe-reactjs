import { useState, useEffect } from 'react';
import { useRecipeStore } from './recipeStore';
import { Link } from 'react-router-dom';

const RecipeList = () => {
  const { removeRecipe, setSearchTerm, getFilteredRecipes } = useRecipeStore();
  const [searchInput, setSearchInput] = useState('');
  const recipes = useRecipeStore(getFilteredRecipes);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, setSearchTerm]);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full p-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">No recipes yet. Add your first recipe to get started!</p>
          <Link 
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Recipe
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Recipe Image */}
              {recipe.image ? (
                <img 
                  src={recipe.image} 
                  alt={recipe.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              
              {/* Recipe Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{recipe.title}</h3>
                  {recipe.cuisine && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {recipe.cuisine}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  {recipe.prepTime && (
                    <span className="mr-3">🕒 {recipe.prepTime}</span>
                  )}
                  {recipe.servings && (
                    <span>👥 {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}</span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {recipe.ingredients?.slice(0, 3).map((ingredient, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {ingredient.split(',')[0].trim()}
                    </span>
                  ))}
                  {recipe.ingredients?.length > 3 && (
                    <span className="text-xs text-gray-500">+{recipe.ingredients.length - 3} more</span>
                  )}
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <Link 
                    to={`/recipe/${recipe.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    View Recipe →
                  </Link>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/edit/${recipe.id}`}
                      className="text-sm text-gray-600 hover:text-blue-600"
                      title="Edit recipe"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (window.confirm('Are you sure you want to delete this recipe?')) {
                          removeRecipe(recipe.id);
                        }
                      }}
                      className="text-sm text-red-500 hover:text-red-700"
                      title="Delete recipe"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeList;
