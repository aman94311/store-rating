import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    const params = { ...filters, sortBy, order };
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    api.get('/admin/users', { params })
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [sortBy, order]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setOrder('ASC');
    }
  };

  const handleAddUser = async (e) => {
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
    const passRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
    if (!passRegex.test(form.password)) {
      setError('Password must be 8-16 chars with uppercase & special char');
      return;
    }

    try {
      await api.post('/admin/users', form);
      setSuccess('User added successfully');
      setShowModal(false);
      setForm({ name: '', email: '', password: '', address: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') return <span className="badge badge-admin">Admin</span>;
    if (role === 'store_owner') return <span className="badge badge-owner">Store Owner</span>;
    return <span className="badge badge-user">User</span>;
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h2>Users</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add User</button>
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
          <div className="form-group">
            <label>Role</label>
            <select value={filters.role} onChange={e => setFilters({...filters, role: e.target.value})}>
              <option value="">All</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Filter</button>
        </form>

        {success && <p className="success-msg" style={{marginBottom: 12}}>{success}</p>}

        <div className="card table-wrap">
          {loading ? (
            <p>Loading...</p>
          ) : users.length === 0 ? (
            <div className="empty-state">No users found</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>Name {sortBy === 'name' && (order === 'ASC' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('email')}>Email {sortBy === 'email' && (order === 'ASC' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('address')}>Address {sortBy === 'address' && (order === 'ASC' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('role')}>Role {sortBy === 'role' && (order === 'ASC' ? '↑' : '↓')}</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td style={{maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis'}}>{u.address}</td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>{u.role === 'store_owner' ? (u.rating || '0.0') : '-'}</td>
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
            <h3>Add New User</h3>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Name (20-60 chars)</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} required rows={2} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="user">Normal User</option>
                  <option value="admin">Admin</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
              {error && <p className="error-msg">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsers;
