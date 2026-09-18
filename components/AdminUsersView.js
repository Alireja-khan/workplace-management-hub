import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Users, Edit2, Search, Check, X, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminUsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [isCustomName, setIsCustomName] = useState(false);

  const [editingUserId, setEditingUserId] = useState(null);
  const [savingUserId, setSavingUserId] = useState(null);
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
    
    // Fetch available members
    fetch('/api/team-projects/members')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAvailableMembers(data.data);
        }
      })
      .catch(err => console.error('Failed to fetch available members', err));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleEditClick = (user) => {
    setEditingUserId(user._id);
    setEditForm({ role: user.role || 'Visitor', assignedName: user.assignedName || '' });
    setIsCustomName(false);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
  };

  const handleSaveEdit = async (userId) => {
    // Optimistic Update
    const originalUser = users.find(u => u._id === userId);
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: editForm.role, assignedName: editForm.assignedName } : u));
    setEditingUserId(null);
    setSavingUserId(userId);
    
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...editForm }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('User updated successfully');
      } else {
        // Revert on failure
        setUsers(prev => prev.map(u => u._id === userId ? originalUser : u));
        showToast(data.error || 'Failed to update user', 'error');
      }
    } catch (err) {
      // Revert on failure
      setUsers(prev => prev.map(u => u._id === userId ? originalUser : u));
      showToast('Error updating user', 'error');
    } finally {
      setSavingUserId(null);
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--geist-foreground)' }}>
            <Users size={28} color="#38bdf8" /> User Management
          </h1>
          <p style={{ color: 'var(--accents-5)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
            Manage user roles and assign member names for data access across the platform.
          </p>
        </div>
        
        <div className="v-input-wrapper" style={{ minWidth: 320, maxWidth: '100%' }}>
          <Search size={16} color="var(--accents-5)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="v-input"
            style={{ paddingLeft: '2.5rem', borderRadius: '8px' }}
            placeholder="Search by name, email, or assigned name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle size={32} style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Failed to load</h3>
          <p style={{ color: '#f87171' }}>{error}</p>
        </div>
      ) : loading ? (
        <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--accents-5)' }}>
          <div className="status-saving-spinner" style={{ margin: '0 auto 1.5rem auto', width: 32, height: 32, borderWidth: 3 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Fetching users data...</p>
        </div>
      ) : (
        <div className="table-smart-wrapper glass-panel" style={{ marginTop: '1rem', borderRadius: '12px', overflow: 'hidden' }}>
          <div className="v-table-container">
            <table className="v-table" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ padding: '1.2rem 1rem', background: 'var(--accents-1)' }}>User Profile</th>
                  <th style={{ padding: '1.2rem 1rem', background: 'var(--accents-1)' }}>Email Address</th>
                  <th style={{ padding: '1.2rem 1rem', background: 'var(--accents-1)' }}>Role & Assignment</th>
                  <th style={{ padding: '1.2rem 1rem', background: 'var(--accents-1)', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--accents-5)' }}>
                      <Users size={32} color="var(--accents-4)" style={{ margin: '0 auto 1rem auto' }} />
                      <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No users found matching your search.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} style={{ transition: 'all 0.2s ease', backgroundColor: editingUserId === user._id ? 'var(--accents-1)' : (savingUserId === user._id ? 'rgba(56, 189, 248, 0.05)' : 'transparent') }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: savingUserId === user._id ? 0.6 : 1 }}>
                          {user.image ? (
                            <img src={user.image} alt={user.name} style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border-default)', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #10b981)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, boxShadow: '0 4px 10px rgba(56,189,248,0.2)' }}>
                              {(user.name || 'U').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--geist-foreground)', display: 'block', fontSize: '1rem' }}>{user.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accents-5)' }}>ID: {user._id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--accents-6)', fontSize: '0.95rem', padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: savingUserId === user._id ? 0.6 : 1 }}>
                          {user.email}
                        </div>
                      </td>
                      
                      <td style={{ padding: '1rem' }}>
                        {editingUserId === user._id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <select 
                              className="v-select" 
                              style={{ fontWeight: 500, padding: '0.35rem 0.5rem', fontSize: '0.85rem', width: '120px' }}
                              value={editForm.role}
                              onChange={(e) => {
                                const newRole = e.target.value;
                                setEditForm({...editForm, role: newRole, assignedName: newRole === 'Visitor' ? '' : editForm.assignedName});
                              }}
                            >
                              <option value="Owner">Owner</option>
                              <option value="Leader">Leader</option>
                              <option value="Co-Leader">Co-Leader</option>
                              <option value="Member">Member</option>
                              <option value="Visitor">Visitor</option>
                            </select>

                            {editForm.role !== 'Visitor' && (
                              !isCustomName ? (
                                <select 
                                  className="v-select" 
                                  style={{ fontWeight: 500, padding: '0.35rem 0.5rem', fontSize: '0.85rem', width: '130px' }}
                                  value={editForm.assignedName}
                                  onChange={(e) => {
                                    if (e.target.value === 'ADD_NEW_CUSTOM_NAME') {
                                      setIsCustomName(true);
                                      setEditForm({...editForm, assignedName: ''});
                                    } else {
                                      setEditForm({...editForm, assignedName: e.target.value});
                                    }
                                  }}
                                >
                                  <option value="">-- Assign --</option>
                                  {availableMembers.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                  ))}
                                  <option value="ADD_NEW_CUSTOM_NAME" style={{ fontWeight: 600, color: '#38bdf8' }}>+ Custom Name</option>
                                </select>
                              ) : (
                                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                  <input 
                                    type="text" 
                                    className="v-input" 
                                    style={{ fontWeight: 500, padding: '0.35rem 0.5rem', fontSize: '0.85rem', width: '130px' }}
                                    placeholder="e.g. Jasmin"
                                    value={editForm.assignedName}
                                    onChange={(e) => setEditForm({...editForm, assignedName: e.target.value})}
                                    autoFocus
                                  />
                                  <button 
                                    className="btn-v-ghost" 
                                    style={{ padding: '0.35rem', borderRadius: '6px' }}
                                    onClick={() => {
                                      setIsCustomName(false);
                                      setEditForm({...editForm, assignedName: ''});
                                    }}
                                    title="Cancel Custom Name"
                                  >
                                    <X size={14} color="var(--accents-5)" />
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', opacity: savingUserId === user._id ? 0.6 : 1 }}>
                            <span className={`metric-badge ${user.role === 'Owner' || user.role === 'Leader' ? 'blue' : user.role === 'Co-Leader' ? 'purple' : user.role === 'Member' ? 'green' : ''}`} style={{ background: user.role === 'Visitor' ? 'var(--accents-2)' : undefined, color: user.role === 'Visitor' ? 'var(--accents-5)' : undefined, padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                              {user.role === 'Owner' && <ShieldCheck size={12} style={{ marginRight: 4 }} />}
                              {user.role || 'Visitor'}
                            </span>
                            {user.role !== 'Visitor' && user.assignedName && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--accents-6)', background: 'var(--accents-1)', padding: '0.25rem 0.75rem', borderRadius: '999px', border: '1px solid var(--border-default)' }}>
                                <User size={12} />
                                <span style={{ fontWeight: 500 }}>{user.assignedName}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'center', padding: '1rem', verticalAlign: 'middle' }}>
                        {savingUserId === user._id ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--accents-5)' }}>
                            <Loader2 size={16} className="spin" />
                            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Saving</span>
                          </div>
                        ) : editingUserId === user._id ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <button 
                              className="btn-v btn-v-primary" 
                              style={{ padding: '0.35rem 0.75rem', borderRadius: '6px' }} 
                              onClick={() => handleSaveEdit(user._id)}
                            >
                              <Check size={14} style={{ marginRight: 4 }} /> Save
                            </button>
                            <button 
                              className="btn-v btn-v-secondary" 
                              style={{ padding: '0.35rem 0.5rem', borderRadius: '6px' }} 
                              onClick={handleCancelEdit}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="btn-v btn-v-secondary" 
                            style={{ padding: '0.35rem 0.75rem', borderRadius: '6px' }}
                            onClick={() => handleEditClick(user)}
                          >
                            <Edit2 size={14} style={{ marginRight: 4 }} /> Edit
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

