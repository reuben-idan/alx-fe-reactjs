import { useEffect } from 'react';
import { useRecipeStore } from './store/recipeStore';
import { Link } from 'react-router-dom';

const FavoritesList = () => {
  const { getFavoriteRecipes, toggleFavorite } = useRecipeStore();
  const favoriteRecipes = useRecipeStore(state => state.getFavoriteRecipes());
  const favorites = useRecipeStore(state => state.favorites);

  useEffect(() => {
    // This effect ensures the component updates when favorites change
  }, [favorites]);

  if (favoriteRecipes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No favorites yet</h3>
        <p className="mt-1 text-gray-500">Save your favorite recipes to see them here!</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Browse Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Favorite Recipes</h2>
        <span className="text-gray-600">
          {favoriteRecipes.length} {favoriteRecipes.length === 1 ? 'recipe' : 'recipes'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteRecipes.map((recipe) => (
          <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {recipe.image && (
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <Link to={`/recipe/${recipe.id}`} className="hover:text-blue-600">
                    {recipe.title}
                  </Link>
                </h3>
                <button
                  onClick={() => toggleFavorite(recipe.id)}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                  aria-label="Remove from favorites"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-2">{recipe.cuisine}</p>
              <p className="text-gray-700 mb-4 line-clamp-2">{recipe.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {recipe.prepTime} min • {recipe.servings} servings
                </span>
                <Link
                  to={`/recipe/${recipe.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Recipe →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesList;
