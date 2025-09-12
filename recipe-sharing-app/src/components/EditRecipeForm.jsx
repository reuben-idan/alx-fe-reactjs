import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import useRecipeStore from '../store/recipeStore';

const EditRecipeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, updateRecipe } = useRecipeStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    prepTime: '',
    cookTime: '',
    servings: '',
    cuisine: '',
    image: ''
  });
  
  const [error, setError] = useState('');

  // Load recipe data when component mounts
  useEffect(() => {
    const recipe = recipes.find(r => r.id === Number(id));
    if (recipe) {
      setFormData({
        title: recipe.title || '',
        description: recipe.description || '',
        ingredients: recipe.ingredients.length > 0 ? [...recipe.ingredients, ''] : [''],
        instructions: recipe.instructions.length > 0 ? [...recipe.instructions, ''] : [''],
        prepTime: recipe.prepTime || '',
        cookTime: recipe.cookTime || '',
        servings: recipe.servings || '',
        cuisine: recipe.cuisine || '',
        image: recipe.image || ''
      });
    } else {
      navigate('/');
    }
  }, [id, recipes, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));  
  };
  
  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    
    // Add a new empty field if this is the last one and it's not empty
    if (index === newIngredients.length - 1 && value.trim() !== '') {
      newIngredients.push('');
    }
    
    // Remove trailing empty fields (but keep at least one)
    while (newIngredients.length > 1 && newIngredients[newIngredients.length - 1] === '' && 
           newIngredients[newIngredients.length - 2] === '') {
      newIngredients.pop();
    }
    
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };
  
  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    
    // Add a new empty field if this is the last one and it's not empty
    if (index === newInstructions.length - 1 && value.trim() !== '') {
      newInstructions.push('');
    }
    
    // Remove trailing empty fields (but keep at least one)
    while (newInstructions.length > 1 && newInstructions[newInstructions.length - 1] === '' && 
           newInstructions[newInstructions.length - 2] === '') {
      newInstructions.pop();
    }
    
    setFormData(prev => ({
      ...prev,
      instructions: newInstructions
    }));
  };
  
  const removeIngredient = (index, e) => {
    e.preventDefault();
    if (formData.ingredients.length === 1) return; // Keep at least one field
    
    const newIngredients = [...formData.ingredients];
    newIngredients.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };
  
  const removeInstruction = (index, e) => {
    e.preventDefault();
    if (formData.instructions.length === 1) return; // Keep at least one field
    
    const newInstructions = [...formData.instructions];
    newInstructions.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      instructions: newInstructions
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      setError('Recipe title is required');
      return;
    }
    
    // Filter out empty ingredients and instructions
    const updatedRecipe = {
      ...formData,
      id: Number(id),
      ingredients: formData.ingredients.filter(ing => ing.trim() !== ''),
      instructions: formData.instructions.filter(inst => inst.trim() !== '')
    };
    
    if (updatedRecipe.ingredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }
    
    if (updatedRecipe.instructions.length === 0) {
      setError('Please add at least one instruction');
      return;
    }

    // Update the recipe
    updateRecipe(Number(id), updatedRecipe);
    
    // Redirect to recipe details
    navigate(`/recipe/${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Edit Recipe</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Basic Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="title">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="e.g., Spaghetti Carbonara"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="cuisine">
                  Cuisine
                </label>
                <input
                  type="text"
                  id="cuisine"
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Italian, Mexican, etc."
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-gray-700 mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="A brief description of your recipe..."
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="prepTime">
                  Prep Time
                </label>
                <input
                  type="text"
                  id="prepTime"
                  name="prepTime"
                  value={formData.prepTime}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 15 mins"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="cookTime">
                  Cook Time
                </label>
                <input
                  type="text"
                  id="cookTime"
                  name="cookTime"
                  value={formData.cookTime}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 30 mins"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="servings">
                  Servings
                </label>
                <input
                  type="number"
                  id="servings"
                  name="servings"
                  value={formData.servings}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 4"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-gray-700 mb-2" htmlFor="image">
                Image URL (optional)
              </label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          
          {/* Ingredients */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Ingredients</h3>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="mb-2">
                <div className="flex items-center">
                  <span className="mr-2">•</span>
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    placeholder={`Ingredient ${index + 1}`}
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      onClick={(e) => removeIngredient(index, e)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      type="button"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Instructions */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Instructions</h3>
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="mb-4">
                <label className="block text-gray-700 mb-1">
                  Step {index + 1}
                </label>
                <div className="flex">
                  <textarea
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    rows="2"
                    placeholder={`Step ${index + 1}...`}
                  />
                  {formData.instructions.length > 1 && (
                    <button
                      onClick={(e) => removeInstruction(index, e)}
                      className="ml-2 text-red-500 hover:text-red-700 self-start mt-2"
                      type="button"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Update Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecipeForm;
