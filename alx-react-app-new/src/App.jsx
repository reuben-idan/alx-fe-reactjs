import './App.css'
import Header from './components/Header'
import MainContent from './components/MainContent'
import Footer from './components/Footer'
import Counter from './components/Counter'

function App() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <Header />
      <div style={{ padding: '16px', maxWidth: '900px', margin: '0 auto' }}>
        <MainContent />
        <Counter />
      </div>
      <Footer />
    </div>
  )
}

export default App
