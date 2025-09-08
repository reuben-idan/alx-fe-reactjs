import UserProfile from './UserProfile';

function MainContent() {
  return (
    <main
      style={{
        padding: '16px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
      }}
    >
      <section style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: '0 0 8px', color: '#111827' }}>Featured Users</h2>
        <UserProfile name="Alice Johnson" age={29} bio="Software engineer who loves hiking and photography." />
        <UserProfile name="Bob Smith" age={34} bio="Product designer and coffee enthusiast." />
      </section>
    </main>
  );
}

export default MainContent;
