import Search from './components/Search';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ErrorBoundary>
        <Search />
      </ErrorBoundary>
    </div>
  );
}

export default App;
