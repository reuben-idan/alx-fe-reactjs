import { useRecipeStore } from './recipeStore';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const DeleteRecipeButton = ({ recipeId, onDelete, className = '' }) => {
  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);
  const navigate = useNavigate();

  const handleDelete = (event) => {
    event.preventDefault();
    
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        deleteRecipe(recipeId);
        
        // If a custom onDelete handler is provided, call it
        if (typeof onDelete === 'function') {
          onDelete();
        } else {
          // Default behavior: navigate to home if no custom onDelete handler is provided
          navigate('/');
        }
      } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Failed to delete the recipe. Please try again.');
      }
    }
  };

  return (
    <button 
      type="button"
      onClick={handleDelete}
      className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${className}`}
      aria-label="Delete recipe"
    >
      Delete Recipe
    </button>
  );
};

DeleteRecipeButton.propTypes = {
  recipeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onDelete: PropTypes.func,
  className: PropTypes.string
};

export default DeleteRecipeButton;
