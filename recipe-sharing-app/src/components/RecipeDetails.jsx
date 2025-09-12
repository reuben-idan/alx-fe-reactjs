import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import useRecipeStore from '../store/recipeStore';

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    recipes, 
    favorites, 
    toggleFavorite, 
    deleteRecipe 
  } = useRecipeStore();
  
  const recipe = recipes.find(r => r.id === Number(id));
  
  if (!recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Recipe not found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Recipes
        </button>
      </div>
    );
  }
  
  const isFavorite = favorites.includes(recipe.id);
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      deleteRecipe(recipe.id);
      navigate('/');
    }
  };
  
  const handleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(recipe.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Recipe Header */}
      <div className="relative">
        {recipe.image ? (
          <img 
            src={recipe.image} 
            alt={recipe.title}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-white bg-opacity-80 p-2 rounded-full shadow-md hover:bg-opacity-100 transition-all"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>
        
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => navigate(`/edit/${recipe.id}`)}
            className="bg-white bg-opacity-80 p-2 rounded-full shadow-md hover:bg-opacity-100 transition-all"
            aria-label="Edit recipe"
          >
            <PencilIcon className="h-6 w-6 text-blue-600" />
          </button>
          
          <button
            onClick={handleDelete}
            className="bg-white bg-opacity-80 p-2 rounded-full shadow-md hover:bg-opacity-100 transition-all"
            aria-label="Delete recipe"
          >
            <TrashIcon className="h-6 w-6 text-red-600" />
          </button>
          
          <button
            onClick={handleFavorite}
            className="bg-white bg-opacity-80 p-2 rounded-full shadow-md hover:bg-opacity-100 transition-all"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <HeartIconSolid 
              className={`h-6 w-6 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`} 
            />
          </button>
        </div>
      </div>
      
      {/* Recipe Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
            {recipe.cuisine && (
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {recipe.cuisine}
              </span>
            )}
          </div>
          
          <div className="text-right">
            {(recipe.prepTime || recipe.cookTime) && (
              <div className="text-sm text-gray-500">
                {recipe.prepTime && <div>⏱️ Prep: {recipe.prepTime}</div>}
                {recipe.cookTime && <div>🍳 Cook: {recipe.cookTime}</div>}
                {recipe.servings && <div>👥 Serves: {recipe.servings}</div>}
              </div>
            )}
          </div>
        </div>
        
        {recipe.description && (
          <p className="text-gray-700 mb-6">{recipe.description}</p>
        )}
        
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* Ingredients */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Instructions */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex">
                  <span className="font-bold text-gray-700 mr-2">{index + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
