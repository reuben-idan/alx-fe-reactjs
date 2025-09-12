import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipeStore } from './recipeStore';

const AddRecipeForm = () => {
  const addRecipe = useRecipeStore((state) => state.addRecipe);
  const navigate = useNavigate();
  
    const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [image, setImage] = useState('');
  
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch(name) {
      case 'title': setTitle(value); break;
      case 'description': setDescription(value); break;
      case 'prepTime': setPrepTime(value); break;
      case 'cookTime': setCookTime(value); break;
      case 'servings': setServings(value); break;
      case 'cuisine': setCuisine(value); break;
      case 'image': setImage(value); break;
      default: break;
    }
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
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
    
    setIngredients(newIngredients);
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...instructions];
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
    
    setInstructions(newInstructions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Recipe title is required');
      return;
    }

    // Filter out empty ingredients and instructions
    const newRecipe = {
      title,
      description,
      ingredients: ingredients.filter(ing => ing.trim() !== ''),
      instructions: instructions.filter(inst => inst.trim() !== ''),
      prepTime,
      cookTime,
      servings,
      cuisine,
      image
    };
    
    if (newRecipe.ingredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }
    
    if (newRecipe.instructions.length === 0) {
      setError('Please add at least one instruction');
      return;
    }

    // Add the new recipe
    addRecipe(newRecipe);
    
    // Reset form
    setFormData({
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
    
    setError('');
    
    // Show success message and redirect
    alert('Recipe added successfully!');
    navigate('/');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Recipe</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
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
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Recipe
          </button>
        </div>
      </form>
    </div>            placeholder="Enter ingredients separated by commas"
            rows="3"
          />
        </div>
        
        <button type="submit" className="submit-btn">
          Add Recipe
        </button>
      </form>
    </div>
  );
};

export default AddRecipeForm;
