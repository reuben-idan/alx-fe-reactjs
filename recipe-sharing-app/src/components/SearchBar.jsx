import { useState, useEffect } from 'react';
import { useRecipeStore } from './recipeStore';

const SearchBar = () => {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const { 
    setSearchTerm, 
    filters, 
    setFilters, 
    resetFilters,
    getUniqueCuisines 
  } = useRecipeStore();
  
  const cuisines = getUniqueCuisines();
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [localSearchTerm, setSearchTerm]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ [name]: value });
  };
  
  const handleIngredientAdd = () => {
    if (ingredientInput.trim() && !filters.ingredients.includes(ingredientInput.trim())) {
      setFilters({ 
        ingredients: [...filters.ingredients, ingredientInput.trim()] 
      });
      setIngredientInput('');
    }
  };
  
  const removeIngredient = (ingredientToRemove) => {
    setFilters({
      ingredients: filters.ingredients.filter(ing => ing !== ingredientToRemove)
    });
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Search & Filter Recipes</h2>
      
      {/* Search by name or description */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Search Recipes</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title, description, or ingredients..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cuisine Filter */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Cuisine</label>
          <select
            name="cuisine"
            value={filters.cuisine}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Cuisines</option>
            {cuisines.map((cuisine) => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>
        </div>
        
        {/* Max Prep Time */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Max Prep Time (mins)</label>
          <input
            type="number"
            name="maxPrepTime"
            placeholder="e.g. 30"
            value={filters.maxPrepTime}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        {/* Min Rating */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Min Rating</label>
          <select
            name="minRating"
            value={filters.minRating}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value={0}>Any Rating</option>
            <option value={4}>4+ Stars</option>
            <option value={3}>3+ Stars</option>
            <option value={2}>2+ Stars</option>
            <option value={1}>1+ Star</option>
          </select>
        </div>
        
        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={resetFilters}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
      
      {/* Ingredients Filter */}
      <div className="mt-4">
        <label className="block text-gray-700 text-sm font-medium mb-2">Filter by Ingredients</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add ingredient to filter..."
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleIngredientAdd()}
            className="flex-1 p-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleIngredientAdd}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Add
          </button>
        </div>
        
        {/* Selected Ingredients */}
        {filters.ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.ingredients.map((ingredient) => (
              <span 
                key={ingredient} 
                className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
              >
                {ingredient}
                <button 
                  onClick={() => removeIngredient(ingredient)}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
