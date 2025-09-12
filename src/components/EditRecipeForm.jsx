import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipeStore } from './recipeStore';

const EditRecipeForm = () => {
  const { id } = useParams();
  const recipeId = parseInt(id);
  const navigate = useNavigate();
  const { recipes, updateRecipe } = useRecipeStore();
  
  // Find the recipe to edit
  const recipeToEdit = recipes.find(r => r.id === recipeId);
  
  // Initialize form state with recipe data or empty values
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: ['', '', '', '', ''],
    instructions: ['', '', ''],
    prepTime: '',
    cookTime: '',
    servings: '',
    cuisine: '',
    image: ''
  });

  // Populate form when component mounts or recipeToEdit changes
  useEffect(() => {
    if (recipeToEdit) {
      setFormData({
        title: recipeToEdit.title || '',
        description: recipeToEdit.description || '',
        ingredients: recipeToEdit.ingredients?.length > 0 
          ? [...recipeToEdit.ingredients, ''] 
          : ['', '', '', '', ''],
        instructions: recipeToEdit.instructions?.length > 0 
          ? [...recipeToEdit.instructions, ''] 
          : ['', '', ''],
        prepTime: recipeToEdit.prepTime || '',
        cookTime: recipeToEdit.cookTime || '',
        servings: recipeToEdit.servings || '',
        cuisine: recipeToEdit.cuisine || '',
        image: recipeToEdit.image || ''
      });
    } else {
      // Redirect if recipe not found
      navigate('/');
    }
  }, [recipeToEdit, navigate]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty ingredients and instructions
    const updatedRecipe = {
      ...formData,
      ingredients: formData.ingredients.filter(ing => ing.trim() !== ''),
      instructions: formData.instructions.filter(inst => inst.trim() !== '')
    };
    
    // Update the recipe in the store
    updateRecipe(recipeId, updatedRecipe);
    
    // Redirect to the recipe details page
    navigate(`/recipe/${recipeId}`);
  };

  if (!recipeToEdit) {
    return <div className="p-4">Loading recipe...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Recipe</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
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
              </div>
            </div>
          ))}
        </div>
        
        {/* Instructions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          {formData.instructions.map((instruction, index) => (
            <div key={index} className="mb-4">
              <label className="block text-gray-700 mb-1">
                Step {index + 1}
              </label>
              <textarea
                value={instruction}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="2"
                placeholder={`Step ${index + 1}...`}
              />
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
  );
};

export default EditRecipeForm;
