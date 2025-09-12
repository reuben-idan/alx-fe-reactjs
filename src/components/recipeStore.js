import { create } from 'zustand';

export const useRecipeStore = create((set) => ({
  recipes: [],
  addRecipe: (newRecipe) => 
    set((state) => ({ 
      recipes: [...state.recipes, { ...newRecipe, id: Date.now() }] 
    })),
  setRecipes: (recipes) => set({ recipes }),
  removeRecipe: (id) =>
    set((state) => ({
      recipes: state.recipes.filter((recipe) => recipe.id !== id),
    })),
}));
