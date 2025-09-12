import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, NavLink } from 'react-router-dom';
import './App.css';
import RecipeList from './components/RecipeList';
import AddRecipeForm from './components/AddRecipeForm';
import RecipeDetails from './components/RecipeDetails';
import EditRecipeForm from './components/EditRecipeForm';
import FavoritesList from './components/FavoritesList';
import { useRecipeStore } from './store/recipeStore';

function App() {
  const setRecipes = useRecipeStore((state) => state.setRecipes);

  // Load sample recipes on initial render
  useEffect(() => {
    const sampleRecipes = [
      {
        id: 1,
        title: 'Pasta Carbonara',
        description: 'Classic Italian pasta dish with eggs, cheese, pancetta, and black pepper.',
        ingredients: ['200g Spaghetti', '2 large eggs', '100g Pancetta or guanciale', '50g Pecorino Romano cheese', 'Freshly ground black pepper', 'Salt'],
        instructions: [
          'Bring a large pot of salted water to boil and cook spaghetti according to package instructions.',
          'In a bowl, whisk eggs and grated cheese together to form a paste.',
          'In a large pan, cook the pancetta until crispy.',
          'Drain the pasta, reserving a cup of pasta water.',
          'Working quickly, add the hot pasta to the pan with pancetta, then remove from heat.',
          'Add the egg and cheese mixture, tossing quickly to create a creamy sauce.',
          'Add pasta water a tablespoon at a time if needed to loosen the sauce.',
          'Season with black pepper and serve immediately.'
        ],
        prepTime: '10',
        cookTime: '15',
        servings: 2,
        cuisine: 'Italian',
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1612874742237-6526224048f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
      },
      {
        id: 2,
        title: 'Vegetable Stir Fry',
        description: 'Quick and healthy stir-fried vegetables with a savory sauce.',
        ingredients: ['1 head broccoli, cut into florets', '2 carrots, julienned', '1 red bell pepper, sliced', '2 tbsp soy sauce', '2 cloves garlic, minced', '1 tbsp ginger, grated', '1 tbsp vegetable oil', '1 tsp sesame oil', '1 tsp honey', 'Sesame seeds for garnish'],
        instructions: [
          'In a small bowl, whisk together soy sauce, garlic, ginger, and honey to make the sauce.',
          'Heat vegetable oil in a wok or large pan over high heat.',
          'Add carrots and stir-fry for 2 minutes.',
          'Add broccoli and bell pepper, stir-fry for another 3-4 minutes until vegetables are crisp-tender.',
          'Pour the sauce over the vegetables and toss to coat evenly.',
          'Drizzle with sesame oil and toss again.',
          'Garnish with sesame seeds and serve hot with rice or noodles.'
        ],
        prepTime: '15',
        cookTime: '10',
        servings: 4,
        cuisine: 'Asian',
        rating: 4.0,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
      }
    ];
    
    // Only set recipes if the store is empty
    const currentRecipes = useRecipeStore.getState().recipes;
    if (currentRecipes.length === 0) {
      setRecipes(sampleRecipes);
    }
  }, [setRecipes]);

  return (
    <Router>
      <div className="app min-h-screen flex flex-col">
        <header className="app-header py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <Link to="/" className="no-underline">
                <h1 className="text-4xl font-bold text-white mb-2">🍳 Recipe Sharing App</h1>
              </Link>
              <p className="text-lg text-gray-200">Share and discover delicious recipes</p>
            </div>
            <nav className="mt-4 flex space-x-4">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-white/20 text-white' : 'text-gray-200 hover:bg-white/10'}`
                }
              >
                Home
              </NavLink>
              <NavLink 
                to="/favorites" 
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium flex items-center ${isActive ? 'bg-white/20 text-white' : 'text-gray-200 hover:bg-white/10'}`
                }
              >
                <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Favorites
              </NavLink>
            </nav>
          </div>
        </header>
        
        <main className="flex-grow bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <Routes>
              <Route path="/" element={
                <div className="space-y-8">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Add New Recipe</h2>
                    <AddRecipeForm />
                  </div>
                  <div className="space-y-6">
                    <RecipeList />
                  </div>
                </div>
              } />
              <Route path="/recipe/:id" element={<RecipeDetails />} />
              <Route path="/edit/:id" element={<EditRecipeForm />} />
              <Route path="/favorites" element={
                <div className="space-y-8">
                  <FavoritesList />
                </div>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        
        <footer className="app-footer">
          <p>© {new Date().getFullYear()} Recipe Sharing App. All rights reserved.</p>
      </footer>
      </div>
    </Router>
  );
}

export default App;
