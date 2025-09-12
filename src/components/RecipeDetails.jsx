import { useParams, useNavigate } from 'react-router-dom';
import { useRecipeStore } from './recipeStore';
import { useEffect } from 'react';
import DeleteRecipeButton from './DeleteRecipeButton';

const RecipeDetails = () => {
  const { id } = useParams();
  const recipeId = parseInt(id);
  const navigate = useNavigate();
  
  // Get the recipe from the store
  const recipe = useRecipeStore(state => 
    state.recipes.find(r => r.id === recipeId)
  );

  // If recipe is not found, redirect to home
  useEffect(() => {
    if (!recipe) {
      navigate('/');
    }
  }, [recipe, navigate]);

  if (!recipe) {
    return <div className="p-4">Recipe not found. Redirecting...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Recipe Image */}
        {recipe.image && (
          <img 
            src={recipe.image} 
            alt={recipe.title}
            className="w-full h-64 object-cover"
          />
        )}
        
        <div className="p-6">
          {/* Recipe Title and Actions */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{recipe.title}</h1>
              {recipe.cuisine && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {recipe.cuisine}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/edit/${recipe.id}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Edit
              </button>
              <DeleteRecipeButton recipeId={recipe.id} />
            </div>
          </div>

          {/* Recipe Description */}
          {recipe.description && (
            <p className="text-gray-600 mb-6">{recipe.description}</p>
          )}

          {/* Ingredients and Instructions */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Ingredients */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Ingredients</h2>
              <ul className="space-y-2">
                {recipe.ingredients?.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2"></span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Instructions</h2>
              <ol className="list-decimal list-inside space-y-2">
                {recipe.instructions?.map((step, index) => (
                  <li key={index} className="mb-2">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {recipe.prepTime && (
                <div>
                  <span className="font-semibold">Prep Time:</span> {recipe.prepTime}
                </div>
              )}
              {recipe.cookTime && (
                <div>
                  <span className="font-semibold">Cook Time:</span> {recipe.cookTime}
                </div>
              )}
              {recipe.servings && (
                <div>
                  <span className="font-semibold">Servings:</span> {recipe.servings}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
