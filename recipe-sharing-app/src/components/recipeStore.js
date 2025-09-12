import { create } from "zustand";

export const useRecipeStore = create((set, get) => ({
  recipes: [],
  searchTerm: '',
  filters: {
    cuisine: '',
    maxPrepTime: '',
    minRating: 0,
    ingredients: []
  },
  
  // Set search term
  setSearchTerm: (term) => set({ searchTerm: term }),
  
  // Update filters
  setFilters: (newFilters) => set(state => ({
    filters: { ...state.filters, ...newFilters }
  })),
  
  // Reset all filters
  resetFilters: () => set({
    searchTerm: '',
    filters: {
      cuisine: '',
      maxPrepTime: '',
      minRating: 0,
      ingredients: []
    }
  }),
  
  // Add a new recipe
  addRecipe: (newRecipe) => 
    set((state) => ({
      recipes: [...state.recipes, { ...newRecipe, id: Date.now() }]
    })),
  
  // Update an existing recipe
  updateRecipe: (id, updatedRecipe) =>
    set((state) => ({
      recipes: state.recipes.map((recipe) =>
        recipe.id === id ? { ...recipe, ...updatedRecipe } : recipe
      ),
    })),
  
  // Delete a recipe
  deleteRecipe: (id) =>
    set((state) => ({
      recipes: state.recipes.filter((recipe) => recipe.id !== id),
    })),
  
  // Set multiple recipes at once (for initialization)
  setRecipes: (recipes) => set({ recipes }),
  
  // Set search term
  setSearchTerm: (term) => set({ searchTerm: term }),
  
  // Get filtered recipes based on search term and filters
  getFilteredRecipes: () => {
    const { recipes, searchTerm, filters } = get();
    
    return recipes.filter(recipe => {
      // Search term filter
      const matchesSearch = !searchTerm.trim() || 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.ingredients && recipe.ingredients.some(ing => 
          ing.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      
      // Cuisine filter
      const matchesCuisine = !filters.cuisine || 
        (recipe.cuisine && recipe.cuisine.toLowerCase() === filters.cuisine.toLowerCase());
      
      // Prep time filter
      const matchesPrepTime = !filters.maxPrepTime || 
        (recipe.prepTime && parseInt(recipe.prepTime) <= parseInt(filters.maxPrepTime));
      
      // Rating filter
      const matchesRating = !filters.minRating || 
        (recipe.rating && recipe.rating >= filters.minRating);
      
      // Ingredients filter
      const matchesIngredients = filters.ingredients.length === 0 ||
        (recipe.ingredients && filters.ingredients.every(ing => 
          recipe.ingredients.some(recipeIng => 
            recipeIng.toLowerCase().includes(ing.toLowerCase())
          )
        ));
      
      return matchesSearch && matchesCuisine && matchesPrepTime && 
             matchesRating && matchesIngredients;
    });
  },
  
  // Get unique cuisines for filter dropdown
  getUniqueCuisines: () => {
    const { recipes } = get();
    const cuisines = new Set();
    recipes.forEach(recipe => {
      if (recipe.cuisine) {
        cuisines.add(recipe.cuisine);
      }
    });
    return Array.from(cuisines).sort();
  },
  
  // Alias for deleteRecipe to maintain backward compatibility
  removeRecipe: (id) =>
    set((state) => ({
      recipes: state.recipes.filter((recipe) => recipe.id !== id),
    })),
}));