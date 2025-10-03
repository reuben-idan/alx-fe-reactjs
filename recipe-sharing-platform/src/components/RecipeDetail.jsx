import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setLoading(true);
        const response = await fetch('./data.json');
        const recipes = await response.json();
        const foundRecipe = recipes.find(r => r.id === parseInt(id));

        if (foundRecipe) {
          setRecipe(foundRecipe);
        } else {
          setError('Recipe not found');
        }
      } catch (err) {
        setError('Failed to load recipe');
        console.error('Error loading recipe:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Link
            to="/"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            ← Back to Recipes
          </Link>
        </div>
      </nav>

      {/* Recipe Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Recipe Image */}
          <div className="w-full h-64 sm:h-80 bg-gray-200">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Recipe Header */}
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              {recipe.title}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {recipe.summary}
            </p>

            {/* Ingredients Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Ingredients
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions Section */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Instructions
              </h2>
              <div className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed pt-1">
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;
