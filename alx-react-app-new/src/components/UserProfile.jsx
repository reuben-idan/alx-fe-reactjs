function UserProfile({ name, age, bio }) {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '10px',
        margin: '10px',
        borderRadius: '8px',
        backgroundColor: '#f9fafb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
      }}
    >
      <h2 style={{ color: 'blue', margin: '0 0 8px' }}>{name}</h2>
      <p style={{ margin: '4px 0' }}>
        Age: <span style={{ fontWeight: 'bold' }}>{age}</span>
      </p>
      <p style={{ margin: '4px 0', color: '#374151' }}>Bio: {bio}</p>
    </div>
  );
}

export default UserProfile;
