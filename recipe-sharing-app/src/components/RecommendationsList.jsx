import { useEffect, useState } from 'react';
import { useRecipeStore } from '../store/recipeStore';
import { Link } from 'react-router-dom';

const RecommendationsList = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getRecommendations, toggleFavorite, favorites } = useRecipeStore();

  useEffect(() => {
    // Load recommendations when component mounts or favorites change
    const loadRecommendations = () => {
      setIsLoading(true);
      // Small delay to show loading state (optional)
      const timer = setTimeout(() => {
        const recs = getRecommendations();
        setRecommendations(recs);
        setIsLoading(false);
      }, 300);
      
      return () => clearTimeout(timer);
    };
    
    loadRecommendations();
  }, [favorites, getRecommendations]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
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
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No recommendations yet</h3>
        <p className="mt-1 text-gray-500">
          {favorites.length > 0 
            ? "We'll show more recommendations as you add more favorites!"
            : "Add some recipes to your favorites to get personalized recommendations."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Recommended For You</h2>
        <span className="text-gray-600">
          Based on your favorites
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recipe) => (
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
                  className="text-gray-300 hover:text-red-500 focus:outline-none"
                  aria-label="Add to favorites"
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

export default RecommendationsList;
