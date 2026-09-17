import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Users, Edit2, Search, Check, X, AlertCircle } from 'lucide-react';

export default function AdminUsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({ role: '', assignedName: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleEditClick = (user) => {
    setEditingUserId(user._id);
    setEditForm({ role: user.role || 'Visitor', assignedName: user.assignedName || '' });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
  };

  const handleSaveEdit = async (userId) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...editForm }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u._id === userId ? data.data : u));
        setEditingUserId(null);
        showToast('User updated successfully');
      } else {
        showToast(data.error || 'Failed to update user', 'error');
      }
    } catch (err) {
      showToast('Error updating user', 'error');
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.assignedName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '1rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card-bg)', border: '1px solid var(--border-default)', color: 'var(--geist-foreground)', padding: '0.65rem 1.15rem', borderRadius: 6, fontSize: '0.82rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <Check size={14} color={toastMessage.type === 'error' ? '#ef4444' : '#10b981'} /> {toastMessage.text}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} color="#38bdf8" /> User Management
          </h1>
          <p style={{ color: 'var(--accents-5)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage user roles and assign member names for data access.
          </p>
        </div>
        
        <div className="v-input-wrapper" style={{ minWidth: 300 }}>
          <Search size={14} color="var(--accents-5)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="v-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search by name, email, or assigned name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle size={24} style={{ marginBottom: '1rem' }} />
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--accents-5)' }}>
          <div className="status-saving-spinner" style={{ margin: '0 auto 1rem auto' }} />
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="table-smart-wrapper" style={{ marginTop: '1rem' }}>
          <div className="v-table-container">
            <table className="v-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Assigned Name</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--accents-5)' }}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {user.image ? (
                            <img src={user.image} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                          ) : (
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #10b981)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                              {(user.name || 'U').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span style={{ fontWeight: 600 }}>{user.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--accents-5)', fontSize: '0.9rem' }}>{user.email}</td>
                      
                      <td>
                        {editingUserId === user._id ? (
                          <select 
                            className="v-select" 
                            value={editForm.role}
                            onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                          >
                            <option value="Owner">Owner</option>
                            <option value="Leader">Leader</option>
                            <option value="Co-Leader">Co-Leader</option>
                            <option value="Member">Member</option>
                            <option value="Visitor">Visitor</option>
                          </select>
                        ) : (
                          <span className="metric-badge blue" style={{ background: user.role === 'Visitor' ? 'var(--accents-2)' : undefined, color: user.role === 'Visitor' ? 'var(--accents-5)' : undefined }}>
                            {user.role || 'Visitor'}
                          </span>
                        )}
                      </td>

                      <td>
                        {editingUserId === user._id ? (
                          <input 
                            type="text" 
                            className="v-input" 
                            placeholder="e.g. Jasmin"
                            value={editForm.assignedName}
                            onChange={(e) => setEditForm({...editForm, assignedName: e.target.value})}
                          />
                        ) : (
                          <span style={{ fontWeight: user.assignedName ? 600 : 400, color: user.assignedName ? 'var(--foreground)' : 'var(--accents-5)', fontSize: '0.9rem' }}>
                            {user.assignedName || 'Not assigned'}
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {editingUserId === user._id ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <button className="btn-v btn-v-primary" style={{ padding: '0.4rem 0.6rem' }} onClick={() => handleSaveEdit(user._id)}>
                              <Check size={14} /> Save
                            </button>
                            <button className="btn-v btn-v-secondary" style={{ padding: '0.4rem 0.6rem' }} onClick={handleCancelEdit}>
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button className="btn-v btn-v-secondary" onClick={() => handleEditClick(user)}>
                            <Edit2 size={14} /> Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
