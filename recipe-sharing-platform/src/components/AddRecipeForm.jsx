import { useState } from 'react';
import { Link } from 'react-router-dom';

function AddRecipeForm() {
  const [formData, setFormData] = useState({
    title: '',
    ingredients: '',
    instructions: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target; // Extract target.value for form handling
    setFormData(prev => ({
      ...prev,
      [name]: e.target.value // Use target.value directly
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Recipe title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }

    // Ingredients validation
    if (!formData.ingredients.trim()) {
      newErrors.ingredients = 'Ingredients are required';
    } else {
      const ingredientLines = formData.ingredients.trim().split('\n').filter(line => line.trim());
      if (ingredientLines.length < 2) {
        newErrors.ingredients = 'Please include at least 2 ingredients';
      }
    }

    // Instructions validation
    if (!formData.instructions.trim()) {
      newErrors.instructions = 'Preparation instructions are required';
    } else if (formData.instructions.trim().length < 20) {
      newErrors.instructions = 'Instructions must be at least 20 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Simulate API call - in a real app, this would POST to a server
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For now, just show success message
      setSubmitMessage('Recipe submitted successfully!');

      // Reset form
      setFormData({
        title: '',
        ingredients: '',
        instructions: ''
      });

    } catch (error) {
      setSubmitMessage('Error submitting recipe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              ← Back to Recipes
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Add New Recipe</h1>
          </div>
        </div>
      </nav>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-10">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10">
          <div className="mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Share Your Recipe</h2>
            <p className="text-gray-600 text-sm md:text-base">Add a delicious recipe to our community collection</p>
          </div>

          {submitMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              submitMessage.includes('Error')
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {submitMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipe Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., Classic Chocolate Chip Cookies"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Ingredients */}
            <div>
              <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients * (one per line)
              </label>
              <textarea
                id="ingredients"
                name="ingredients"
                value={formData.ingredients}
                onChange={handleInputChange}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical ${
                  errors.ingredients ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="2 cups all-purpose flour&#10;1 cup brown sugar&#10;1/2 cup butter&#10;2 eggs&#10;1 tsp vanilla extract&#10;1 cup chocolate chips"
              />
              {errors.ingredients && (
                <p className="mt-1 text-sm text-red-600">{errors.ingredients}</p>
              )}
            </div>

            {/* Instructions */}
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                Preparation Instructions *
              </label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                rows={8}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical ${
                  errors.instructions ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Follow these steps:&#10;Step 1: Preheat oven to 350°F...&#10;Step 2: In a large bowl, cream together butter and sugars...&#10;Step 3: Beat in eggs and vanilla..."
              />
              {errors.instructions && (
                <p className="mt-1 text-sm text-red-600">{errors.instructions}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 sm:flex-none sm:px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Recipe'
                )}
              </button>

              <Link
                to="/"
                className="flex-1 sm:flex-none sm:px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200 text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddRecipeForm;
