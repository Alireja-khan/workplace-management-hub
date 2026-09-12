'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  Layers,
  Plus,
  Table as TableIcon,
  Columns,
  Search,
  RotateCcw,
  FileSpreadsheet,
  Download,
  Upload,
  ExternalLink,
  Copy,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Github,
  LogOut,
  Wallet,
  TrendingUp,
  X,
  Calendar,
  Check,
  Globe
} from 'lucide-react';

export default function Dashboard() {
  const { data: session, status: authStatus } = useSession();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('all');
  const [currentView, setCurrentView] = useState('table'); // 'table' or 'kanban'
  const [searchQuery, setSearchQuery] = useState('');
  const [profileFilter, setProfileFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scheduleFilter, setScheduleFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'assignDate', direction: 'desc' });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    assignDate: new Date().toISOString().split('T')[0],
    month: 'April',
    clientUsername: '',
    profileName: '',
    instructionSheet: '',
    amount: '',
    orderStatus: 'Wip',
    ourSubdomain: '',
    deadline: '',
    timeSchedule: 'Complete',
    clientDomain: '',
    marketplaceStatus: 'Delivered',
    dailyUpdate: '',
    futurePlan: '',
    review: 5,
    backupInfo: '',
    notes: '',
  });

  // Fetch projects from MongoDB API on load
  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Auto seed if empty
      await fetch('/api/projects/seed', { method: 'POST' });
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
      showToast('Error connecting to database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // KPIs Calculation
  const kpis = useMemo(() => {
    let totalGross = 0;
    let activeWip = 0;
    let wipVal = 0;
    let deliveredDone = 0;

    projects.forEach((p) => {
      const amt = parseFloat(p.amount) || 0;
      totalGross += amt;
      const s = (p.orderStatus || '').toLowerCase();
      if (s === 'wip' || s === 'issue') {
        activeWip++;
        wipVal += amt;
      }
      if (s === 'done' || s === 'delivered' || (p.marketplaceStatus || '').toLowerCase() === 'delivered') {
        deliveredDone++;
      }
    });

    const netAmount = totalGross * 0.8;
    const rate = projects.length > 0 ? Math.round((deliveredDone / projects.length) * 100) : 0;

    return { totalGross, netAmount, activeWip, wipVal, deliveredDone, rate };
  }, [projects]);

  // Unique profiles for filter dropdown
  const uniqueProfiles = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.profileName).filter(Boolean))).sort();
  }, [projects]);

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    let res = projects.filter((p) => {
      if (currentTab === 'running') {
        const s = (p.orderStatus || '').toLowerCase();
        const sch = (p.timeSchedule || '').toLowerCase();
        if (s !== 'wip' && s !== 'issue' && sch !== 'late') return false;
      } else if (currentTab !== 'all') {
        if ((p.month || '').toLowerCase() !== currentTab.toLowerCase()) return false;
      }

      if (profileFilter !== 'all' && p.profileName !== profileFilter) return false;
      if (statusFilter !== 'all' && (p.orderStatus || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (scheduleFilter !== 'all' && (p.timeSchedule || '').toLowerCase() !== scheduleFilter.toLowerCase()) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchClient = (p.clientUsername || '').toLowerCase().includes(q);
        const matchProfile = (p.profileName || '').toLowerCase().includes(q);
        const matchSubdomain = (p.ourSubdomain || '').toLowerCase().includes(q);
        const matchDomain = (p.clientDomain || '').toLowerCase().includes(q);
        const matchNotes = (p.notes || '').toLowerCase().includes(q);
        const matchDaily = (p.dailyUpdate || '').toLowerCase().includes(q);
        if (!matchClient && !matchProfile && !matchSubdomain && !matchDomain && !matchNotes && !matchDaily) return false;
      }

      return true;
    });

    res.sort((a, b) => {
      let vA = a[sortConfig.key];
      let vB = b[sortConfig.key];
      if (sortConfig.key === 'amount') {
        vA = parseFloat(vA) || 0;
        vB = parseFloat(vB) || 0;
      } else {
        vA = (vA || '').toString().toLowerCase();
        vB = (vB || '').toString().toLowerCase();
      }
      if (vA < vB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (vA > vB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return res;
  }, [projects, currentTab, profileFilter, statusFilter, scheduleFilter, searchQuery, sortConfig]);

  // Handle Sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Quick Status Update (Direct from Table)
  const handleQuickStatusChange = async (projectId, newStatus) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: newStatus,
          marketplaceStatus: newStatus === 'Done' || newStatus === 'Delivered' ? 'Delivered' : 'Wip',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.map((p) => (p._id === projectId ? data.data : p)));
        showToast(`Status updated to ${newStatus}`);
      }
    } catch (e) {
      showToast('Update failed', 'error');
    }
  };

  // Form Handlers
  const openNewModal = () => {
    setActiveProject(null);
    setFormData({
      assignDate: new Date().toISOString().split('T')[0],
      month: 'April',
      clientUsername: '',
      profileName: '',
      instructionSheet: '',
      amount: '',
      orderStatus: 'Wip',
      ourSubdomain: '',
      deadline: '',
      timeSchedule: 'Complete',
      clientDomain: '',
      marketplaceStatus: 'Delivered',
      dailyUpdate: '',
      futurePlan: '',
      review: 5,
      backupInfo: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setActiveProject(project);
    setFormData({
      assignDate: project.assignDate || '',
      month: project.month || 'April',
      clientUsername: project.clientUsername || '',
      profileName: project.profileName || '',
      instructionSheet: project.instructionSheet || '',
      amount: project.amount || '',
      orderStatus: project.orderStatus || 'Wip',
      ourSubdomain: project.ourSubdomain || '',
      deadline: project.deadline ? project.deadline.split('T')[0] : '',
      timeSchedule: project.timeSchedule || 'Complete',
      clientDomain: project.clientDomain || '',
      marketplaceStatus: project.marketplaceStatus || 'Delivered',
      dailyUpdate: project.dailyUpdate || '',
      futurePlan: project.futurePlan || '',
      review: project.review !== undefined ? project.review : 5,
      backupInfo: project.backupInfo || '',
      notes: project.notes || '',
    });
    setIsDetailOpen(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) || 0 };
      if (activeProject) {
        // Edit
        const res = await fetch(`/api/projects/${activeProject._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setProjects((prev) => prev.map((p) => (p._id === activeProject._id ? data.data : p)));
          showToast(`Order for ${payload.clientUsername} updated!`);
        }
      } else {
        // Create
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setProjects((prev) => [data.data, ...prev]);
          showToast(`New order added for ${payload.clientUsername}!`);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast('Save failed', 'error');
    }
  };

  const handleDelete = async (projectId, clientName) => {
    if (!confirm(`Delete order for "${clientName}" from MongoDB?`)) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p._id !== projectId));
        showToast('Order deleted from MongoDB');
        setIsDetailOpen(false);
      }
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  // CSV Export
  const exportCSV = () => {
    if (projects.length === 0) return showToast('No data to export', 'error');
    const headers = [
      'Assign Date',
      'Client Username',
      'Profile Name',
      'Instruction Sheet',
      'Gross Amount',
      'Without 20% Net',
      'Order Status',
      'Our Subdomain',
      'Deadline',
      'Time Schedule',
      'Client Domain',
      'Daily Update',
      'Review',
      'Backup Info',
    ];
    const rows = projects.map((p) => [
      `"${p.assignDate || ''}"`,
      `"${p.clientUsername || ''}"`,
      `"${p.profileName || ''}"`,
      `"${p.instructionSheet || ''}"`,
      p.amount || 0,
      ((p.amount || 0) * 0.8).toFixed(2),
      `"${p.orderStatus || ''}"`,
      `"${p.ourSubdomain || ''}"`,
      `"${p.deadline || ''}"`,
      `"${p.timeSchedule || ''}"`,
      `"${p.clientDomain || ''}"`,
      `"${(p.dailyUpdate || '').replace(/"/g, '""')}"`,
      p.review || 0,
      `"${(p.backupInfo || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Workplace_Orders_MongoDB_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported to CSV');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  return (
    <div className="container-max">
      {/* Toast */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
          <div className="badge-pill badge-done" style={{ padding: '0.75rem 1.25rem', fontSize: '0.85rem', background: '#0f172a', border: '1px solid #10b981', color: '#f8fafc', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <Check size={16} color="#10b981" /> {toastMessage.text}
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="nav-header">
        <div className="brand-wrapper">
          <div style={{ width: 38, height: 38, background: '#10b981', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Layers size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Workplace Hub</h1>
              <span className="brand-badge">Next.js + MongoDB</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Streamlined Agency Order & Subdomain Tracker</p>
          </div>
        </div>

        {/* User Auth & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button className="btn btn-outline" onClick={exportCSV} title="Export CSV">
            <Download size={15} /> Export
          </button>
          
          <button className="btn btn-primary" onClick={openNewModal}>
            <Plus size={16} /> New Order
          </button>

          {/* GitHub Auth Pill */}
          {session?.user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-input)', padding: '0.3rem 0.6rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              {session.user.image ? (
                <img src={session.user.image} alt={session.user.name} style={{ width: 24, height: 24, borderRadius: '50%' }} />
              ) : (
                <Github size={16} />
              )}
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{session.user.name || session.user.email}</span>
              <button className="btn-ghost" onClick={() => signOut()} title="Sign Out" style={{ padding: 2, cursor: 'pointer' }}>
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button className="btn btn-outline" onClick={() => signIn('github')} style={{ gap: '0.45rem' }}>
              <Github size={16} /> Login with GitHub
            </button>
          )}
        </div>
      </header>

      {/* KPI Stats Cards */}
      <section className="kpi-grid">
        <div className="kpi-box">
          <div className="kpi-title">
            <span>Total Gross Revenue</span>
            <Wallet size={16} color="#06b6d4" />
          </div>
          <div className="kpi-num">${kpis.totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="kpi-desc">{projects.length} Total orders recorded in MongoDB</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-title">
            <span>Net Take-Home (Without 20%)</span>
            <TrendingUp size={16} color="#10b981" />
          </div>
          <div className="kpi-num" style={{ color: '#10b981' }}>${kpis.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="kpi-desc">80% profit after platform fee (-20%)</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-title">
            <span>Active Work In Progress</span>
            <Clock size={16} color="#818cf8" />
          </div>
          <div className="kpi-num">{kpis.activeWip}</div>
          <div className="kpi-desc">${kpis.wipVal.toFixed(0)} current WIP queue</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-title">
            <span>Delivered & Completed</span>
            <CheckCircle2 size={16} color="#34d399" />
          </div>
          <div className="kpi-num">{kpis.deliveredDone}</div>
          <div className="kpi-desc">{kpis.rate}% delivery completion rate</div>
        </div>
      </section>

      {/* Controls & Filter Panel */}
      <section className="panel-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Month & Running Tabs */}
          <div className="tab-nav">
            <button className={`tab-item ${currentTab === 'all' ? 'active' : ''}`} onClick={() => setCurrentTab('all')}>
              All Orders ({projects.length})
            </button>
            <button className={`tab-item ${currentTab === 'running' ? 'active' : ''}`} onClick={() => setCurrentTab('running')}>
              Running ({projects.filter((p) => p.orderStatus === 'Wip' || p.orderStatus === 'Issue' || p.timeSchedule === 'Late').length})
            </button>
            <button className={`tab-item ${currentTab === 'April' ? 'active' : ''}`} onClick={() => setCurrentTab('April')}>April</button>
            <button className={`tab-item ${currentTab === 'May' ? 'active' : ''}`} onClick={() => setCurrentTab('May')}>May</button>
            <button className={`tab-item ${currentTab === 'June' ? 'active' : ''}`} onClick={() => setCurrentTab('June')}>June</button>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-input)', padding: 3, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
            <button
              className="btn btn-ghost"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: currentView === 'table' ? 'var(--bg-surface-elevated)' : 'transparent', color: currentView === 'table' ? '#fff' : 'var(--text-muted)' }}
              onClick={() => setCurrentView('table')}
            >
              <TableIcon size={14} /> Table
            </button>
            <button
              className="btn btn-ghost"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: currentView === 'kanban' ? 'var(--bg-surface-elevated)' : 'transparent', color: currentView === 'kanban' ? '#fff' : 'var(--text-muted)' }}
              onClick={() => setCurrentView('kanban')}
            >
              <Columns size={14} /> Kanban
            </button>
          </div>
        </div>

        {/* Filter Inputs Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="field-input"
              style={{ width: '100%', paddingLeft: 32 }}
              placeholder="Search by client, profile, subdomain, or update notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select className="field-select" value={profileFilter} onChange={(e) => setProfileFilter(e.target.value)}>
            <option value="all">All Marketplace Profiles</option>
            {uniqueProfiles.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select className="field-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="Done">Done</option>
            <option value="Wip">Wip</option>
            <option value="Delivered">Delivered</option>
            <option value="Issue">Issue</option>
            <option value="Cancel">Cancel</option>
          </select>

          <select className="field-select" value={scheduleFilter} onChange={(e) => setScheduleFilter(e.target.value)}>
            <option value="all">All Schedules</option>
            <option value="Complete">Complete</option>
            <option value="Late">Late</option>
            <option value="Repeat Order">Repeat Order</option>
            <option value="Add-on">Add-on</option>
          </select>

          <button
            className="btn btn-outline"
            onClick={() => {
              setSearchQuery('');
              setProfileFilter('all');
              setStatusFilter('all');
              setScheduleFilter('all');
            }}
            title="Reset Filters"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-dim)' }}>
          <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Loading records from MongoDB Atlas...</p>
        </div>
      ) : currentView === 'table' ? (
        /* Table View */
        <div className="table-wrap">
          <table className="clean-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('assignDate')}>Assign Date</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('clientUsername')}>Client Username</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('profileName')}>Profile</th>
                <th>Brief / Doc</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('amount')}>Gross ($)</th>
                <th>Without 20% ($)</th>
                <th>Order Status</th>
                <th>Our Subdomain</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('deadline')}>Deadline</th>
                <th>Schedule</th>
                <th>Client Domain</th>
                <th>Marketplace</th>
                <th>Daily Update</th>
                <th>Review</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={15} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
                    No matching orders found in database.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const gross = parseFloat(p.amount) || 0;
                  const net = gross * 0.8;
                  const statusClass =
                    p.orderStatus === 'Done'
                      ? 'badge-done'
                      : p.orderStatus === 'Delivered'
                      ? 'badge-delivered'
                      : p.orderStatus === 'Issue' || p.orderStatus === 'Cancel'
                      ? 'badge-issue'
                      : 'badge-wip';

                  return (
                    <tr key={p._id}>
                      <td style={{ color: 'var(--text-muted)' }}>{p.assignDate || '-'}</td>
                      <td>
                        <strong style={{ color: '#fff' }}>{p.clientUsername}</strong>
                      </td>
                      <td>
                        <span className="badge-pill" style={{ background: 'var(--bg-input)', color: '#94a3b8' }}>
                          {p.profileName}
                        </span>
                      </td>
                      <td>
                        {p.instructionSheet ? (
                          <a href={p.instructionSheet} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', color: '#34d399' }}>
                            <ExternalLink size={12} /> Brief
                          </a>
                        ) : '-'}
                      </td>
                      <td><strong style={{ color: '#fff' }}>${gross.toFixed(2)}</strong></td>
                      <td><span style={{ color: '#10b981', fontWeight: 700 }}>${net.toFixed(2)}</span></td>
                      <td>
                        <select
                          className={`badge-pill ${statusClass}`}
                          style={{ outline: 'none', cursor: 'pointer' }}
                          value={p.orderStatus || 'Wip'}
                          onChange={(e) => handleQuickStatusChange(p._id, e.target.value)}
                        >
                          <option value="Done">Done</option>
                          <option value="Wip">Wip</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Issue">Issue</option>
                          <option value="Cancel">Cancel</option>
                        </select>
                      </td>
                      <td>
                        {p.ourSubdomain ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <a href={p.ourSubdomain} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', color: '#38bdf8' }}>
                              <Globe size={12} /> Staging
                            </a>
                            <button className="btn-ghost" style={{ padding: 3, cursor: 'pointer' }} onClick={() => copyToClipboard(p.ourSubdomain)} title="Copy URL">
                              <Copy size={12} />
                            </button>
                          </div>
                        ) : '-'}
                      </td>
                      <td style={{ color: p.timeSchedule === 'Late' ? '#fb7185' : 'var(--text-muted)' }}>
                        {p.deadline || '-'}
                      </td>
                      <td>
                        <span className={`badge-pill ${p.timeSchedule === 'Complete' ? 'badge-done' : p.timeSchedule === 'Late' ? 'badge-late' : 'badge-wip'}`}>
                          {p.timeSchedule || 'Regular'}
                        </span>
                      </td>
                      <td>
                        {p.clientDomain ? (
                          <a href={p.clientDomain} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', color: '#a855f7' }}>
                            <ExternalLink size={12} /> Live
                          </a>
                        ) : '-'}
                      </td>
                      <td>
                        <span className="badge-pill badge-delivered">{p.marketplaceStatus || 'Delivered'}</span>
                      </td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }} title={p.dailyUpdate}>
                        {p.dailyUpdate || '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 2, color: '#fbbf24' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={12} fill={s <= (p.review || 0) ? '#fbbf24' : 'none'} color={s <= (p.review || 0) ? '#fbbf24' : '#475569'} />
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <button className="btn-ghost" style={{ padding: 4 }} onClick={() => { setActiveProject(p); setIsDetailOpen(true); }} title="View details">
                            <Eye size={14} />
                          </button>
                          <button className="btn-ghost" style={{ padding: 4 }} onClick={() => openEditModal(p)} title="Edit order">
                            <Edit2 size={14} />
                          </button>
                          <button className="btn-ghost" style={{ padding: 4, color: '#fb7185' }} onClick={() => handleDelete(p._id, p.clientUsername)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="kanban-grid">
          {['Assigned', 'Wip', 'Issue', 'Delivered', 'Done'].map((colStatus) => {
            const colItems = filteredProjects.filter((p) => (p.orderStatus || 'Assigned') === colStatus);
            return (
              <div
                key={colStatus}
                className="kanban-col"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const pId = e.dataTransfer.getData('text/plain');
                  if (pId) handleQuickStatusChange(pId, colStatus);
                }}
              >
                <div className="kanban-header">
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {colStatus === 'Wip' ? 'In Progress (WIP)' : colStatus}
                  </span>
                  <span className="badge-pill" style={{ background: 'var(--bg-input)' }}>{colItems.length}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {colItems.map((p) => (
                    <div
                      key={p._id}
                      className="kanban-card"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', p._id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{p.clientUsername}</strong>
                        <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                          ${((p.amount || 0) * 0.8).toFixed(0)} <small style={{ color: 'var(--text-dim)', fontWeight: 400 }}>net</small>
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        <span>{p.profileName}</span>
                        <span>Gross: ${p.amount}</span>
                      </div>

                      {p.dailyUpdate && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '0.4rem 0.5rem', borderRadius: 4, borderLeft: '2px solid #10b981' }}>
                          {p.dailyUpdate}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
                        <span style={{ color: p.timeSchedule === 'Late' ? '#fb7185' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} /> {p.deadline || 'No deadline'}
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn-ghost" style={{ padding: 2 }} onClick={() => openEditModal(p)}>
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-title-bar">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {activeProject ? `Edit Order: ${activeProject.clientUsername}` : 'Add New Order to MongoDB'}
              </h3>
              <button className="btn-ghost" onClick={() => setIsModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="field-group">
                    <label>Assign Date *</label>
                    <input type="date" className="field-input" value={formData.assignDate} onChange={(e) => setFormData({ ...formData, assignDate: e.target.value })} required />
                  </div>
                  <div className="field-group">
                    <label>Month Tab</label>
                    <select className="field-select" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })}>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Client Username *</label>
                    <input type="text" className="field-input" placeholder="e.g. mharris4463" value={formData.clientUsername} onChange={(e) => setFormData({ ...formData, clientUsername: e.target.value })} required />
                  </div>
                  <div className="field-group">
                    <label>Profile Name *</label>
                    <input type="text" className="field-input" placeholder="e.g. LeadsBridge, WpStellar" value={formData.profileName} onChange={(e) => setFormData({ ...formData, profileName: e.target.value })} required />
                  </div>
                  <div className="field-group">
                    <label>Gross Amount ($) *</label>
                    <input type="number" className="field-input" placeholder="e.g. 200" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                  </div>
                  <div className="field-group">
                    <label>Net Take-Home Preview (80%)</label>
                    <div style={{ background: 'var(--accent-emerald-subtle)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.55rem 0.8rem', borderRadius: 6, color: '#10b981', fontWeight: 800 }}>
                      ${((parseFloat(formData.amount) || 0) * 0.8).toFixed(2)}
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Order Status</label>
                    <select className="field-select" value={formData.orderStatus} onChange={(e) => setFormData({ ...formData, orderStatus: e.target.value })}>
                      <option value="Wip">Wip</option>
                      <option value="Done">Done</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Issue">Issue</option>
                      <option value="Cancel">Cancel</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Time Schedule</label>
                    <select className="field-select" value={formData.timeSchedule} onChange={(e) => setFormData({ ...formData, timeSchedule: e.target.value })}>
                      <option value="Complete">Complete</option>
                      <option value="Late">Late</option>
                      <option value="Need domain">Need domain</option>
                      <option value="Repeat Order">Repeat Order</option>
                      <option value="Add-on">Add-on</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Deadline Date</label>
                    <input type="date" className="field-input" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Marketplace Status</label>
                    <select className="field-select" value={formData.marketplaceStatus} onChange={(e) => setFormData({ ...formData, marketplaceStatus: e.target.value })}>
                      <option value="Delivered">Delivered</option>
                      <option value="Wip">Wip</option>
                      <option value="Cancel">Cancel</option>
                    </select>
                  </div>
                  <div className="field-group span-2">
                    <label>Instruction Sheet / Brief URL</label>
                    <input type="url" className="field-input" placeholder="https://docs.google.com/..." value={formData.instructionSheet} onChange={(e) => setFormData({ ...formData, instructionSheet: e.target.value })} />
                  </div>
                  <div className="field-group span-2">
                    <label>Our Subdomain (Staging Link)</label>
                    <input type="url" className="field-input" placeholder="https://client.wpcoreweb.com/" value={formData.ourSubdomain} onChange={(e) => setFormData({ ...formData, ourSubdomain: e.target.value })} />
                  </div>
                  <div className="field-group span-2">
                    <label>Client Live Domain</label>
                    <input type="url" className="field-input" placeholder="https://clientdomain.com/" value={formData.clientDomain} onChange={(e) => setFormData({ ...formData, clientDomain: e.target.value })} />
                  </div>
                  <div className="field-group span-2">
                    <label>Daily Update Note</label>
                    <input type="text" className="field-input" placeholder="Current progress or solved bugs..." value={formData.dailyUpdate} onChange={(e) => setFormData({ ...formData, dailyUpdate: e.target.value })} />
                  </div>
                  <div className="field-group span-2">
                    <label>Backup Information & Team Notes</label>
                    <textarea className="field-textarea" placeholder="Backup saved location, team assignee..." value={formData.backupInfo} onChange={(e) => setFormData({ ...formData, backupInfo: e.target.value })} />
                  </div>
                </div>
              </div>
              <div style={{ padding: '1rem 1.4rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save to MongoDB</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {isDetailOpen && activeProject && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 520 }}>
            <div className="modal-title-bar">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{activeProject.clientUsername}</h3>
              <button className="btn-ghost" onClick={() => setIsDetailOpen(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'var(--bg-input)', padding: '0.85rem', borderRadius: 8 }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Gross Amount</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>${activeProject.amount}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Net Profit (80%)</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>${((activeProject.amount || 0) * 0.8).toFixed(2)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Resource Links</span>
                {activeProject.instructionSheet && (
                  <a href={activeProject.instructionSheet} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ justifyContent: 'space-between' }}>
                    <span>Instruction Brief</span> <ExternalLink size={14} />
                  </a>
                )}
                {activeProject.ourSubdomain && (
                  <a href={activeProject.ourSubdomain} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ justifyContent: 'space-between' }}>
                    <span>Staging Subdomain</span> <ExternalLink size={14} />
                  </a>
                )}
                {activeProject.clientDomain && (
                  <a href={activeProject.clientDomain} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ justifyContent: 'space-between' }}>
                    <span>Client Live Domain</span> <ExternalLink size={14} />
                  </a>
                )}
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Daily Update</span>
                <p style={{ fontSize: '0.85rem', background: 'var(--bg-input)', padding: '0.65rem', borderRadius: 6, marginTop: 4 }}>
                  {activeProject.dailyUpdate || 'No updates recorded.'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Backup & Handover Notes</span>
                <p style={{ fontSize: '0.85rem', background: 'var(--bg-input)', padding: '0.65rem', borderRadius: 6, marginTop: 4 }}>
                  {activeProject.backupInfo || 'No backup notes.'}
                </p>
              </div>
            </div>
            <div style={{ padding: '0.85rem 1.4rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-outline" onClick={() => setIsDetailOpen(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => openEditModal(activeProject)}>Edit Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
