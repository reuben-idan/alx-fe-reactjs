import { useState, useEffect } from 'react';

function HomePage() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    // Load recipe data from the JSON file
    const loadRecipes = async () => {
      try {
        const response = await fetch('/data.json');
        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        console.error('Error loading recipes:', error);
      }
    };

    loadRecipes();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        Recipe Sharing Platform
      </h1>
      <p className="text-lg text-center mb-12 text-gray-600">
        Discover delicious recipes shared by our community
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:scale-105 transform transition-transform duration-300 cursor-pointer"
          >
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800 hover:text-blue-600 transition-colors duration-200">
                {recipe.title}
              </h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {recipe.summary}
              </p>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                View Recipe
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
