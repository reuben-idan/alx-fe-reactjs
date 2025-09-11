import { useContext } from 'react';
import UserContext from './UserContext';

function UserProfile() {
  const userData = useContext(UserContext);

  return (
    <div style={{ border: '1px solid #e5e7eb', padding: '12px', borderRadius: '8px' }}>
      <p style={{ margin: '4px 0' }}>Name: <span style={{ fontWeight: 'bold' }}>{userData?.name}</span></p>
      <p style={{ margin: '4px 0' }}>Email: <span style={{ fontWeight: 'bold' }}>{userData?.email}</span></p>
    </div>
  );
}

export default UserProfile;
