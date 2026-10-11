import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        Nex<span>Cart</span>
      </Link>
      <nav>
        {user ? (
          <>
            <NavLink to="/" end>
              Dashboard
            </NavLink>
            <NavLink to="/orders">Orders</NavLink>
            <NavLink to="/orders/new">New Order</NavLink>
            <span className="user-chip">Hi, {user.username}</span>
            <button className="btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
