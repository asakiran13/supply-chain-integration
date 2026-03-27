import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const { pathname } = useLocation();

  const links = [
    { to: '/dashboard', label: '🌐 Dashboard' },
    { to: '/simulate', label: '⚡ Simulate' },
    { to: '/planner', label: '🗺️ Planner' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">⚓</span>
        <span className="brand-text">AI Supply Chain Router</span>
      </div>
      <div className="navbar-links">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`nav-link ${pathname === link.to ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
