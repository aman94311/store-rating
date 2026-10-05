import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin' || user.role === 'System Administrator';
  const isNormalUser = user.role === 'user' || user.role === 'Normal User';
  const isStoreOwner = user.role === 'store_owner' || user.role === 'Store Owner';

  return (
    <nav className="navbar">
      <div className="logo">Store Ratings</div>
      <div className="nav-links">
        {isAdmin && (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/stores">Stores</Link>
          </>
        )}
        {isNormalUser && (
          <Link to="/stores">Stores</Link>
        )}
        {isStoreOwner && (
          <Link to="/owner">My Store</Link>
        )}
        <Link to="/update-password">Change Password</Link>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>
          {user.name ? user.name.split(' ')[0] : 'User'} ({user.role})
        </span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
