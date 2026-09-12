'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  Table as TableIcon,
  Columns,
  Search,
  RotateCcw,
  Download,
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
  Plus,
  Globe,
  Sun,
  Moon,
  Check,
  LayoutDashboard,
  Zap,
  Calendar,
  Briefcase,
  Layers,
  Database,
  Menu,
  Filter
} from 'lucide-react';

export default function VercelDashboard() {
  const { data: session } = useSession();

  const [theme, setTheme] = useState('dark');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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

  // Init Theme
  useEffect(() => {
    const saved = localStorage.getItem('vercel_hub_theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('vercel_hub_theme', nextTheme);
    showToast(`Switched to ${nextTheme} theme`);
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      await fetch('/api/projects/seed', { method: 'POST' });
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
      showToast('Error connecting to MongoDB', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3200);
  };

  // KPIs
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

  // Unique Profiles
  const uniqueProfiles = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.profileName).filter(Boolean))).sort();
  }, [projects]);

  // Counts by profile
  const profileCounts = useMemo(() => {
    const counts = {};
    projects.forEach((p) => {
      if (p.profileName) {
        counts[p.profileName] = (counts[p.profileName] || 0) + 1;
      }
    });
    return counts;
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

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

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
        const res = await fetch(`/api/projects/${activeProject._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setProjects((prev) => prev.map((p) => (p._id === activeProject._id ? data.data : p)));
          showToast(`Updated order for ${payload.clientUsername}`);
        }
      } else {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setProjects((prev) => [data.data, ...prev]);
          showToast(`Created order for ${payload.clientUsername}`);
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
        showToast('Order deleted');
        setIsDetailOpen(false);
      }
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

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
    link.setAttribute('download', `Workplace_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard');
  };

  const runningCount = projects.filter((p) => p.orderStatus === 'Wip' || p.orderStatus === 'Issue' || p.timeSchedule === 'Late').length;

  return (
    <div className="app-layout">
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card-bg)', border: '1px solid var(--border-default)', color: 'var(--geist-foreground)', padding: '0.65rem 1.15rem', borderRadius: 6, fontSize: '0.82rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <Check size={14} color="#10b981" /> {toastMessage.text}
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <aside className={`sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img
              src={theme === 'light' ? '/logo-black.png' : '/logo-white.png'}
              alt="Logo"
              style={{
                width: 24,
                height: 24,
                objectFit: 'contain',
                background: 'transparent'
              }}
            />
          </div>
          <div>
            <div className="sidebar-brand-name">Workplace Hub</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accents-5)' }}>my-work-place</div>
          </div>
        </div>

        {/* Action Button inside Sidebar */}
        <div style={{ padding: '0.85rem 0.85rem 0.25rem 0.85rem' }}>
          <button className="btn-v btn-v-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={openNewModal}>
            <Plus size={14} /> New Order
          </button>
        </div>

        {/* Navigation Content */}
        <div className="sidebar-content">
          {/* Main Navigation */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Views</div>
            <button
              className={`sidebar-nav-item ${currentTab === 'all' && profileFilter === 'all' && statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => {
                setCurrentTab('all');
                setProfileFilter('all');
                setStatusFilter('all');
                setScheduleFilter('all');
              }}
            >
              <div className="sidebar-nav-left">
                <LayoutDashboard size={14} />
                <span>All Orders</span>
              </div>
              <span className="sidebar-count-badge">{projects.length}</span>
            </button>

            <button
              className={`sidebar-nav-item ${currentTab === 'running' ? 'active' : ''}`}
              onClick={() => {
                setCurrentTab('running');
                setProfileFilter('all');
                setStatusFilter('all');
              }}
            >
              <div className="sidebar-nav-left">
                <Zap size={14} color="#38bdf8" />
                <span>Running Orders</span>
              </div>
              <span className="sidebar-count-badge" style={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }}>
                {runningCount}
              </span>
            </button>
          </div>

          {/* Month Section */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Months</div>
            {['April', 'May', 'June'].map((m) => {
              const count = projects.filter((p) => (p.month || '').toLowerCase() === m.toLowerCase()).length;
              return (
                <button
                  key={m}
                  className={`sidebar-nav-item ${currentTab === m ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentTab(m);
                    setProfileFilter('all');
                  }}
                >
                  <div className="sidebar-nav-left">
                    <Calendar size={14} />
                    <span>{m}</span>
                  </div>
                  <span className="sidebar-count-badge">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Marketplace Profiles Section */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Marketplace Profiles</div>
            {uniqueProfiles.map((prof) => (
              <button
                key={prof}
                className={`sidebar-nav-item ${profileFilter === prof ? 'active' : ''}`}
                onClick={() => {
                  setProfileFilter(prof);
                  setCurrentTab('all');
                }}
              >
                <div className="sidebar-nav-left">
                  <Briefcase size={14} />
                  <span style={{ maxWidth: 125, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prof}</span>
                </div>
                <span className="sidebar-count-badge">{profileCounts[prof] || 0}</span>
              </button>
            ))}
          </div>

          {/* Quick Status Filter */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Quick Status</div>
            <button
              className={`sidebar-nav-item ${statusFilter === 'Wip' ? 'active' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'Wip' ? 'all' : 'Wip')}
            >
              <div className="sidebar-nav-left">
                <span className="v-status-dot" style={{ background: '#0284c7' }}></span>
                <span>Work In Progress</span>
              </div>
              <span className="sidebar-count-badge">{kpis.activeWip}</span>
            </button>

            <button
              className={`sidebar-nav-item ${statusFilter === 'Done' ? 'active' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'Done' ? 'all' : 'Done')}
            >
              <div className="sidebar-nav-left">
                <span className="v-status-dot" style={{ background: '#10b981' }}></span>
                <span>Completed</span>
              </div>
              <span className="sidebar-count-badge">{kpis.deliveredDone}</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', color: 'var(--accents-5)' }}>
            <Database size={13} color="#10b981" />
            <span>MongoDB Atlas</span>
          </div>

          <button className="btn-v-icon" style={{ width: 30, height: 30 }} onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}>
            {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-wrapper">
        {/* Top Navbar */}
        <header className="top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Mobile Hamburger */}
            <button className="btn-v-icon" style={{ display: 'none' }} onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
              <Menu size={16} />
            </button>

            <div className="breadcrumb-box">
              <img
                src={theme === 'light' ? '/logo-black.png' : '/logo-white.png'}
                alt="Logo"
                style={{
                  width: 18,
                  height: 18,
                  objectFit: 'contain',
                  background: 'transparent'
                }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Alireja-khan</span>
              <span className="breadcrumb-divider">/</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accents-5)' }}>my-work-place</span>
              <span className="project-pill">Production</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Table / Kanban View Switcher */}
            <div className="segmented-nav">
              <button className={`segmented-item ${currentView === 'table' ? 'active' : ''}`} onClick={() => setCurrentView('table')}>
                <TableIcon size={13} style={{ marginRight: 4 }} /> Table
              </button>
              <button className={`segmented-item ${currentView === 'kanban' ? 'active' : ''}`} onClick={() => setCurrentView('kanban')}>
                <Columns size={13} style={{ marginRight: 4 }} /> Kanban
              </button>
            </div>

            <button className="btn-v btn-v-secondary" onClick={exportCSV} title="Export CSV">
              <Download size={13} /> Export
            </button>

            {/* Auth Session */}
            {session?.user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--input-bg)', padding: '0.3rem 0.6rem', borderRadius: 6, border: '1px solid var(--border-default)' }}>
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name} style={{ width: 20, height: 20, borderRadius: '50%' }} />
                ) : (
                  <Github size={14} />
                )}
                <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>{session.user.name || session.user.email}</span>
                <button className="btn-v-ghost" onClick={() => signOut()} title="Sign Out" style={{ padding: 2, cursor: 'pointer' }}>
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button className="btn-v btn-v-secondary" onClick={() => signIn('github')}>
                <Github size={13} /> Sign In
              </button>
            )}
          </div>
        </header>

        {/* KPI Metrics */}
        <section className="metrics-row">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Total Gross Volume</span>
              <Wallet size={15} color="var(--accents-5)" />
            </div>
            <div className="metric-value">${kpis.totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="metric-footer">
              <span className="metric-badge">{projects.length} Orders</span> Total orders in MongoDB
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Net Revenue (Take-Home 80%)</span>
              <TrendingUp size={15} color="#10b981" />
            </div>
            <div className="metric-value" style={{ color: 'var(--geist-foreground)' }}>
              ${kpis.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="metric-footer">
              <span className="metric-badge green">-20% Fee Deducted</span> 80% Net profit
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Work In Progress</span>
              <Clock size={15} color="#0284c7" />
            </div>
            <div className="metric-value">{kpis.activeWip}</div>
            <div className="metric-footer">
              <span className="metric-badge blue">${kpis.wipVal.toFixed(0)} WIP</span> Active development queue
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Delivery Rate</span>
              <CheckCircle2 size={15} color="#10b981" />
            </div>
            <div className="metric-value">{kpis.rate}%</div>
            <div className="metric-footer">
              <span className="metric-badge green">{kpis.deliveredDone} Delivered</span> Successfully completed
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="control-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div className="v-input-wrapper">
              <input
                type="text"
                className="v-input"
                placeholder="Search orders, clients, subdomains, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select className="v-select" value={profileFilter} onChange={(e) => setProfileFilter(e.target.value)}>
              <option value="all">All Profiles ({uniqueProfiles.length})</option>
              {uniqueProfiles.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select className="v-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="Done">Done</option>
              <option value="Wip">Wip</option>
              <option value="Delivered">Delivered</option>
              <option value="Issue">Issue</option>
              <option value="Cancel">Cancel</option>
            </select>

            <select className="v-select" value={scheduleFilter} onChange={(e) => setScheduleFilter(e.target.value)}>
              <option value="all">All Schedules</option>
              <option value="Complete">Complete</option>
              <option value="Late">Late</option>
              <option value="Repeat Order">Repeat Order</option>
              <option value="Add-on">Add-on</option>
            </select>

            <button
              className="btn-v btn-v-secondary"
              onClick={() => {
                setSearchQuery('');
                setProfileFilter('all');
                setStatusFilter('all');
                setScheduleFilter('all');
                setCurrentTab('all');
              }}
              title="Reset Filters"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </section>

        {/* Content Display: Table or Kanban */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--accents-5)' }}>
            <div style={{ display: 'inline-block', width: 28, height: 28, border: '2px solid var(--border-default)', borderTopColor: 'var(--geist-foreground)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>Loading from MongoDB Atlas...</p>
          </div>
        ) : currentView === 'table' ? (
          /* Table View */
          <div className="v-table-container">
            <table className="v-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort('assignDate')}>Assign Date</th>
                  <th className="sortable" onClick={() => handleSort('clientUsername')}>Client Username</th>
                  <th className="sortable" onClick={() => handleSort('profileName')}>Profile</th>
                  <th>Brief Doc</th>
                  <th className="sortable" onClick={() => handleSort('amount')}>Gross</th>
                  <th>Net (80%)</th>
                  <th>Order Status</th>
                  <th>Staging Subdomain</th>
                  <th className="sortable" onClick={() => handleSort('deadline')}>Deadline</th>
                  <th>Schedule</th>
                  <th>Live Domain</th>
                  <th>Daily Update</th>
                  <th>Review</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={14} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--accents-5)' }}>
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((p) => {
                    const gross = parseFloat(p.amount) || 0;
                    const net = gross * 0.8;
                    const statusClass =
                      p.orderStatus === 'Done'
                        ? 'v-status-done'
                        : p.orderStatus === 'Delivered'
                        ? 'v-status-delivered'
                        : p.orderStatus === 'Issue' || p.orderStatus === 'Cancel'
                        ? 'v-status-issue'
                        : 'v-status-wip';

                    return (
                      <tr key={p._id}>
                        <td className="mono-text" style={{ color: 'var(--accents-5)' }}>{p.assignDate || '-'}</td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{p.clientUsername}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.75rem', color: 'var(--accents-5)' }}>{p.profileName}</span>
                        </td>
                        <td>
                          {p.instructionSheet ? (
                            <a href={p.instructionSheet} target="_blank" rel="noreferrer" className="btn-v btn-v-secondary" style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}>
                              <ExternalLink size={11} /> Brief
                            </a>
                          ) : '-'}
                        </td>
                        <td className="mono-text" style={{ fontWeight: 600 }}>${gross.toFixed(2)}</td>
                        <td className="mono-text" style={{ color: '#10b981', fontWeight: 600 }}>${net.toFixed(2)}</td>
                        <td>
                          <div className={`v-status-badge ${statusClass}`}>
                            <span className="v-status-dot"></span>
                            <select
                              style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.73rem', fontWeight: 600 }}
                              value={p.orderStatus || 'Wip'}
                              onChange={(e) => handleQuickStatusChange(p._id, e.target.value)}
                            >
                              <option value="Done">Done</option>
                              <option value="Wip">Wip</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Issue">Issue</option>
                              <option value="Cancel">Cancel</option>
                            </select>
                          </div>
                        </td>
                        <td>
                          {p.ourSubdomain ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <a href={p.ourSubdomain} target="_blank" rel="noreferrer" className="btn-v btn-v-secondary" style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}>
                                <Globe size={11} /> Staging
                              </a>
                              <button className="btn-v-ghost" style={{ padding: 2, cursor: 'pointer' }} onClick={() => copyToClipboard(p.ourSubdomain)} title="Copy URL">
                                <Copy size={11} />
                              </button>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="mono-text" style={{ color: p.timeSchedule === 'Late' ? '#ee0000' : 'var(--accents-5)' }}>
                          {p.deadline || '-'}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.75rem', color: p.timeSchedule === 'Late' ? '#f5a623' : 'var(--accents-5)' }}>
                            {p.timeSchedule || 'Complete'}
                          </span>
                        </td>
                        <td>
                          {p.clientDomain ? (
                            <a href={p.clientDomain} target="_blank" rel="noreferrer" className="btn-v btn-v-secondary" style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}>
                              <ExternalLink size={11} /> Live
                            </a>
                          ) : '-'}
                        </td>
                        <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--accents-5)' }} title={p.dailyUpdate}>
                          {p.dailyUpdate || '-'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 2, color: '#f5a623' }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={11} fill={s <= (p.review || 0) ? '#f5a623' : 'none'} color={s <= (p.review || 0) ? '#f5a623' : 'var(--border-default)'} />
                            ))}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            <button className="btn-v-ghost" style={{ padding: 3 }} onClick={() => { setActiveProject(p); setIsDetailOpen(true); }} title="View">
                              <Eye size={13} />
                            </button>
                            <button className="btn-v-ghost" style={{ padding: 3 }} onClick={() => openEditModal(p)} title="Edit">
                              <Edit2 size={13} />
                            </button>
                            <button className="btn-v-ghost" style={{ padding: 3, color: '#ee0000' }} onClick={() => handleDelete(p._id, p.clientUsername)} title="Delete">
                              <Trash2 size={13} />
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
          /* Kanban View */
          <div className="v-kanban-board">
            {['Assigned', 'Wip', 'Issue', 'Delivered', 'Done'].map((colStatus) => {
              const colItems = filteredProjects.filter((p) => (p.orderStatus || 'Assigned') === colStatus);
              return (
                <div
                  key={colStatus}
                  className="v-kanban-col"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const pId = e.dataTransfer.getData('text/plain');
                    if (pId) handleQuickStatusChange(pId, colStatus);
                  }}
                >
                  <div className="v-kanban-header">
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {colStatus === 'Wip' ? 'In Progress' : colStatus}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accents-5)', background: 'var(--accents-1)', padding: '0.1rem 0.4rem', borderRadius: 4, border: '1px solid var(--border-default)' }}>
                      {colItems.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {colItems.map((p) => (
                      <div
                        key={p._id}
                        className="v-kanban-card"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', p._id)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.clientUsername}</span>
                          <span className="mono-text" style={{ color: '#10b981', fontWeight: 600 }}>
                            ${((p.amount || 0) * 0.8).toFixed(0)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--accents-5)' }}>
                          <span>{p.profileName}</span>
                          <span className="mono-text">Gross: ${p.amount}</span>
                        </div>

                        {p.dailyUpdate && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--accents-6)', background: 'var(--accents-1)', padding: '0.4rem 0.5rem', borderRadius: 4, borderLeft: '2px solid var(--border-highlight)' }}>
                            {p.dailyUpdate}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem' }}>
                          <span style={{ color: p.timeSchedule === 'Late' ? '#ee0000' : 'var(--accents-5)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={11} /> {p.deadline || 'No deadline'}
                          </span>
                          <button className="btn-v-ghost" style={{ padding: 2 }} onClick={() => openEditModal(p)}>
                            <Edit2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Add/Edit Order */}
        {isModalOpen && (
          <div className="v-modal-overlay">
            <div className="v-modal-dialog">
              <div className="v-modal-header">
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                  {activeProject ? `Edit Order: ${activeProject.clientUsername}` : 'Create New Order'}
                </span>
                <button className="btn-v-ghost" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="v-modal-body">
                  <div className="v-form-grid">
                    <div className="v-form-group">
                      <label>Assign Date *</label>
                      <input type="date" className="v-input" value={formData.assignDate} onChange={(e) => setFormData({ ...formData, assignDate: e.target.value })} required />
                    </div>
                    <div className="v-form-group">
                      <label>Month Tab</label>
                      <select className="v-select" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })}>
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
                    <div className="v-form-group">
                      <label>Client Username *</label>
                      <input type="text" className="v-input" placeholder="e.g. mharris4463" value={formData.clientUsername} onChange={(e) => setFormData({ ...formData, clientUsername: e.target.value })} required />
                    </div>
                    <div className="v-form-group">
                      <label>Profile Name *</label>
                      <input type="text" className="v-input" placeholder="e.g. LeadsBridge, WpStellar" value={formData.profileName} onChange={(e) => setFormData({ ...formData, profileName: e.target.value })} required />
                    </div>
                    <div className="v-form-group">
                      <label>Gross Amount ($) *</label>
                      <input type="number" className="v-input" placeholder="e.g. 200" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                    </div>
                    <div className="v-form-group">
                      <label>Net Take-Home (80%)</label>
                      <div className="mono-text" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-default)', padding: '0.5rem 0.85rem', borderRadius: 5, color: '#10b981', fontWeight: 600 }}>
                        ${((parseFloat(formData.amount) || 0) * 0.8).toFixed(2)}
                      </div>
                    </div>
                    <div className="v-form-group">
                      <label>Order Status</label>
                      <select className="v-select" value={formData.orderStatus} onChange={(e) => setFormData({ ...formData, orderStatus: e.target.value })}>
                        <option value="Wip">Wip</option>
                        <option value="Done">Done</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Issue">Issue</option>
                        <option value="Cancel">Cancel</option>
                      </select>
                    </div>
                    <div className="v-form-group">
                      <label>Time Schedule</label>
                      <select className="v-select" value={formData.timeSchedule} onChange={(e) => setFormData({ ...formData, timeSchedule: e.target.value })}>
                        <option value="Complete">Complete</option>
                        <option value="Late">Late</option>
                        <option value="Need domain">Need domain</option>
                        <option value="Repeat Order">Repeat Order</option>
                        <option value="Add-on">Add-on</option>
                      </select>
                    </div>
                    <div className="v-form-group">
                      <label>Deadline Date</label>
                      <input type="date" className="v-input" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
                    </div>
                    <div className="v-form-group">
                      <label>Marketplace Status</label>
                      <select className="v-select" value={formData.marketplaceStatus} onChange={(e) => setFormData({ ...formData, marketplaceStatus: e.target.value })}>
                        <option value="Delivered">Delivered</option>
                        <option value="Wip">Wip</option>
                        <option value="Cancel">Cancel</option>
                      </select>
                    </div>
                    <div className="v-form-group full">
                      <label>Instruction Sheet / Brief URL</label>
                      <input type="url" className="v-input" placeholder="https://docs.google.com/..." value={formData.instructionSheet} onChange={(e) => setFormData({ ...formData, instructionSheet: e.target.value })} />
                    </div>
                    <div className="v-form-group full">
                      <label>Our Staging Subdomain</label>
                      <input type="url" className="v-input" placeholder="https://client.wpcoreweb.com/" value={formData.ourSubdomain} onChange={(e) => setFormData({ ...formData, ourSubdomain: e.target.value })} />
                    </div>
                    <div className="v-form-group full">
                      <label>Client Live Domain</label>
                      <input type="url" className="v-input" placeholder="https://clientdomain.com/" value={formData.clientDomain} onChange={(e) => setFormData({ ...formData, clientDomain: e.target.value })} />
                    </div>
                    <div className="v-form-group full">
                      <label>Daily Update Note</label>
                      <input type="text" className="v-input" placeholder="Current progress or solved revisions..." value={formData.dailyUpdate} onChange={(e) => setFormData({ ...formData, dailyUpdate: e.target.value })} />
                    </div>
                    <div className="v-form-group full">
                      <label>Backup & Developer Notes</label>
                      <textarea className="v-input" style={{ resize: 'vertical', minHeight: 60 }} placeholder="Backup location, assigned dev..." value={formData.backupInfo} onChange={(e) => setFormData({ ...formData, backupInfo: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="v-modal-footer">
                  <button type="button" className="btn-v btn-v-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-v btn-v-primary">Save to MongoDB</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Details */}
        {isDetailOpen && activeProject && (
          <div className="v-modal-overlay">
            <div className="v-modal-dialog" style={{ maxWidth: 520 }}>
              <div className="v-modal-header">
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{activeProject.clientUsername}</span>
                <button className="btn-v-ghost" onClick={() => setIsDetailOpen(false)}><X size={16} /></button>
              </div>
              <div className="v-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'var(--input-bg)', padding: '0.85rem', borderRadius: 6, border: '1px solid var(--border-default)' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)' }}>Gross Amount</span>
                    <div className="mono-text" style={{ fontSize: '1.1rem', fontWeight: 700 }}>${activeProject.amount}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)' }}>Net Take-Home (80%)</span>
                    <div className="mono-text" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>${((activeProject.amount || 0) * 0.8).toFixed(2)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--accents-5)' }}>Resource Links</span>
                  {activeProject.instructionSheet && (
                    <a href={activeProject.instructionSheet} target="_blank" rel="noreferrer" className="btn-v btn-v-secondary" style={{ justifyContent: 'space-between' }}>
                      <span>Instruction Brief</span> <ExternalLink size={13} />
                    </a>
                  )}
                  {activeProject.ourSubdomain && (
                    <a href={activeProject.ourSubdomain} target="_blank" rel="noreferrer" className="btn-v btn-v-secondary" style={{ justifyContent: 'space-between' }}>
                      <span>Staging Subdomain</span> <ExternalLink size={13} />
                    </a>
                  )}
                  {activeProject.clientDomain && (
                    <a href={activeProject.clientDomain} target="_blank" rel="noreferrer" className="btn-v btn-v-secondary" style={{ justifyContent: 'space-between' }}>
                      <span>Client Live Domain</span> <ExternalLink size={13} />
                    </a>
                  )}
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--accents-5)' }}>Daily Update</span>
                  <p style={{ fontSize: '0.82rem', background: 'var(--input-bg)', padding: '0.65rem', borderRadius: 6, border: '1px solid var(--border-default)', marginTop: 4 }}>
                    {activeProject.dailyUpdate || 'No updates recorded.'}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--accents-5)' }}>Backup & Notes</span>
                  <p style={{ fontSize: '0.82rem', background: 'var(--input-bg)', padding: '0.65rem', borderRadius: 6, border: '1px solid var(--border-default)', marginTop: 4 }}>
                    {activeProject.backupInfo || 'No backup notes.'}
                  </p>
                </div>
              </div>
              <div className="v-modal-footer">
                <button className="btn-v btn-v-secondary" onClick={() => setIsDetailOpen(false)}>Close</button>
                <button className="btn-v btn-v-primary" onClick={() => openEditModal(activeProject)}>Edit Order</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
