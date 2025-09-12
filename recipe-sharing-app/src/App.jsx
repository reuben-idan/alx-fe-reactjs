import { useEffect } from 'react'
import './App.css'
import RecipeList from './components/RecipeList';
import AddRecipeForm from './components/AddRecipeForm';
import useRecipeStore from './store/recipeStore';

function App() {
  const setRecipes = useRecipeStore((state) => state.setRecipes);

  // Load sample recipes on initial render
  useEffect(() => {
    const sampleRecipes = [
      {
        id: 1,
        title: 'Pasta Carbonara',
        description: 'Classic Italian pasta dish with eggs, cheese, pancetta, and black pepper.',
        ingredients: ['Spaghetti', 'Eggs', 'Pancetta', 'Parmesan cheese', 'Black pepper']
      },
      {
        id: 2,
        title: 'Vegetable Stir Fry',
        description: 'Quick and healthy stir-fried vegetables with a savory sauce.',
        ingredients: ['Broccoli', 'Carrots', 'Bell peppers', 'Soy sauce', 'Garlic']
      }
    ];
    
    setRecipes(sampleRecipes);
  }, [setRecipes]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍳 Recipe Sharing App</h1>
        <p>Share and discover delicious recipes</p>
      </header>
      
      <main className="app-content">
        <div className="container">
          <div className="form-container">
            <AddRecipeForm />
          </div>
          <div className="recipes-container">
            <RecipeList />
          </div>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Recipe Sharing App. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
