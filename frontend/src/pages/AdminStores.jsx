import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStores = () => {
    setLoading(true);
    const params = { ...filters, sortBy, order };
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    api.get('/admin/stores', { params })
      .then(res => setStores(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStores();
    api.get('/admin/users', { params: { role: 'store_owner' } })
      .then(res => setOwners(res.data))
      .catch(console.error);
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

  const handleAddStore = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.name.length < 20 || form.name.length > 60) {
      setError('Name must be 20-60 characters');
      return;
    }
    if (form.address.length > 400) {
      setError('Address max 400 characters');
      return;
    }

    try {
      const payload = { ...form };
      if (!payload.owner_id) delete payload.owner_id;
      else payload.owner_id = Number(payload.owner_id);
      await api.post('/admin/stores', payload);
      setSuccess('Store added successfully');
      setShowModal(false);
      setForm({ name: '', email: '', address: '', owner_id: '' });
      fetchStores();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add store');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h2>Stores</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Store</button>
        </div>

        <form className="filters" onSubmit={handleFilter}>
          <div className="form-group">
            <label>Name</label>
            <input value={filters.name} onChange={e => setFilters({...filters, name: e.target.value})} placeholder="Search name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input value={filters.email} onChange={e => setFilters({...filters, email: e.target.value})} placeholder="Search email" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input value={filters.address} onChange={e => setFilters({...filters, address: e.target.value})} placeholder="Search address" />
          </div>
          <button type="submit" className="btn btn-primary">Filter</button>
        </form>

        {success && <p className="success-msg" style={{marginBottom: 12}}>{success}</p>}

        <div className="card table-wrap">
          {loading ? (
            <p>Loading...</p>
          ) : stores.length === 0 ? (
            <div className="empty-state">No stores found</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>Name {sortBy === 'name' && (order === 'ASC' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('email')}>Email {sortBy === 'email' && (order === 'ASC' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('address')}>Address {sortBy === 'address' && (order === 'ASC' ? '↑' : '↓')}</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(s => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td style={{maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis'}}>{s.address}</td>
                    <td>
                      <span className="stars">{'★'.repeat(Math.round(parseFloat(s.rating) || 0))}</span>
                      {' '}{s.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Store</h3>
            <form onSubmit={handleAddStore}>
              <div className="form-group">
                <label>Store Name (20-60 chars)</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} required rows={2} />
              </div>
              <div className="form-group">
                <label>Store Owner (optional)</label>
                <select value={form.owner_id} onChange={e => setForm({...form, owner_id: e.target.value})}>
                  <option value="">Select owner</option>
                  {owners.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                  ))}
                </select>
              </div>
              {error && <p className="error-msg">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Store</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminStores;
