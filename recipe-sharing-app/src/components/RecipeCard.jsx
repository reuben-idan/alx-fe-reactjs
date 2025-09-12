import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const RecipeCard = ({ 
  recipe, 
  onDelete, 
  onToggleFavorite, 
  isFavorite: isFavoriteProp,
  showFavorite = true
}) => {
  const location = useLocation();
  const isEditPage = location.pathname.includes('/edit');
  const isFavoritesPage = location.pathname === '/favorites';
  
  // Determine if the recipe is a favorite
  const isFavorite = typeof isFavoriteProp === 'boolean' 
    ? isFavoriteProp 
    : false;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {recipe.image && (
        <div className="relative">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-48 object-cover"
          />
          {showFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onToggleFavorite) {
                  onToggleFavorite(recipe.id);
                }
              }}
              className={`absolute top-2 right-2 p-2 rounded-full ${
                isFavorite 
                  ? 'bg-red-100 text-red-500 hover:bg-red-200' 
                  : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'
              } transition-colors`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                className="h-6 w-6"
                fill={isFavorite ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          )}
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            <Link to={`/recipe/${recipe.id}`} className="hover:text-blue-600">
              {recipe.title}
            </Link>
          </h3>
          
          {/* Edit and Delete buttons (only show on homepage) */}
          {!isEditPage && !isFavoritesPage && (
            <div className="flex space-x-2">
              <Link
                to={`/edit/${recipe.id}`}
                className="text-blue-600 hover:text-blue-800"
                aria-label="Edit recipe"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this recipe?')) {
                    onDelete && onDelete(recipe.id);
                  }
                }}
                className="text-red-600 hover:text-red-800"
                aria-label="Delete recipe"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {recipe.cuisine && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
            {recipe.cuisine}
          </span>
        )}
        
        <p className="text-gray-700 mb-4 line-clamp-2">{recipe.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500 space-x-2">
            <span>{recipe.prepTime} min</span>
            <span>•</span>
            <span>{recipe.servings} servings</span>
          </div>
          
          {recipe.rating && (
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 text-gray-600">{recipe.rating}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <Link
            to={`/recipe/${recipe.id}`}
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            View Recipe
          </Link>
        </div>
      </div>
    </div>
  );
};

RecipeCard.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    cuisine: PropTypes.string,
    prepTime: PropTypes.number,
    servings: PropTypes.number,
    rating: PropTypes.number,
    image: PropTypes.string
  }).isRequired,
  onDelete: PropTypes.func,
  onToggleFavorite: PropTypes.func,
  isFavorite: PropTypes.bool,
  showFavorite: PropTypes.bool
};

export default RecipeCard;
