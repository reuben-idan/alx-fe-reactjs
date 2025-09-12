import { create } from 'zustand';

// Helper function to find recipes by IDs
const findRecipesByIds = (recipes, ids) => {
  return ids.map(id => recipes.find(recipe => recipe.id === id)).filter(Boolean);
};

// Helper function to generate recommendations based on favorites
const generateRecommendations = (recipes, favorites) => {
  if (favorites.length === 0) {
    // If no favorites, return random recipes
    const shuffled = [...recipes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }

  // Find recipes with similar cuisine to favorites
  const favoriteCuisines = new Set(
    favorites.flatMap(id => {
      const recipe = recipes.find(r => r.id === id);
      return recipe ? [recipe.cuisine] : [];
    })
  );

  // Filter out already favorited recipes
  return recipes
    .filter(recipe => 
      !favorites.includes(recipe.id) && 
      favoriteCuisines.has(recipe.cuisine)
    )
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
};

export const useRecipeStore = create((set, get) => ({
  // Recipes state
  recipes: [],
  
  // Favorites state
  favorites: JSON.parse(localStorage.getItem('recipeFavorites') || '[]'),
  
  // Recipe actions
  addRecipe: (newRecipe) => 
    set((state) => ({ 
      recipes: [...state.recipes, { ...newRecipe, id: Date.now() }] 
    })),
    
  setRecipes: (recipes) => set({ recipes }),
  
  removeRecipe: (id) =>
    set((state) => ({
      recipes: state.recipes.filter((recipe) => recipe.id !== id),
      // Also remove from favorites if it was favorited
      favorites: state.favorites.filter(favId => favId !== id)
    })),
  
  // Favorites actions
  addFavorite: (recipeId) =>
    set((state) => {
      const updatedFavorites = [...state.favorites, recipeId];
      localStorage.setItem('recipeFavorites', JSON.stringify(updatedFavorites));
      return { favorites: updatedFavorites };
    }),
    
  removeFavorite: (recipeId) =>
    set((state) => {
      const updatedFavorites = state.favorites.filter(id => id !== recipeId);
      localStorage.setItem('recipeFavorites', JSON.stringify(updatedFavorites));
      return { favorites: updatedFavorites };
    }),
  
  toggleFavorite: (recipeId) =>
    set((state) => {
      const isFavorite = state.favorites.includes(recipeId);
      const updatedFavorites = isFavorite
        ? state.favorites.filter(id => id !== recipeId)
        : [...state.favorites, recipeId];
      
      localStorage.setItem('recipeFavorites', JSON.stringify(updatedFavorites));
      return { favorites: updatedFavorites };
    }),
  
  isFavorite: (recipeId) => {
    return get().favorites.includes(recipeId);
  },
  
  // Recommendations
  getRecommendations: () => {
    const { recipes, favorites } = get();
    return generateRecommendations(recipes, favorites);
  },
  
  // Get favorite recipes
  getFavoriteRecipes: () => {
    const { recipes, favorites } = get();
    return findRecipesByIds(recipes, favorites);
  }
}));
