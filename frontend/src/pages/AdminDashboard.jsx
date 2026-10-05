import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h2>Admin Dashboard</h2>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalStores}</h3>
              <p>Total Stores</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalRatings}</h3>
              <p>Total Ratings</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <Link to="/admin/users" className="btn btn-primary">Manage Users</Link>
          <Link to="/admin/stores" className="btn btn-primary">Manage Stores</Link>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
