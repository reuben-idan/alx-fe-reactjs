function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#111827',
        color: 'white',
        textAlign: 'center',
        padding: '12px',
        marginTop: '24px'
      }}
    >
      <p style={{ margin: 0 }}>© {new Date().getFullYear()} My Favorite Cities</p>
    </footer>
  );
}

export default Footer;
