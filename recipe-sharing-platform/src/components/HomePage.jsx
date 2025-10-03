import { Link } from 'react-router-dom';

function HomePage() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    // Load recipe data from the JSON file
    const loadRecipes = async () => {
      try {
        const response = await fetch('./data.json');
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold text-gray-800">
            Recipe Sharing Platform
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Discover delicious recipes shared by our community
          </p>
        </div>
        <Link
          to="/add-recipe"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Recipe
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Link
            key={recipe.id}
            to={`/recipe/${recipe.id}`}
            className="block"
          >
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 transform cursor-pointer">
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
                <div className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200">
                  View Recipe →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
