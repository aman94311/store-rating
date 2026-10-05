import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const OwnerDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/owner/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container"><p>Loading...</p></div>
      </>
    );
  }

  if (!data || data.length === 0 || data.message) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="page-header"><h2>My Store Dashboard</h2></div>
          <div className="card empty-state">
            No store has been assigned to you yet. Please contact the administrator.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h2>My Store Dashboard</h2>
        </div>

        {data.map((item, idx) => (
          <div key={idx}>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{item.averageRating}</h3>
                <p>Average Rating</p>
              </div>
              <div className="stat-card">
                <h3>{item.totalRatings}</h3>
                <p>Total Ratings</p>
              </div>
              <div className="stat-card" style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: 16, color: '#1e293b' }}>{item.store.name}</h3>
                <p style={{ fontSize: 13 }}>{item.store.address}</p>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 12, fontSize: 16 }}>Users who rated your store</h3>
              {item.raters.length === 0 ? (
                <div className="empty-state">No ratings yet</div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Rating</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.raters.map(r => (
                        <tr key={r.id + '-' + r.ratedAt}>
                          <td>{r.name}</td>
                          <td>{r.email}</td>
                          <td>
                            <span className="stars">{'★'.repeat(r.rating)}</span> {r.rating}
                          </td>
                          <td>{new Date(r.ratedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default OwnerDashboard;
