import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={{ display: 'flex', gap: '12px', padding: '12px 16px', backgroundColor: '#111827' }}>
      <Link style={{ color: 'white', textDecoration: 'none' }} to="/">Home</Link>
      <Link style={{ color: 'white', textDecoration: 'none' }} to="/about">About</Link>
      <Link style={{ color: 'white', textDecoration: 'none' }} to="/services">Services</Link>
      <Link style={{ color: 'white', textDecoration: 'none' }} to="/contact">Contact</Link>
    </nav>
  );
}

export default Navbar;
