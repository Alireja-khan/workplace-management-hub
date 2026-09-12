'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Filter,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  BarChart3,
  PieChart,
  DollarSign,
  Activity,
  ArrowUpRight,
  Users,
  Percent,
  Terminal,
  Code2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const MONTH_LIST = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function VercelDashboard() {
  const { data: session } = useSession();
  const tableContainerRef = useRef(null);

  const currentCalendarMonth = useMemo(() => {
    return MONTH_LIST[new Date().getMonth()];
  }, []);

  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [monthsExpanded, setMonthsExpanded] = useState(false);
  const [profilesExpanded, setProfilesExpanded] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(() => MONTH_LIST[new Date().getMonth()]);
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
  const [savingStatusId, setSavingStatusId] = useState(null);
  const [savedStatusSuccessId, setSavedStatusSuccessId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    assignDate: new Date().toISOString().split('T')[0],
    month: MONTH_LIST[new Date().getMonth()],
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

  // Sync on Mount
  useEffect(() => {
    setMounted(true);
    const current = document.documentElement.getAttribute('data-theme') || localStorage.getItem('vercel_hub_theme') || 'dark';
    setTheme(current);
  }, []);

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('vercel_hub_theme', nextTheme);
    setTheme(nextTheme);
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
    const avgOrderValue = projects.length > 0 ? totalGross / projects.length : 0;
    const platformFee = totalGross * 0.2;

    return { totalGross, netAmount, platformFee, activeWip, wipVal, deliveredDone, rate, avgOrderValue };
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

  // Detailed Profile Stats for Analytics Page
  const profileStats = useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      const name = p.profileName || 'Other';
      if (!map[name]) {
        map[name] = { name, count: 0, gross: 0, net: 0 };
      }
      const gross = parseFloat(p.amount) || 0;
      map[name].count += 1;
      map[name].gross += gross;
      map[name].net += gross * 0.8;
    });
    return Object.values(map).sort((a, b) => b.gross - a.gross);
  }, [projects]);

  // Dynamic available months list
  const availableMonths = useMemo(() => {
    const set = new Set(projects.map((p) => p.month).filter(Boolean));
    set.add(currentCalendarMonth);
    return Array.from(set).sort((a, b) => MONTH_LIST.indexOf(a) - MONTH_LIST.indexOf(b));
  }, [projects, currentCalendarMonth]);

  // Detailed Monthly Performance Stats
  const monthStats = useMemo(() => {
    return availableMonths.map((m) => {
      const mProjects = projects.filter((p) => (p.month || '').toLowerCase() === m.toLowerCase());
      const gross = mProjects.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      const net = gross * 0.8;
      const completed = mProjects.filter((p) => (p.orderStatus || '').toLowerCase() === 'done' || (p.orderStatus || '').toLowerCase() === 'delivered').length;
      return { month: m, count: mProjects.length, gross, net, completed };
    });
  }, [projects, availableMonths]);

  // Status Distribution
  const statusStats = useMemo(() => {
    const counts = { Done: 0, Wip: 0, Delivered: 0, Issue: 0, Cancel: 0 };
    projects.forEach((p) => {
      const s = p.orderStatus || 'Wip';
      if (counts[s] !== undefined) counts[s]++;
      else counts['Wip']++;
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
    const prevProject = projects.find((p) => p._id === projectId);
    const prevStatus = prevProject ? prevProject.orderStatus : 'Wip';

    // Optimistic UI update
    setProjects((prev) =>
      prev.map((p) => (p._id === projectId ? { ...p, orderStatus: newStatus } : p))
    );
    setSavingStatusId(projectId);

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
        setSavingStatusId(null);
        setSavedStatusSuccessId(projectId);
        showToast(`Status updated to ${newStatus}`);
        setTimeout(() => setSavedStatusSuccessId(null), 1800);
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (e) {
      // Rollback
      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? { ...p, orderStatus: prevStatus } : p))
      );
      setSavingStatusId(null);
      showToast('Failed to update status', 'error');
    }
  };

  const openNewModal = (overrideMonth = null) => {
    const defaultMonth = overrideMonth || (currentTab !== 'all' && currentTab !== 'running' && currentTab !== 'stats' ? currentTab : currentCalendarMonth);
    setActiveProject(null);
    setFormData({
      assignDate: new Date().toISOString().split('T')[0],
      month: defaultMonth,
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

  const scrollTable = (direction) => {
    if (tableContainerRef.current) {
      const offset = direction === 'left' ? -350 : 350;
      tableContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
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
              src="/logo-black.png"
              alt="Logo"
              className="brand-logo-light"
              style={{ width: 24, height: 24, objectFit: 'contain' }}
            />
            <img
              src="/logo-white.png"
              alt="Logo"
              className="brand-logo-dark"
              style={{ width: 24, height: 24, objectFit: 'contain' }}
            />
          </div>
          <div>
            <div className="sidebar-brand-name">Workplace Hub</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accents-5)' }}>my-work-place</div>
          </div>
        </div>

        {/* Action Button inside Sidebar with comfortable eye contrast */}
        <div style={{ padding: '0.85rem 0.85rem 0.25rem 0.85rem' }}>
          <button className="sidebar-new-order-btn" onClick={openNewModal}>
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

            <button
              className={`sidebar-nav-item ${currentTab === 'stats' ? 'active' : ''}`}
              onClick={() => {
                setCurrentTab('stats');
                setProfileFilter('all');
                setStatusFilter('all');
              }}
            >
              <div className="sidebar-nav-left">
                <BarChart3 size={14} color="#10b981" />
                <span>Stats & Analytics</span>
              </div>
              <span className="sidebar-count-badge" style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>
                Live
              </span>
            </button>
          </div>

          {/* Month Section with Arrow Toggle (2 visible by default) */}
          <div className="sidebar-section">
            <div className="sidebar-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Months</span>
              <button
                className="sidebar-expand-btn"
                onClick={() => setMonthsExpanded(!monthsExpanded)}
                title={monthsExpanded ? "Show less" : `Show all months (${availableMonths.length})`}
              >
                <ChevronDown size={14} style={{ transform: monthsExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </button>
            </div>
            {(monthsExpanded ? availableMonths : availableMonths.slice(0, 2)).map((m) => {
              const count = projects.filter((p) => (p.month || '').toLowerCase() === m.toLowerCase()).length;
              return (
                <button
                  key={m}
                  className={`sidebar-nav-item ${currentTab.toLowerCase() === m.toLowerCase() ? 'active' : ''}`}
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

          {/* Marketplace Profiles Section with Arrow Toggle (2 visible by default) */}
          <div className="sidebar-section">
            <div className="sidebar-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Marketplace Profiles</span>
              <button
                className="sidebar-expand-btn"
                onClick={() => setProfilesExpanded(!profilesExpanded)}
                title={profilesExpanded ? "Show less" : `Show all profiles (${uniqueProfiles.length})`}
              >
                <ChevronDown size={14} style={{ transform: profilesExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </button>
            </div>
            {(profilesExpanded ? uniqueProfiles : uniqueProfiles.slice(0, 2)).map((prof) => (
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

        {/* Sidebar Footer (Clean without database branding) */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', color: 'var(--accents-5)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            <span>Connected</span>
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
                src="/logo-black.png"
                alt="Logo"
                className="brand-logo-light"
                style={{ width: 18, height: 18, objectFit: 'contain' }}
              />
              <img
                src="/logo-white.png"
                alt="Logo"
                className="brand-logo-dark"
                style={{ width: 18, height: 18, objectFit: 'contain' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Alireja-khan</span>
              <span className="breadcrumb-divider">/</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accents-5)' }}>my-work-place</span>
              <span className="project-pill">{currentTab === 'stats' ? 'Analytics' : 'Production'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* View Switcher: Table / Kanban / Stats */}
            <div className="segmented-nav">
              <button
                className={`segmented-item ${currentTab !== 'stats' && currentView === 'table' ? 'active' : ''}`}
                onClick={() => {
                  if (currentTab === 'stats') setCurrentTab('all');
                  setCurrentView('table');
                }}
              >
                <TableIcon size={13} style={{ marginRight: 4 }} /> Table
              </button>
              <button
                className={`segmented-item ${currentTab !== 'stats' && currentView === 'kanban' ? 'active' : ''}`}
                onClick={() => {
                  if (currentTab === 'stats') setCurrentTab('all');
                  setCurrentView('kanban');
                }}
              >
                <Columns size={13} style={{ marginRight: 4 }} /> Kanban
              </button>
              <button
                className={`segmented-item ${currentTab === 'stats' ? 'active' : ''}`}
                onClick={() => setCurrentTab('stats')}
              >
                <BarChart3 size={13} style={{ marginRight: 4 }} /> Analytics
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

        {/* Dynamic Main View: Skeleton Loading OR Stats & Analytics OR Orders (Table / Kanban) */}
        {loading ? (
          currentTab === 'stats' ? (
            /* Stats & Analytics Skeleton */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <section className="metrics-row">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="metric-card" style={{ gap: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="skeleton-shimmer" style={{ width: 100, height: 12 }} />
                      <div className="skeleton-shimmer" style={{ width: 16, height: 16, borderRadius: '50%' }} />
                    </div>
                    <div className="skeleton-shimmer" style={{ width: 130, height: 28 }} />
                    <div className="skeleton-shimmer" style={{ width: 160, height: 14 }} />
                  </div>
                ))}
              </section>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="skeleton-shimmer" style={{ width: 90, height: 10 }} />
                    <div className="skeleton-shimmer" style={{ width: 110, height: 20 }} />
                  </div>
                ))}
              </div>

              <div className="analytics-grid">
                {[1, 2].map((i) => (
                  <div key={i} className="analytics-card" style={{ gap: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div className="skeleton-shimmer" style={{ width: 180, height: 16 }} />
                      <div className="skeleton-shimmer" style={{ width: 80, height: 12 }} />
                    </div>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <div key={r} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div className="skeleton-shimmer" style={{ width: 120, height: 12 }} />
                          <div className="skeleton-shimmer" style={{ width: 90, height: 12 }} />
                        </div>
                        <div className="skeleton-shimmer" style={{ width: '100%', height: 6 }} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Table Skeleton View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <section className="control-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <div className="skeleton-shimmer" style={{ flex: 1, minWidth: 240, height: 36 }} />
                  <div className="skeleton-shimmer" style={{ width: 140, height: 36 }} />
                  <div className="skeleton-shimmer" style={{ width: 120, height: 36 }} />
                  <div className="skeleton-shimmer" style={{ width: 120, height: 36 }} />
                  <div className="skeleton-shimmer" style={{ width: 80, height: 36 }} />
                </div>
              </section>

              <div className="table-smart-wrapper">
                <div className="table-sub-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div className="skeleton-shimmer" style={{ width: 90, height: 18, borderRadius: 999 }} />
                    <span style={{ fontSize: '0.74rem', color: 'var(--accents-5)' }}>
                      Syncing database orders & records...
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div className="skeleton-shimmer" style={{ width: 55, height: 22, borderRadius: 4 }} />
                    <div className="skeleton-shimmer" style={{ width: 55, height: 22, borderRadius: 4 }} />
                  </div>
                </div>

                <div className="v-table-container">
                  <table className="v-table">
                    <thead>
                      <tr>
                        <th>Assign Date</th>
                        <th>Client Username</th>
                        <th>Profile</th>
                        <th>Brief Doc</th>
                        <th>Gross</th>
                        <th>Net (80%)</th>
                        <th>Order Status</th>
                        <th>Staging Subdomain</th>
                        <th>Deadline</th>
                        <th>Schedule</th>
                        <th>Live Domain</th>
                        <th>Daily Update</th>
                        <th>Review</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                        <tr key={row} className="skeleton-row">
                          <td><div className="skeleton-shimmer" style={{ width: 75, height: 12 }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: 110, height: 14 }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: 85, height: 12 }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: 48, height: 20, borderRadius: 4 }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: 55, height: 14 }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: 55, height: 14 }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: 70, height: 20, borderRadius: 999 }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: 65, height: 20, borderRadius: 4 }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: 75, height: 12 }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: 60, height: 12 }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: 48, height: 20, borderRadius: 4 }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: 130, height: 12 }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: 65, height: 12 }} /></td>
                          <td style={{ textAlign: 'center' }}><div className="skeleton-shimmer" style={{ width: 55, height: 18, borderRadius: 4 }} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        ) : currentTab === 'stats' ? (
          /* Dedicated Stats & Analytics Page */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Primary KPI Cards */}
            <section className="metrics-row">
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-title">Total Gross Volume</span>
                  <Wallet size={15} color="var(--accents-5)" />
                </div>
                <div className="metric-value">${kpis.totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div className="metric-footer">
                  <span className="metric-badge">{projects.length} Total Orders</span> Across all profiles
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
                  <span className="metric-badge green">-20% Fee (${kpis.platformFee.toFixed(2)})</span> 80% Net profit
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-title">Work In Progress</span>
                  <Clock size={15} color="#0284c7" />
                </div>
                <div className="metric-value">{kpis.activeWip}</div>
                <div className="metric-footer">
                  <span className="metric-badge blue">${kpis.wipVal.toFixed(0)} In Queue</span> Active development
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-title">Delivery Success Rate</span>
                  <CheckCircle2 size={15} color="#10b981" />
                </div>
                <div className="metric-value">{kpis.rate}%</div>
                <div className="metric-footer">
                  <span className="metric-badge green">{kpis.deliveredDone} Delivered</span> Successfully completed
                </div>
              </div>
            </section>

            {/* Secondary KPIs Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '0.85rem 1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)', textTransform: 'uppercase', fontWeight: 600 }}>Average Order Value</span>
                <div className="mono-text" style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 4 }}>
                  ${kpis.avgOrderValue.toFixed(2)}
                </div>
              </div>

              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '0.85rem 1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)', textTransform: 'uppercase', fontWeight: 600 }}>Marketplace Profiles</span>
                <div className="mono-text" style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 4 }}>
                  {uniqueProfiles.length} Profiles
                </div>
              </div>

              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '0.85rem 1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)', textTransform: 'uppercase', fontWeight: 600 }}>Total Completed / Done</span>
                <div className="mono-text" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981', marginTop: 4 }}>
                  {kpis.deliveredDone} Orders
                </div>
              </div>

              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '0.85rem 1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)', textTransform: 'uppercase', fontWeight: 600 }}>5-Star Reviews</span>
                <div className="mono-text" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f5a623', marginTop: 4 }}>
                  {projects.filter((p) => (p.review || 0) === 5).length} / {projects.length}
                </div>
              </div>
            </div>

            {/* Analytics Breakdown Grid */}
            <div className="analytics-grid">
              {/* Profile Revenue Performance Breakdown */}
              <div className="analytics-card">
                <div className="analytics-header">
                  <span className="analytics-title">
                    <Briefcase size={16} /> Revenue by Marketplace Profile
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accents-5)' }}>Gross & Net</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {profileStats.map((prof) => {
                    const percent = kpis.totalGross > 0 ? (prof.gross / kpis.totalGross) * 100 : 0;
                    return (
                      <div key={prof.name} className="breakdown-row">
                        <div className="breakdown-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600 }}>{prof.name}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)' }}>({prof.count} orders)</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className="mono-text" style={{ fontWeight: 600 }}>${prof.gross.toFixed(2)}</span>
                            <span className="mono-text" style={{ color: '#10b981', fontSize: '0.74rem' }}>Net: ${prof.net.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill green" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Volume Breakdown */}
              <div className="analytics-card">
                <div className="analytics-header">
                  <span className="analytics-title">
                    <Calendar size={16} /> Monthly Performance Breakdown
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accents-5)' }}>Revenue / Orders</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {monthStats.map((m) => {
                    const percent = kpis.totalGross > 0 ? (m.gross / kpis.totalGross) * 100 : 0;
                    return (
                      <div key={m.month} className="breakdown-row">
                        <div className="breakdown-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600 }}>{m.month}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)' }}>
                              ({m.count} orders • {m.completed} completed)
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className="mono-text" style={{ fontWeight: 600 }}>${m.gross.toFixed(2)}</span>
                            <span className="mono-text" style={{ color: '#10b981', fontSize: '0.74rem' }}>Net: ${m.net.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill blue" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Status Distribution Summary */}
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accents-5)', textTransform: 'uppercase' }}>
                    Order Status Distribution
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.5rem' }}>
                    {Object.entries(statusStats).map(([status, count]) => (
                      <div key={status} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-default)', padding: '0.25rem 0.55rem', borderRadius: 4, fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontWeight: 500 }}>{status}:</span>
                        <span className="mono-text" style={{ fontWeight: 700 }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Table / Kanban View (Clean without top KPI cards) */
          <>
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
        {currentView === 'table' ? (
          /* Table View with Sticky Header & Subtle Scroll Controls */
          <div className="table-smart-wrapper">
            <div className="table-sub-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className="table-nav-pill">
                  <SlidersHorizontal size={12} /> {currentTab === 'all' ? 'All Orders' : currentTab === 'running' ? 'Running Orders' : `${currentTab} Orders`}: {filteredProjects.length} Records
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--accents-5)' }}>
                  Scroll down to view orders • Table header stays pinned
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--accents-4)', marginRight: 4 }}>
                  Columns:
                </span>
                <button
                  type="button"
                  className="btn-v btn-v-secondary"
                  style={{ padding: '0.22rem 0.6rem', fontSize: '0.72rem', gap: 4 }}
                  onClick={() => scrollTable('left')}
                  title="Scroll Left"
                >
                  <ChevronLeft size={13} /> Left
                </button>
                <button
                  type="button"
                  className="btn-v btn-v-secondary"
                  style={{ padding: '0.22rem 0.6rem', fontSize: '0.72rem', gap: 4 }}
                  onClick={() => scrollTable('right')}
                  title="Scroll Right"
                >
                  Right <ChevronRight size={13} />
                </button>
              </div>
            </div>

            <div className="v-table-container" ref={tableContainerRef}>
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
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--foreground)' }}>
                            {currentTab === 'all'
                              ? 'No orders found matching your filters.'
                              : `No orders recorded for ${currentTab} yet.`}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--accents-4)' }}>
                            {currentTab !== 'all' ? (
                              <>
                                View <button type="button" onClick={() => setCurrentTab('all')} style={{ color: 'var(--foreground)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>All Orders</button> or click <button type="button" onClick={() => openNewModal(currentTab)} style={{ color: '#38bdf8', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>+ New Order</button> to add one for {currentTab}.
                              </>
                            ) : (
                              'Try clearing filters or search terms.'
                            )}
                          </span>
                        </div>
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
                            <div className={`v-status-badge ${statusClass} ${savingStatusId === p._id ? 'saving' : ''}`}>
                              {savingStatusId === p._id ? (
                                <div className="status-saving-spinner"></div>
                              ) : savedStatusSuccessId === p._id ? (
                                <Check size={11} color="#10b981" />
                              ) : (
                                <span className="v-status-dot"></span>
                              )}
                              <select
                                disabled={savingStatusId === p._id}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'inherit',
                                  outline: 'none',
                                  cursor: savingStatusId === p._id ? 'wait' : 'pointer',
                                  fontFamily: 'inherit',
                                  fontSize: '0.73rem',
                                  fontWeight: 600,
                                }}
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
      </>
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
