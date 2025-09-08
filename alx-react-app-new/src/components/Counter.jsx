import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', marginTop: '16px' }}>
      <p style={{ margin: '0 0 8px' }}>Current Count: <span style={{ fontWeight: 'bold' }}>{count}</span></p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setCount(count + 1)} style={{ padding: '8px 12px' }}>Increment</button>
        <button onClick={() => setCount(count - 1)} style={{ padding: '8px 12px' }}>Decrement</button>
        <button onClick={() => setCount(0)} style={{ padding: '8px 12px' }}>Reset</button>
      </div>
    </div>
  );
}

export default Counter;
