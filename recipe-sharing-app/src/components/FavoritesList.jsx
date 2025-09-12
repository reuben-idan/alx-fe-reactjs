import { useEffect, useState } from 'react';
import { useRecipeStore } from '../store/recipeStore';
import { Link } from 'react-router-dom';
import RecipeCard from './RecipeCard';
import { toast } from 'react-toastify';

const FavoritesList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { 
    getFavoriteRecipes, 
    toggleFavorite, 
    isFavorite, 
    favorites 
  } = useRecipeStore();
  
  const favoriteRecipes = useRecipeStore(state => state.getFavoriteRecipes() || []);

  // Handle favorite toggle
  const handleToggleFavorite = (recipeId) => {
    try {
      toggleFavorite(recipeId);
      if (!isFavorite(recipeId)) {
        toast.success('Removed from favorites');
      } else {
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };
  
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setIsLoading(true);
        // Force a re-render when favorites change
        const favs = getFavoriteRecipes();
      } catch (error) {
        console.error('Error loading favorites:', error);
        toast.error('Failed to load favorites');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFavorites();
  }, [favorites, getFavoriteRecipes]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }


  if (favoriteRecipes.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 19.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 6.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No favorites yet</h3>
        <p className="mt-1 text-gray-500">
          You haven't added any recipes to your favorites yet.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Browse Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Favorite Recipes</h2>
        <span className="text-gray-600">
          {favoriteRecipes.length} {favoriteRecipes.length === 1 ? 'recipe' : 'recipes'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteRecipes.map((recipe) => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe} 
            onToggleFavorite={handleToggleFavorite}
            isFavorite={true}
            onDelete={null}
          />
        ))}
      </div>
    </div>
  );
};

export default FavoritesList;
