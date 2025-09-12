import { useEffect, useState } from 'react';
import { useRecipeStore } from '../store/recipeStore';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import RecipeCard from './RecipeCard';

const RecommendationsList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { 
    getRecommendations, 
    getRecommendationsList, 
    toggleFavorite, 
    isFavorite,
    favorites 
  } = useRecipeStore();
  
  const recommendations = useRecipeStore(state => state.recommendations || []);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setIsLoading(true);
        await getRecommendations();
      } catch (error) {
        console.error('Error loading recommendations:', error);
        toast.error('Failed to load recommendations');
      } finally {
        setIsLoading(false);
      }
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Recommended For You</h2>
        <span className="text-gray-600">
          Based on your favorites
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recipe) => (
          <RecipeCard 
            key={recipe.id}
            recipe={recipe}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite(recipe.id)}
            showFavorite={true}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendationsList;
