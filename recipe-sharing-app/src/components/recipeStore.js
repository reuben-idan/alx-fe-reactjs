import { create } from "zustand";

export const useRecipeStore = create((set, get) => ({
  recipes: [],
  searchTerm: '',
  
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
  
  // Get filtered recipes based on search term
  getFilteredRecipes: () => {
    const { recipes, searchTerm } = get();
    if (!searchTerm.trim()) return recipes;
    
    const term = searchTerm.toLowerCase();
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(term) ||
      recipe.description.toLowerCase().includes(term) ||
      (recipe.ingredients && recipe.ingredients.some(ing => 
        ing.toLowerCase().includes(term)
      ))
    );
  },
  
  // Alias for deleteRecipe to maintain backward compatibility
  removeRecipe: (id) =>
    set((state) => ({
      recipes: state.recipes.filter((recipe) => recipe.id !== id),
    })),
}));