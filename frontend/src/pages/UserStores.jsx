import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const UserStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [ratingModal, setRatingModal] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStores = () => {
    setLoading(true);
    const params = { ...filters, sortBy, order };
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    api.get('/stores', { params })
      .then(res => setStores(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStores();
  }, [sortBy, order]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setOrder('ASC');
    }
  };

  const openRatingModal = (store) => {
    setRatingModal(store);
    setSelectedRating(store.userRating || 0);
    setError('');
    setSuccess('');
  };

  const submitRating = async () => {
    if (selectedRating < 1 || selectedRating > 5) {
      setError('Please select a rating between 1 and 5');
      return;
    }

    try {
      if (ratingModal.userRating) {
        await api.put('/stores/rate', {
          store_id: ratingModal.id,
          rating: selectedRating
        });
        setSuccess('Rating updated');
      } else {
        await api.post('/stores/rate', {
          store_id: ratingModal.id,
          rating: selectedRating
        });
        setSuccess('Rating submitted');
      }
      setTimeout(() => {
        setRatingModal(null);
        fetchStores();
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  const renderStars = (rating) => {
    const r = Math.round(parseFloat(rating) || 0);
    return <span className="stars">{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>;
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h2>All Stores</h2>
        </div>

        <form className="filters" onSubmit={handleFilter}>
          <div className="form-group">
            <label>Store Name</label>
            <input value={filters.name} onChange={e => setFilters({...filters, name: e.target.value})} placeholder="Search by name" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input value={filters.address} onChange={e => setFilters({...filters, address: e.target.value})} placeholder="Search by address" />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div className="card table-wrap">
          {loading ? (
            <p>Loading...</p>
          ) : stores.length === 0 ? (
            <div className="empty-state">No stores found</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>Store Name {sortBy === 'name' && (order === 'ASC' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('address')}>Address {sortBy === 'address' && (order === 'ASC' ? '↑' : '↓')}</th>
                  <th>Overall Rating</th>
                  <th>Your Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(s => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td style={{maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis'}}>{s.address}</td>
                    <td>
                      {renderStars(s.overallRating)} {s.overallRating}
                      <span style={{color: '#9ca3af', fontSize: 12}}> ({s.ratingCount})</span>
                    </td>
                    <td>
                      {s.userRating ? (
                        <>{renderStars(s.userRating)} {s.userRating}</>
                      ) : (
                        <span style={{color: '#9ca3af'}}>Not rated</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => openRatingModal(s)}>
                        {s.userRating ? 'Modify' : 'Rate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {ratingModal && (
        <div className="modal-overlay" onClick={() => setRatingModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{ratingModal.userRating ? 'Update Rating' : 'Submit Rating'}</h3>
            <p style={{marginBottom: 12, color: '#6b7280'}}>{ratingModal.name}</p>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  className={selectedRating >= n ? 'active' : ''}
                  onClick={() => setSelectedRating(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            {error && <p className="error-msg">{error}</p>}
            {success && <p className="success-msg">{success}</p>}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setRatingModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitRating}>
                {ratingModal.userRating ? 'Update' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserStores;
