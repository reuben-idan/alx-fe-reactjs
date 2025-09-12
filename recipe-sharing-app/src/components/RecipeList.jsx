import { useRecipeStore } from '../store/recipeStore';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import RecipeCard from './RecipeCard';
import RecommendationsList from './RecommendationsList';

const RecipeList = () => {
  const { removeRecipe } = useRecipeStore();
  const recipes = useRecipeStore((state) => state.getFilteredRecipes());

  return (
    <div className="space-y-12">
      {/* Search and Filters */}
      <div className="space-y-6">
        <SearchBar />
        
        {/* Recommendations Section */}
        <div className="mt-8">
          <RecommendationsList />
        </div>

        {/* Recipe List */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">All Recipes</h2>
            <span className="text-gray-600">
              {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} found
            </span>
          </div>
          
          {recipes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600 mb-4">No recipes match your search criteria.</p>
              <Link 
                to="/"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe}
                  onDelete={(id) => removeRecipe(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeList;
