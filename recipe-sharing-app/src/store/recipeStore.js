import { create } from 'zustand';

// Sample initial recipes
const initialRecipes = [
  {
    id: 1,
    title: 'Pasta Carbonara',
    description: 'Classic Italian pasta dish with eggs, cheese, pancetta, and black pepper.',
    ingredients: ['Spaghetti', 'Eggs', 'Pancetta', 'Parmesan', 'Black pepper', 'Salt'],
    instructions: [
      'Cook pasta according to package instructions',
      'Fry pancetta until crispy',
      'Mix eggs and grated cheese in a bowl',
      'Drain pasta and mix with egg and cheese mixture',
      'Add pancetta and mix well',
      'Serve with black pepper and extra cheese'
    ],
    prepTime: '10 mins',
    cookTime: '15 mins',
    servings: 4,
    cuisine: 'Italian',
    image: 'https://images.unsplash.com/photo-1612874742237-6526229898c7?w=500&auto=format',
    isFavorite: false
  },
  {
    id: 2,
    title: 'Chicken Tikka Masala',
    description: 'Creamy and flavorful Indian curry with tender chicken pieces.',
    ingredients: ['Chicken', 'Yogurt', 'Cream', 'Tomato sauce', 'Ginger', 'Garlic', 'Spices'],
    instructions: [
      'Marinate chicken in yogurt and spices',
      'Grill or bake the chicken',
      'Prepare the masala sauce with tomatoes, cream, and spices',
      'Add the cooked chicken to the sauce',
      'Simmer for 10-15 minutes',
      'Garnish with fresh coriander'
    ],
    prepTime: '20 mins',
    cookTime: '30 mins',
    servings: 4,
    cuisine: 'Indian',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format',
    isFavorite: false
  }
];

const useRecipeStore = create((set, get) => ({
  // State
  recipes: [...initialRecipes],
  searchTerm: '',
  favorites: [],
  recommendations: [],
  
  // Getters
  filteredRecipes: (state) => {
    const { recipes, searchTerm } = state;
    if (!searchTerm.trim()) return recipes;
    
    const term = searchTerm.toLowerCase();
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(term) ||
      recipe.description.toLowerCase().includes(term) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(term)) ||
      recipe.cuisine.toLowerCase().includes(term)
    );
  },

  // Actions
  addRecipe: (newRecipe) => 
    set((state) => ({
      recipes: [...state.recipes, { ...newRecipe, id: Date.now(), isFavorite: false }]
    })),
    
  updateRecipe: (id, updatedRecipe) =>
    set((state) => ({
      recipes: state.recipes.map((recipe) =>
        recipe.id === id ? { ...recipe, ...updatedRecipe } : recipe
      ),
    })),
    
  deleteRecipe: (id) =>
    set((state) => ({
      recipes: state.recipes.filter((recipe) => recipe.id !== id),
      favorites: state.favorites.filter(favId => favId !== id)
    })),
    
  setSearchTerm: (term) => set({ searchTerm: term }),
  
  toggleFavorite: (id) =>
    set((state) => {
      const isFavorite = state.favorites.includes(id);
      return {
        favorites: isFavorite
          ? state.favorites.filter(favId => favId !== id)
          : [...state.favorites, id],
        recipes: state.recipes.map(recipe =>
          recipe.id === id ? { ...recipe, isFavorite: !isFavorite } : recipe
        )
      };
    }),
    
  generateRecommendations: () =>
    set((state) => {
      // Simple recommendation logic: show recipes from the same cuisine as favorites
      const favoriteCuisines = state.recipes
        .filter(recipe => state.favorites.includes(recipe.id))
        .map(recipe => recipe.cuisine);
      
      const recommendations = state.recipes
        .filter(recipe => 
          !state.favorites.includes(recipe.id) && 
          favoriteCuisines.includes(recipe.cuisine)
        )
        .slice(0, 3); // Limit to 3 recommendations
      
      return { recommendations };
    }),
    
  // Alias for deleteRecipe to maintain backward compatibility
  removeRecipe: (id) => get().deleteRecipe(id),
  
  // Initialize with sample data if empty
  initializeRecipes: () => 
    set((state) => ({
      recipes: state.recipes.length ? state.recipes : [...initialRecipes]
    }))
}));

export default useRecipeStore;
