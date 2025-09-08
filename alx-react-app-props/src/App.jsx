import './App.css'
import ProfilePage from './ProfilePage'
import UserContext from './UserContext'

function App() {
  const userData = { name: 'Jane Doe', email: 'jane.doe@example.com' };

  return (
    <UserContext.Provider value={userData}>
      <div style={{ padding: '16px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
        <h1 style={{ marginBottom: '12px' }}>User Profile</h1>
        <ProfilePage />
      </div>
    </UserContext.Provider>
  )
}

export default App
