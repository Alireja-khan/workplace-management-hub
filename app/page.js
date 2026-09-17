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
  EyeOff,
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
  ChevronUp,
  LogIn,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { MONTH_LIST, getMonthFromDate } from '@/lib/dateUtils';
import { ensureValidUrl, parsePersonalSheetText, extractUrlFromHtmlOrText } from '@/lib/sheetParser';
import LandingPage from '@/components/LandingPage';
import TeamWorkspaceView from '@/components/TeamWorkspaceView';
import TeamOrderModal from '@/components/TeamOrderModal';
import AdminUsersView from '@/components/AdminUsersView';

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.45 7.35 24 12 24Z" />
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15Z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.29 2.55 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
  </svg>
);

function getEffectiveCurrentStatus(p) {
  const rawStatus = p?.currentStatus || 'All Sorted';
  if (rawStatus === 'Solved' && p?.solvedAt) {
    const solvedTime = new Date(p.solvedAt).getTime();
    if (!isNaN(solvedTime)) {
      const twoDaysInMs = 48 * 60 * 60 * 1000;
      if (Date.now() - solvedTime >= twoDaysInMs) {
        return 'All Sorted';
      }
    }
  }
  return rawStatus;
}

export default function VercelDashboard() {
  const { data: session, status } = useSession();
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
  const [currentTab, setCurrentTab] = useState('running');
  const [currentView, setCurrentView] = useState('table'); // 'table' or 'kanban'
  const [searchQuery, setSearchQuery] = useState('');
  const [profileFilter, setProfileFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentStatusFilter, setCurrentStatusFilter] = useState('all');
  const [scheduleFilter, setScheduleFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'assignDate', direction: 'desc' });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [savingStatusId, setSavingStatusId] = useState(null);
  const [savedStatusSuccessId, setSavedStatusSuccessId] = useState(null);
  const [savingCStatusId, setSavingCStatusId] = useState(null);
  const [savedCStatusSuccessId, setSavedCStatusSuccessId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('signin'); // 'signin' or 'signup'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showAuthPassword, setShowAuthPassword] = useState(false);

  // Workspace Mode: 'personal' (my-work-place) | 'team' (EleSquad SMT 2025-2026)
  const [workspaceMode, setWorkspaceMode] = useState('personal');
  const [teamProjects, setTeamProjects] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [teamStatusFilter, setTeamStatusFilter] = useState('all');
  const [teamMemberFilter, setTeamMemberFilter] = useState('all');
  const [teamSalesFilter, setTeamSalesFilter] = useState('all');
  const [teamMonthFilter, setTeamMonthFilter] = useState('all');
  const [teamViewMode, setTeamViewMode] = useState('table');
  const [teamMembersExpanded, setTeamMembersExpanded] = useState(true);

  // Team Modal States
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [activeTeamProject, setActiveTeamProject] = useState(null);
  const [teamIsSubmitting, setTeamIsSubmitting] = useState(false);
  
  // Bulk Delete States
  const [selectedTeamOrders, setSelectedTeamOrders] = useState([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [bulkDeleteConfirmText, setBulkDeleteConfirmText] = useState('');
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Issue Note Modal States
  const [isIssueNoteModalOpen, setIsIssueNoteModalOpen] = useState(false);
  const [issueNoteProject, setIssueNoteProject] = useState(null);
  const [issueNoteText, setIssueNoteText] = useState('');
  const [issueNoteStatus, setIssueNoteStatus] = useState('Issue');
  const [isIssueNoteSaving, setIsIssueNoteSaving] = useState(false);

  const [teamFormData, setTeamFormData] = useState({
    salesPerson: 'Shuvo',
    assignDate: new Date().toISOString().split('T')[0],
    month: MONTH_LIST[new Date().getMonth()],
    profileName: '',
    clientUserId: '',
    orderNumber: '',
    amount: '',
    assignedMembers: ['Alireja'],
    estimatedDeliveryDate: '',
    deliveryDate: '',
    remark: '',
    orderStatus: 'Wip',
    sheetLink: '',
    teamName: 'EleSquad',
    percentage: '',
    note: '',
    timeSchedule: 'Fresh Query',
  });

  // Smart Quick Auto-Fill States for Personal Modal
  const [personalRawText, setPersonalRawText] = useState('');
  const [personalPasteSuccess, setPersonalPasteSuccess] = useState(false);

  const handlePersonalQuickPaste = (textToParse, overrideUrl = '') => {
    const parsed = parsePersonalSheetText(textToParse, overrideUrl);
    if (parsed) {
      setFormData((prev) => ({
        ...prev,
        ...parsed,
      }));
      setPersonalPasteSuccess(true);
      setTimeout(() => setPersonalPasteSuccess(false), 3500);
    }
  };

  const handlePersonalTextareaPaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const htmlData = clipboardData.getData('text/html') || '';
    const textData = clipboardData.getData('text/plain') || '';
    
    setPersonalRawText(textData);

    const extractedUrl = extractUrlFromHtmlOrText(htmlData, textData);
    handlePersonalQuickPaste(textData, extractedUrl);
  };

  // Form State
  const [formData, setFormData] = useState({
    assignDate: new Date().toISOString().split('T')[0],
    month: MONTH_LIST[new Date().getMonth()],
    salesPerson: '',
    clientUsername: '',
    orderNumber: '',
    profileName: '',
    instructionSheet: '',
    amount: '',
    orderStatus: 'Wip',
    currentStatus: 'All Sorted',
    estimatedDeliveryDate: '',
    deliveryDate: '',
    remark: '',
    percentage: '',
    ourSubdomain: '',
    deadline: '',
    timeSchedule: 'Fresh Query',
    clientDomain: '',
    marketplaceStatus: 'Delivered',
    dailyUpdate: '',
    futurePlan: '',
    review: 5,
    backupInfo: '',
    notes: '',
  });

  // Sync on Mount & Handle Auth Errors from URL
  useEffect(() => {
    setMounted(true);
    const current = document.documentElement.getAttribute('data-theme') || localStorage.getItem('vercel_hub_theme') || 'dark';
    setTheme(current);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error');
      if (errorParam) {
        setIsAuthModalOpen(true);
        if (errorParam === 'OAuthSignin' || errorParam === 'OAuthCallback') {
          setAuthError('Google sign-in is not configured on this server yet (GOOGLE_CLIENT_ID missing). Please sign in using your Email & Password.');
        } else {
          setAuthError(`Authentication error: ${errorParam}`);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // When switching workspace mode, default to showing WIP / Running orders table
  useEffect(() => {
    setCurrentTab('running');
    setTeamMemberFilter('all');
    setTeamSalesFilter('all');
    setProfileFilter('all');
    setStatusFilter('all');
  }, [workspaceMode]);

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('vercel_hub_theme', nextTheme);
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme} theme`);
  };

  const fetchProjects = async (showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
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

  const fetchTeamProjects = async (showSkeleton = false) => {
    try {
      if (showSkeleton) setTeamLoading(true);
      const res = await fetch('/api/team-projects');
      const data = await res.json();
      if (data.success) {
        setTeamProjects(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch team projects', err);
      showToast('Error connecting to team projects', 'error');
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      if (session.user.role !== 'Visitor') {
        fetchProjects();
        fetchTeamProjects();
      } else {
        setLoading(false);
        setTeamLoading(false);
      }
    }
  }, [session]);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3200);
  };

  const openIssueNoteModal = (project) => {
    setIssueNoteProject(project);
    setIssueNoteText(project.issueNote || '');
    setIssueNoteStatus(project.currentStatus || 'Issue');
    setIsIssueNoteModalOpen(true);
  };

  const closeIssueNoteModal = () => {
    setIsIssueNoteModalOpen(false);
    setIssueNoteProject(null);
    setIssueNoteText('');
    setIssueNoteStatus('Issue');
  };

  const handleSaveIssueNote = async () => {
    if (!issueNoteProject) return;
    setIsIssueNoteSaving(true);
    try {
      const targetEndpoint = workspaceMode === 'team'
        ? `/api/team-projects/${issueNoteProject._id}`
        : `/api/projects/${issueNoteProject._id}`;

      const payload = {
        issueNote: issueNoteText,
        currentStatus: issueNoteStatus,
        solvedAt: issueNoteStatus === 'Solved' ? new Date() : null,
      };

      const res = await fetch(targetEndpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        if (workspaceMode === 'team') {
          setTeamProjects((prev) =>
            prev.map((p) => (p._id === issueNoteProject._id ? { ...p, ...payload } : p))
          );
        } else {
          setProjects((prev) =>
            prev.map((p) => (p._id === issueNoteProject._id ? { ...p, ...payload } : p))
          );
        }
        showToast('Issue note & status updated!');
        closeIssueNoteModal();
      } else {
        showToast(data.error || 'Failed to save issue note', 'error');
      }
    } catch (err) {
      console.error('Save issue note error:', err);
      showToast('Error saving issue note', 'error');
    } finally {
      setIsIssueNoteSaving(false);
    }
  };

  // Team KPIs
  const teamFinancialOverview = useMemo(() => {
    let wipNetValue = 0;
    let deliveredNetValue = 0;
    teamProjects.forEach(p => {
      const status = (p.orderStatus || '').toLowerCase();
      const net = parseFloat(p.netAmount) || (parseFloat(p.amount) * 0.8 || 0);
      if (status === 'wip') {
        wipNetValue += net;
      } else if (status === 'delivered' || status === 'done') {
        deliveredNetValue += net;
      }
    });
    return { wipNetValue, deliveredNetValue };
  }, [teamProjects]);

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
    const set = new Set(projects.map((p) => getMonthFromDate(p.assignDate, p.month)).filter(Boolean));
    set.add(currentCalendarMonth);
    return Array.from(set).sort((a, b) => MONTH_LIST.indexOf(a) - MONTH_LIST.indexOf(b));
  }, [projects, currentCalendarMonth]);

  // Sidebar displayed months (ensures current calendar month is ALWAYS visible by default)
  const displayedMonths = useMemo(() => {
    const others = availableMonths
      .filter((m) => m.toLowerCase() !== currentCalendarMonth.toLowerCase())
      .sort((a, b) => MONTH_LIST.indexOf(b) - MONTH_LIST.indexOf(a));
    const allOrdered = [currentCalendarMonth, ...others];
    return monthsExpanded ? allOrdered : allOrdered.slice(0, 2);
  }, [availableMonths, currentCalendarMonth, monthsExpanded]);

  // Detailed Monthly Performance Stats
  const monthStats = useMemo(() => {
    return availableMonths.map((m) => {
      const isCurrent = m.toLowerCase() === currentCalendarMonth.toLowerCase();
      const mProjects = projects.filter((p) => {
        const pMonth = getMonthFromDate(p.assignDate, p.month);
        if (isCurrent) {
          return pMonth.toLowerCase() === m.toLowerCase() || (p.orderStatus !== 'Done' && p.orderStatus !== 'Delivered' && p.orderStatus !== 'Cancel');
        }
        return pMonth.toLowerCase() === m.toLowerCase();
      });
      const gross = mProjects.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      const net = gross * 0.8;
      const completed = mProjects.filter((p) => (p.orderStatus || '').toLowerCase() === 'done' || (p.orderStatus || '').toLowerCase() === 'delivered').length;
      return { month: m, count: mProjects.length, gross, net, completed };
    });
  }, [projects, availableMonths, currentCalendarMonth]);

  // Team Member Counts
  const teamMemberCounts = useMemo(() => {
    const counts = {};
    teamProjects.forEach((p) => {
      if (Array.isArray(p.assignedMembers)) {
        p.assignedMembers.forEach((m) => {
          if (m) counts[m] = (counts[m] || 0) + 1;
        });
      }
    });
    return counts;
  }, [teamProjects]);

  const teamMemberList = useMemo(() => {
    return Object.keys(teamMemberCounts).sort((a, b) => teamMemberCounts[b] - teamMemberCounts[a]);
  }, [teamMemberCounts]);

  // Team Sales Person Counts
  const teamSalesCounts = useMemo(() => {
    const counts = {};
    teamProjects.forEach((p) => {
      if (p.salesPerson) counts[p.salesPerson] = (counts[p.salesPerson] || 0) + 1;
    });
    return counts;
  }, [teamProjects]);

  const teamSalesList = useMemo(() => {
    return Object.keys(teamSalesCounts).sort((a, b) => teamSalesCounts[b] - teamSalesCounts[a]);
  }, [teamSalesCounts]);

  const teamUniqueProfiles = useMemo(() => {
    return Array.from(new Set(teamProjects.map((p) => p.profileName).filter(Boolean))).sort();
  }, [teamProjects]);

  const teamUniqueSales = useMemo(() => {
    return Array.from(new Set(teamProjects.map((p) => p.salesPerson).filter(Boolean))).sort();
  }, [teamProjects]);

  const teamUniqueMembers = useMemo(() => {
    const set = new Set();
    teamProjects.forEach((p) => {
      if (Array.isArray(p.assignedMembers)) {
        p.assignedMembers.forEach((m) => {
          if (m) set.add(m);
        });
      }
    });
    return Array.from(set).sort();
  }, [teamProjects]);

  // Team KPIs
  const teamKpis = useMemo(() => {
    let totalGross = 0;
    let activeWip = 0;
    let wipVal = 0;
    let deliveredDone = 0;

    teamProjects.forEach((p) => {
      const amt = parseFloat(p.amount) || 0;
      totalGross += amt;
      const s = (p.orderStatus || '').toLowerCase();
      if (s === 'wip') {
        activeWip++;
        wipVal += amt;
      }
      if (s === 'done' || s === 'delivered') {
        deliveredDone++;
      }
    });

    const netAmount = totalGross * 0.8;
    const rate = teamProjects.length > 0 ? Math.round((deliveredDone / teamProjects.length) * 100) : 0;
    const avgOrderValue = teamProjects.length > 0 ? totalGross / teamProjects.length : 0;
    const platformFee = totalGross * 0.2;

    return { totalGross, netAmount, platformFee, activeWip, wipVal, deliveredDone, rate, avgOrderValue };
  }, [teamProjects]);

  // Team Running Count
  const teamRunningCount = useMemo(() => {
    return teamProjects.filter((p) => (p.orderStatus || '').toLowerCase() === 'wip').length;
  }, [teamProjects]);

  // Team Monthly Stats for Analytics Page
  const teamMonthStats = useMemo(() => {
    return availableMonths.map((m) => {
      const isCurrent = m.toLowerCase() === currentCalendarMonth.toLowerCase();
      const mProjects = teamProjects.filter((p) => {
        const pMonth = getMonthFromDate(p.assignDate, p.month);
        if (isCurrent) {
          return pMonth.toLowerCase() === m.toLowerCase() || (p.orderStatus !== 'Done' && p.orderStatus !== 'Delivered' && p.orderStatus !== 'Cancel');
        }
        return pMonth.toLowerCase() === m.toLowerCase();
      });
      const gross = mProjects.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      const net = gross * 0.8;
      const completed = mProjects.filter((p) => (p.orderStatus || '').toLowerCase() === 'done' || (p.orderStatus || '').toLowerCase() === 'delivered').length;
      return { month: m, count: mProjects.length, gross, net, completed };
    });
  }, [teamProjects, availableMonths, currentCalendarMonth]);

  // Team Filtered & Sorted Projects
  const filteredTeamProjects = useMemo(() => {
    let res = teamProjects.filter((p) => {
      if (currentTab === 'running') {
        const s = (p.orderStatus || 'Wip').toLowerCase();
        const sch = (p.timeSchedule || '').toLowerCase();
        if (s !== 'wip' && s !== 'issue' && !s.includes('need') && sch !== 'late') return false;
      } else if (currentTab !== 'all') {
        const isCurrentCalendarMonthTab = currentTab.toLowerCase() === currentCalendarMonth.toLowerCase();
        const pMonth = getMonthFromDate(p.assignDate, p.month);
        const isAssignedInThisMonth = pMonth.toLowerCase() === currentTab.toLowerCase();

        if (isCurrentCalendarMonthTab) {
          const isRunning = p.orderStatus !== 'Done' && p.orderStatus !== 'Delivered' && p.orderStatus !== 'Cancel';
          if (!isAssignedInThisMonth && !isRunning) return false;
        } else {
          if (!isAssignedInThisMonth) return false;
        }
      }

      if (teamMemberFilter.toLowerCase() !== 'all') {
        if (!Array.isArray(p.assignedMembers) || !p.assignedMembers.some((m) => m.toLowerCase() === teamMemberFilter.toLowerCase())) {
          return false;
        }
      }

      if (teamSalesFilter.toLowerCase() !== 'all' && (p.salesPerson || '').toLowerCase() !== teamSalesFilter.toLowerCase()) {
        return false;
      }

      if (profileFilter.toLowerCase() !== 'all' && (p.profileName || '').toLowerCase() !== profileFilter.toLowerCase()) {
        return false;
      }

      if (statusFilter.toLowerCase() !== 'all' && (p.orderStatus || '').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchClient = (p.clientUserId || '').toLowerCase().includes(q);
        const matchOrder = (p.orderNumber || '').toLowerCase().includes(q);
        const matchProfile = (p.profileName || '').toLowerCase().includes(q);
        const matchSales = (p.salesPerson || '').toLowerCase().includes(q);
        const matchRemark = (p.remark || '').toLowerCase().includes(q);
        const matchNotes = (p.notes || '').toLowerCase().includes(q);
        const matchMembers = Array.isArray(p.assignedMembers) && p.assignedMembers.some((m) => m.toLowerCase().includes(q));
        if (!matchClient && !matchOrder && !matchProfile && !matchSales && !matchRemark && !matchNotes && !matchMembers) return false;
      }

      return true;
    });

    res.sort((a, b) => {
      let vA = a[sortConfig.key];
      let vB = b[sortConfig.key];
      if (sortConfig.key === 'amount' || sortConfig.key === 'netAmount') {
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
  }, [teamProjects, currentTab, teamMemberFilter, teamSalesFilter, profileFilter, statusFilter, searchQuery, sortConfig, currentCalendarMonth]);

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
        const isCurrentCalendarMonthTab = currentTab.toLowerCase() === currentCalendarMonth.toLowerCase();
        const pMonth = getMonthFromDate(p.assignDate, p.month);
        const isAssignedInThisMonth = pMonth.toLowerCase() === currentTab.toLowerCase();

        if (isCurrentCalendarMonthTab) {
          // In Current Month view: show if assigned in current month OR if running/undelivered from previous months
          const isRunningUndelivered = p.orderStatus !== 'Done' && p.orderStatus !== 'Delivered' && p.orderStatus !== 'Cancel';
          if (!isAssignedInThisMonth && !isRunningUndelivered) return false;
        } else {
          if (!isAssignedInThisMonth) return false;
        }
      }

      if (profileFilter !== 'all' && p.profileName !== profileFilter) return false;
      if (statusFilter !== 'all' && (p.orderStatus || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (currentStatusFilter !== 'all') {
        const eff = getEffectiveCurrentStatus(p);
        if (eff.toLowerCase() !== currentStatusFilter.toLowerCase()) return false;
      }
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
  }, [projects, currentTab, profileFilter, statusFilter, currentStatusFilter, scheduleFilter, searchQuery, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleQuickStatusChange = async (projectId, newStatus) => {
    const prevProject = projects.find((p) => p._id === projectId);
    const prevStatus = prevProject ? prevProject.orderStatus : 'Wip';
    const isIssue = newStatus.toLowerCase() === 'issue';

    const payload = {
      orderStatus: newStatus,
      marketplaceStatus: newStatus === 'Done' || newStatus === 'Delivered' ? 'Delivered' : 'Wip',
    };

    if (isIssue) {
      payload.currentStatus = 'Issue';
    } else if (prevProject?.orderStatus === 'Issue') {
      payload.currentStatus = 'All Sorted';
    }

    // Optimistic UI update instantly
    setProjects((prev) =>
      prev.map((p) => (p._id === projectId ? { ...p, ...payload } : p))
    );

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.map((p) => (p._id === projectId ? data.data : p)));
        showToast(`Status updated to ${newStatus}`);
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (e) {
      // Rollback on failure
      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? { ...p, orderStatus: prevStatus } : p))
      );
      showToast('Failed to update status', 'error');
    }
  };

  const handleQuickCurrentStatusChange = async (projectId, newCStatus) => {
    const prevProject = projects.find((p) => p._id === projectId);
    const prevCStatus = prevProject ? (prevProject.currentStatus || 'All Sorted') : 'All Sorted';

    const payload = {
      currentStatus: newCStatus,
      solvedAt: newCStatus === 'Solved' ? new Date() : null,
    };

    // Optimistic UI update instantly
    setProjects((prev) =>
      prev.map((p) => (p._id === projectId ? { ...p, ...payload } : p))
    );

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.map((p) => (p._id === projectId ? data.data : p)));
        showToast(`Issue status updated to ${newCStatus}`);
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (e) {
      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? { ...p, currentStatus: prevCStatus } : p))
      );
      showToast('Failed to update issue status', 'error');
    }
  };

  const handleBulkDelete = async () => {
    const requiredText = `DELETE ${selectedTeamOrders.length} ORDERS`;
    if (bulkDeleteConfirmText !== requiredText) return;

    setIsBulkDeleting(true);
    try {
      const res = await fetch('/api/team-projects/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedTeamOrders })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Successfully deleted ${data.deletedCount} team orders!`);
        fetchTeamProjects();
        setSelectedTeamOrders([]);
        setIsBulkDeleteModalOpen(false);
        setBulkDeleteConfirmText('');
      } else {
        showToast(data.error || 'Failed to bulk delete', 'error');
      }
    } catch (err) {
      showToast('Error during bulk deletion', 'error');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTeamOrders(filteredTeamProjects.map(p => p._id));
    } else {
      setSelectedTeamOrders([]);
    }
  };

  const toggleSelectOrder = (id) => {
    setSelectedTeamOrders(prev => 
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };

  // Auth Handlers
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await signIn('credentials', {
        email: authForm.email,
        password: authForm.password,
        redirect: false,
      });
      if (res?.error) {
        setAuthError(res.error || 'Invalid email or password');
      } else {
        setAuthError('');
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        setIsAuthModalOpen(false);
        setAuthForm({ name: '', email: '', password: '' });
        showToast('Signed in successfully');
        fetchProjects();
        fetchTeamProjects();
      }
    } catch (err) {
      setAuthError('An unexpected error occurred during sign in');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      if (!data.success) {
        setAuthError(data.error || 'Registration failed');
      } else {
        showToast('Account created! Signing in...');
        const loginRes = await signIn('credentials', {
          email: authForm.email,
          password: authForm.password,
          redirect: false,
        });
        if (!loginRes?.error) {
          setAuthError('');
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          setIsAuthModalOpen(false);
          setAuthForm({ name: '', email: '', password: '' });
          fetchProjects();
          fetchTeamProjects();
        } else {
          setAuthTab('signin');
        }
      }
    } catch (err) {
      setAuthError('An error occurred during registration');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  const openNewModal = (overrideMonth = null) => {
    if (!session?.user) {
      setAuthTab('signin');
      setIsAuthModalOpen(true);
      showToast('Please sign in to create new orders', 'error');
      return;
    }
    const defaultMonth = overrideMonth || (currentTab !== 'all' && currentTab !== 'running' && currentTab !== 'stats' ? currentTab : currentCalendarMonth);
    setActiveProject(null);
    setPersonalRawText('');
    setPersonalPasteSuccess(false);
    setFormData({
      assignDate: new Date().toISOString().split('T')[0],
      month: defaultMonth,
      salesPerson: '',
      clientUsername: '',
      orderNumber: '',
      profileName: '',
      instructionSheet: '',
      amount: '',
      orderStatus: 'Wip',
      currentStatus: 'All Sorted',
      estimatedDeliveryDate: '',
      deliveryDate: '',
      remark: '',
      percentage: '',
      ourSubdomain: '',
      deadline: '',
      timeSchedule: 'Fresh Query',
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
    setPersonalRawText('');
    setPersonalPasteSuccess(false);
    const resolvedMonth = getMonthFromDate(project.assignDate, project.month || 'September');
    setFormData({
      assignDate: project.assignDate || '',
      month: resolvedMonth,
      salesPerson: project.salesPerson || '',
      clientUsername: project.clientUsername || '',
      orderNumber: project.orderNumber || '',
      profileName: project.profileName || '',
      instructionSheet: project.instructionSheet || '',
      amount: project.amount || '',
      orderStatus: project.orderStatus || 'Wip',
      currentStatus: project.currentStatus || 'All Sorted',
      estimatedDeliveryDate: project.estimatedDeliveryDate || '',
      deliveryDate: project.deliveryDate || '',
      remark: project.remark || '',
      percentage: project.percentage || '',
      ourSubdomain: project.ourSubdomain || '',
      deadline: project.deadline ? project.deadline.split('T')[0] : '',
      timeSchedule: project.timeSchedule || 'Fresh Query',
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
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const autoMonth = getMonthFromDate(formData.assignDate, formData.month);
      const payload = { ...formData, month: autoMonth, amount: parseFloat(formData.amount) || 0 };
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
          setIsModalOpen(false);
        } else {
          showToast(data.error || 'Failed to update order', 'error');
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
          setIsModalOpen(false);
        } else {
          showToast(data.error || 'Failed to create order', 'error');
        }
      }
    } catch (err) {
      console.error('Save project error', err);
      showToast('Failed to save project', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Team Project Handlers
  const openNewTeamModal = () => {
    setActiveTeamProject(null);
    setTeamFormData({
      salesPerson: 'Shuvo',
      assignDate: new Date().toISOString().split('T')[0],
      month: MONTH_LIST[new Date().getMonth()],
      profileName: '',
      clientUserId: '',
      orderNumber: '',
      amount: '',
      assignedMembers: ['Alireja'],
      estimatedDeliveryDate: '',
      deliveryDate: '',
      remark: '',
      orderStatus: 'Wip',
      sheetLink: '',
      teamName: 'EleSquad',
      percentage: '',
      note: '',
      timeSchedule: 'Fresh Query',
    });
    setIsTeamModalOpen(true);
  };

  const openEditTeamModal = (p) => {
    setActiveTeamProject(p);
    setTeamFormData({
      salesPerson: p.salesPerson || 'Shuvo',
      assignDate: p.assignDate || new Date().toISOString().split('T')[0],
      month: p.month || MONTH_LIST[new Date().getMonth()],
      profileName: p.profileName || '',
      clientUserId: p.clientUserId || '',
      orderNumber: p.orderNumber || '',
      amount: p.amount !== undefined && p.amount !== null ? String(p.amount) : '',
      assignedMembers: Array.isArray(p.assignedMembers) ? [...p.assignedMembers] : [],
      estimatedDeliveryDate: p.estimatedDeliveryDate || '',
      deliveryDate: p.deliveryDate || '',
      remark: p.remark || '',
      orderStatus: p.orderStatus || 'Wip',
      sheetLink: p.sheetLink || '',
      teamName: p.teamName || 'EleSquad',
      percentage: p.percentage || '',
      note: p.notes || p.note || '',
      timeSchedule: p.timeSchedule || 'Fresh Query',
    });
    setIsTeamModalOpen(true);
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    if (teamIsSubmitting) return;
    try {
      setTeamIsSubmitting(true);
      const autoMonth = getMonthFromDate(teamFormData.assignDate, teamFormData.month);
      const gross = parseFloat(teamFormData.amount) || 0;
      const net = gross * 0.8;
      const payload = {
        ...teamFormData,
        month: autoMonth,
        amount: gross,
        netAmount: net,
        status: teamFormData.orderStatus,
        timeSchedule: teamFormData.timeSchedule,
        notes: teamFormData.note,
      };

      if (activeTeamProject) {
        const res = await fetch(`/api/team-projects/${activeTeamProject._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setTeamProjects((prev) =>
            prev.map((item) => (item._id === activeTeamProject._id ? data.data : item))
          );
          showToast(`Updated team order: ${payload.orderNumber || payload.clientUserId}`);
          setIsTeamModalOpen(false);
          fetchProjects();
        } else {
          showToast(data.error || 'Failed to update team order', 'error');
        }
      } else {
        const res = await fetch('/api/team-projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setTeamProjects((prev) => [data.data, ...prev]);
          showToast(`Created team order: ${payload.orderNumber || payload.clientUserId}`);
          setIsTeamModalOpen(false);
          fetchProjects();
        } else {
          showToast(data.error || 'Failed to create team order', 'error');
        }
      }
    } catch (err) {
      console.error('Error saving team project', err);
      showToast('Error saving team project', 'error');
    } finally {
      setTeamIsSubmitting(false);
    }
  };

  const handleTeamDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this team order?')) return;
    try {
      const res = await fetch(`/api/team-projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTeamProjects((prev) => prev.filter((p) => p._id !== id));
        showToast('Team order deleted successfully');
      }
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  const handleQuickUpdateTeamStatus = async (id, newStatus) => {
    try {
      const prevProject = teamProjects.find((p) => p._id === id);
      const isIssue = newStatus.toLowerCase() === 'issue';
      const payload = { orderStatus: newStatus };

      if (isIssue) {
        payload.currentStatus = 'Issue';
      } else if (prevProject?.orderStatus === 'Issue') {
        payload.currentStatus = 'All Sorted';
      }

      setTeamProjects((prev) =>
        prev.map((p) => (p._id === id ? { ...p, ...payload } : p))
      );
      const res = await fetch(`/api/team-projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Status updated to ${newStatus}`);
        fetchProjects();
      }
    } catch (err) {
      showToast('Status update failed', 'error');
    }
  };

  const handleQuickUpdateTeamCurrentStatus = async (id, newCStatus) => {
    const prevProject = teamProjects.find((p) => p._id === id);
    const prevCStatus = prevProject ? (prevProject.currentStatus || 'All Sorted') : 'All Sorted';

    const payload = {
      currentStatus: newCStatus,
      solvedAt: newCStatus === 'Solved' ? new Date() : null,
    };

    setTeamProjects((prev) =>
      prev.map((p) => (p._id === id ? { ...p, ...payload } : p))
    );

    try {
      const res = await fetch(`/api/team-projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setTeamProjects((prev) => prev.map((p) => (p._id === id ? data.data : p)));
        showToast(`Issue status updated to ${newCStatus}`);
        fetchProjects();
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (e) {
      setTeamProjects((prev) =>
        prev.map((p) => (p._id === id ? { ...p, currentStatus: prevCStatus } : p))
      );
      showToast('Failed to update issue status', 'error');
    }
  };

  const handleDelete = async (projectId, clientName) => {
    if (!confirm(`Are you sure you want to delete the order for "${clientName}"?`)) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p._id !== projectId));
        showToast('Order deleted successfully');
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

  const renderAuthModal = () => {
    if (!isAuthModalOpen) return null;
    return (
      <div className="v-modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
        <div className="auth-modal-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="v-modal-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/logo-black.png" alt="Logo" className="brand-logo-light" style={{ width: 20, height: 20, objectFit: 'contain' }} />
              <img src="/logo-white.png" alt="Logo" className="brand-logo-dark" style={{ width: 20, height: 20, objectFit: 'contain' }} />
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Workplace Hub</span>
            </div>
            <button className="btn-v-ghost" onClick={() => setIsAuthModalOpen(false)}><X size={16} /></button>
          </div>

          <div className="auth-tabs">
            <button
              className={`auth-tab-btn ${authTab === 'signin' ? 'active' : ''}`}
              onClick={() => { setAuthTab('signin'); setAuthError(''); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab-btn ${authTab === 'signup' ? 'active' : ''}`}
              onClick={() => { setAuthTab('signup'); setAuthError(''); }}
            >
              Sign Up
            </button>
          </div>

          <div style={{ padding: '1.25rem 1.5rem' }}>
            {/* Google OAuth Button */}
            <button type="button" className="google-auth-btn" onClick={handleGoogleSignIn}>
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            <div className="auth-divider">or continue with email</div>

            {authError && (
              <div style={{ background: 'rgba(238,0,0,0.1)', border: '1px solid rgba(238,0,0,0.3)', color: '#ff4d4f', padding: '0.5rem 0.75rem', borderRadius: 6, fontSize: '0.78rem', marginBottom: '0.85rem' }}>
                {authError}
              </div>
            )}

            <form onSubmit={authTab === 'signin' ? handleEmailSignIn : handleEmailSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {authTab === 'signup' && (
                <div className="v-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="v-input"
                    placeholder="e.g. Alireja Khan"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="v-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="v-input"
                  placeholder="e.g. alirejakhan36@gmail.com"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="v-form-group">
                <label>Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showAuthPassword ? 'text' : 'password'}
                    className="v-input"
                    style={{ paddingRight: '2.5rem' }}
                    placeholder="••••••••••••"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthPassword(!showAuthPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.65rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--accents-5)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={showAuthPassword ? 'Hide password' : 'Show password'}
                  >
                    {showAuthPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-v btn-v-primary"
                disabled={authLoading}
                style={{ width: '100%', marginTop: '0.35rem', padding: '0.65rem', justifyContent: 'center' }}
              >
                {authLoading && <div className="status-saving-spinner" style={{ width: 13, height: 13, borderWidth: 2 }} />}
                <span>{authLoading ? (authTab === 'signin' ? 'Signing In...' : 'Creating Account...') : (authTab === 'signin' ? 'Sign In' : 'Create Account')}</span>
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--accents-5)' }}>
              {authTab === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthTab('signup'); setAuthError(''); setShowAuthPassword(false); }}
                    style={{ color: 'var(--foreground)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthTab('signin'); setAuthError(''); setShowAuthPassword(false); }}
                    style={{ color: 'var(--foreground)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Prevent SSR hydration mismatch before mount
  if (!mounted) {
    return null;
  }

  // Unauthenticated Visitors: Dedicated Landing Page
  if (status === 'unauthenticated' || (status !== 'loading' && !session?.user)) {
    return (
      <div className="landing-root">
        {toastMessage && (
          <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card-bg)', border: '1px solid var(--border-default)', color: 'var(--geist-foreground)', padding: '0.65rem 1.15rem', borderRadius: 6, fontSize: '0.82rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
              <Check size={14} color="#10b981" /> {toastMessage.text}
            </div>
          </div>
        )}

        <LandingPage
          onOpenAuth={(tab = 'signin') => {
            setAuthTab(tab);
            setAuthError('');
            setIsAuthModalOpen(true);
          }}
          theme={theme}
          toggleTheme={toggleTheme}
          session={session}
          onSignOut={() => signOut()}
        />

        {renderAuthModal()}
      </div>
    );
  }

  // Authenticated Users: Full Workspace Dashboard
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

        {/* Workspace Switcher */}
        <div style={{ padding: '0.75rem 0.85rem 0.25rem 0.85rem' }}>
          <div className="workspace-switcher">
            <button
              className={`workspace-tab ${workspaceMode === 'personal' ? 'active' : ''}`}
              onClick={() => setWorkspaceMode('personal')}
            >
              <Briefcase size={12} />
              <span>Personal</span>
            </button>
            {['Owner', 'Leader', 'Co-Leader', 'Member', 'admin'].includes(session?.user?.role) && (
              <button
                className={`workspace-tab ${workspaceMode === 'team' ? 'active' : ''}`}
                onClick={() => setWorkspaceMode('team')}
              >
                <Users size={12} />
                <span>EleSquad</span>
              </button>
            )}
          </div>
        </div>

        {/* Admin Dashboard Access */}
        {['Owner', 'Leader', 'Co-Leader'].includes(session?.user?.role) && (
          <div style={{ padding: '0 0.85rem 0.25rem 0.85rem', marginTop: '0.5rem' }}>
            <button
              className={`btn-v ${workspaceMode === 'admin' ? 'btn-v-primary' : 'btn-v-secondary'}`}
              style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: '0.5rem', padding: '0.5rem', fontSize: '0.78rem' }}
              onClick={() => setWorkspaceMode('admin')}
            >
              <ShieldCheck size={14} /> Admin Panel
            </button>
          </div>
        )}

        {workspaceMode === 'personal' ? (
          <>
            {/* Action Button inside Sidebar with comfortable eye contrast */}
            {session?.user?.role !== 'Visitor' && (
              <div style={{ padding: '0.85rem 0.85rem 0.25rem 0.85rem' }}>
                <button className="sidebar-new-order-btn" onClick={openNewModal}>
                  <Plus size={14} /> New Order
                </button>
              </div>
            )}

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

              {/* Month Section with Arrow Toggle (Current month ALWAYS visible by default) */}
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
                {displayedMonths.map((m) => {
                  const isCurrentMonth = m.toLowerCase() === currentCalendarMonth.toLowerCase();
                  const count = projects.filter((p) => {
                    const pMonth = getMonthFromDate(p.assignDate, p.month);
                    if (isCurrentMonth) {
                      return pMonth.toLowerCase() === m.toLowerCase() || (p.orderStatus !== 'Done' && p.orderStatus !== 'Delivered' && p.orderStatus !== 'Cancel');
                    }
                    return pMonth.toLowerCase() === m.toLowerCase();
                  }).length;
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
                        {isCurrentMonth && (
                          <span style={{ fontSize: '0.62rem', padding: '0.08rem 0.32rem', borderRadius: '3px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.02em' }}>
                            Current
                          </span>
                        )}
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
          </>
        ) : (
          <>
            {/* Action Button inside Sidebar for Team */}
            <div style={{ padding: '0.85rem 0.85rem 0.25rem 0.85rem' }}>
              <button className="sidebar-new-order-btn" onClick={openNewTeamModal}>
                <Plus size={14} /> Add Team Order
              </button>
            </div>

            {/* Team Navigation Content */}
            <div className="sidebar-content">
              {/* Financial Overview */}
              <div className="sidebar-section">
                <div className="sidebar-section-title">Financial Overview</div>
                
                <div className="sidebar-nav-item" style={{ cursor: 'default' }}>
                  <div className="sidebar-nav-left">
                    <DollarSign size={14} color="#38bdf8" />
                    <span style={{ fontSize: '0.8rem' }}>WIP Net Value</span>
                  </div>
                  <span className="mono-text" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8' }}>
                    ${teamFinancialOverview.wipNetValue.toFixed(2)}
                  </span>
                </div>

                <div className="sidebar-nav-item" style={{ cursor: 'default' }}>
                  <div className="sidebar-nav-left">
                    <DollarSign size={14} color="#10b981" />
                    <span style={{ fontSize: '0.8rem' }}>Delivered Net Value</span>
                  </div>
                  <span className="mono-text" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>
                    ${teamFinancialOverview.deliveredNetValue.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Team Views */}
              <div className="sidebar-section">
                <div className="sidebar-section-title">Team Views</div>
                <button
                  className={`sidebar-nav-item ${currentTab === 'all' && teamMemberFilter === 'All' && teamSalesFilter === 'All' && statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentTab('all');
                    setTeamMemberFilter('All');
                    setTeamSalesFilter('All');
                    setProfileFilter('all');
                    setStatusFilter('all');
                    setScheduleFilter('all');
                  }}
                >
                  <div className="sidebar-nav-left">
                    <LayoutDashboard size={14} />
                    <span>All Team Orders</span>
                  </div>
                  <span className="sidebar-count-badge">{teamProjects.length}</span>
                </button>

                <button
                  className={`sidebar-nav-item ${currentTab === 'running' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentTab('running');
                    setTeamMemberFilter('All');
                    setTeamSalesFilter('All');
                    setProfileFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  <div className="sidebar-nav-left">
                    <Zap size={14} color="#38bdf8" />
                    <span>Running Team Orders</span>
                  </div>
                  <span className="sidebar-count-badge" style={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }}>
                    {teamRunningCount}
                  </span>
                </button>

                <button
                  className={`sidebar-nav-item ${currentTab === 'stats' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentTab('stats');
                    setTeamMemberFilter('All');
                    setTeamSalesFilter('All');
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

              {/* Team Months Section */}
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
                {displayedMonths.map((m) => {
                  const isCurrentMonth = m.toLowerCase() === currentCalendarMonth.toLowerCase();
                  const count = teamProjects.filter((p) => {
                    const pMonth = getMonthFromDate(p.assignDate, p.month);
                    if (isCurrentMonth) {
                      return pMonth.toLowerCase() === m.toLowerCase() || (p.orderStatus !== 'Done' && p.orderStatus !== 'Delivered' && p.orderStatus !== 'Cancel');
                    }
                    return pMonth.toLowerCase() === m.toLowerCase();
                  }).length;
                  return (
                    <button
                      key={m}
                      className={`sidebar-nav-item ${currentTab.toLowerCase() === m.toLowerCase() ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentTab(m);
                        setTeamMemberFilter('All');
                        setTeamSalesFilter('All');
                        setProfileFilter('all');
                      }}
                    >
                      <div className="sidebar-nav-left">
                        <Calendar size={14} />
                        <span>{m}</span>
                        {isCurrentMonth && (
                          <span style={{ fontSize: '0.62rem', padding: '0.08rem 0.32rem', borderRadius: '3px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.02em' }}>
                            Current
                          </span>
                        )}
                      </div>
                      <span className="sidebar-count-badge">{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Team Members Filter Section */}
              <div className="sidebar-section">
                <div className="sidebar-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Assigned Members</span>
                  <button
                    className="sidebar-expand-btn"
                    onClick={() => setTeamMembersExpanded(!teamMembersExpanded)}
                    title="Toggle Member list"
                  >
                    <ChevronDown size={14} style={{ transform: teamMembersExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                  </button>
                </div>
                {(teamMembersExpanded ? teamMemberList : teamMemberList.slice(0, 4)).map((m) => (
                  <button
                    key={m}
                    className={`sidebar-nav-item ${teamMemberFilter.toLowerCase() === m.toLowerCase() ? 'active' : ''}`}
                    onClick={() => setTeamMemberFilter(teamMemberFilter.toLowerCase() === m.toLowerCase() ? 'All' : m)}
                  >
                    <div className="sidebar-nav-left">
                      <Users size={14} />
                      <span style={{ maxWidth: 125, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m}</span>
                    </div>
                    <span className="sidebar-count-badge">{teamMemberCounts[m] || 0}</span>
                  </button>
                ))}
              </div>

              {/* Sales Persons Filter Section */}
              <div className="sidebar-section">
                <div className="sidebar-section-title">Sales Persons</div>
                {teamSalesList.map((sp) => (
                  <button
                    key={sp}
                    className={`sidebar-nav-item ${teamSalesFilter.toLowerCase() === sp.toLowerCase() ? 'active' : ''}`}
                    onClick={() => setTeamSalesFilter(teamSalesFilter.toLowerCase() === sp.toLowerCase() ? 'All' : sp)}
                  >
                    <div className="sidebar-nav-left">
                      <Briefcase size={14} />
                      <span style={{ maxWidth: 125, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sp}</span>
                    </div>
                    <span className="sidebar-count-badge">{teamSalesCounts[sp] || 0}</span>
                  </button>
                ))}
              </div>

              {/* Team Status Filter Section */}
              <div className="sidebar-section">
                <div className="sidebar-section-title">Team Status</div>
                {['Wip', 'Delivered', 'Done', 'NRA', 'Need Requirements', 'Cancel'].map((st) => {
                  const count = teamProjects.filter((p) => (p.orderStatus || '').toLowerCase() === st.toLowerCase()).length;
                  if (count === 0 && st !== 'Wip' && st !== 'Done') return null;
                  return (
                    <button
                      key={st}
                      className={`sidebar-nav-item ${teamStatusFilter.toLowerCase() === st.toLowerCase() ? 'active' : ''}`}
                      onClick={() => setTeamStatusFilter(teamStatusFilter.toLowerCase() === st.toLowerCase() ? 'All' : st)}
                    >
                      <div className="sidebar-nav-left">
                        <span
                          className="v-status-dot"
                          style={{
                            background:
                              st === 'Wip'
                                ? '#0284c7'
                                : st === 'Done' || st === 'Delivered'
                                ? '#10b981'
                                : st === 'Cancel'
                                ? '#ef4444'
                                : st === 'NRA'
                                ? '#a855f7'
                                : '#eab308',
                          }}
                        ></span>
                        <span>{st}</span>
                      </div>
                      <span className="sidebar-count-badge">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

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
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {workspaceMode === 'personal' ? 'Alireja-khan' : 'EleSquad'}
              </span>
              <span className="breadcrumb-divider">/</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accents-5)' }}>
                {workspaceMode === 'personal' ? 'my-work-place' : 'SMT 2025-2026'}
              </span>
              <span className="project-pill">
                {workspaceMode === 'personal'
                  ? currentTab === 'stats'
                    ? 'Analytics'
                    : 'Personal Hub'
                  : 'Team Workspace'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Workspace Toggle Pill */}
            <div className="segmented-nav" style={{ marginRight: '0.25rem' }}>
              <button
                className={`segmented-item ${workspaceMode === 'personal' ? 'active' : ''}`}
                onClick={() => setWorkspaceMode('personal')}
              >
                <Briefcase size={12} style={{ marginRight: 4 }} /> Personal
              </button>
              {['Owner', 'Leader', 'Co-Leader', 'Member', 'admin'].includes(session?.user?.role) && (
                <button
                  className={`segmented-item ${workspaceMode === 'team' ? 'active' : ''}`}
                  onClick={() => setWorkspaceMode('team')}
                >
                  <Users size={12} style={{ marginRight: 4 }} /> EleSquad
                </button>
              )}
            </div>

            {/* View Switcher: Table / Kanban / Stats (Personal Mode) */}
            {workspaceMode === 'personal' && (
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
            )}

            {workspaceMode === 'personal' && (
              <button className="btn-v btn-v-secondary" onClick={exportCSV} title="Export CSV">
                <Download size={13} /> Export
              </button>
            )}

            {/* Auth Session */}
            {session?.user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--input-bg)', padding: '0.3rem 0.65rem', borderRadius: 6, border: '1px solid var(--border-default)' }}>
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name} style={{ width: 22, height: 22, borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #10b981)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700 }}>
                    {(session.user.name || 'AK').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{session.user.name || 'Alireja Khan'}</span>
                    <span style={{ fontSize: '0.5rem', padding: '0.1rem 0.3rem', borderRadius: 4, background: 'var(--border-default)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {session.user.role}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--accents-5)' }}>{session.user.email}</span>
                </div>
                <button className="btn-v-ghost" onClick={() => signOut()} title="Sign Out" style={{ padding: 3, marginLeft: 4, cursor: 'pointer' }}>
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <button
                  className="btn-v btn-v-secondary"
                  onClick={() => {
                    setAuthTab('signin');
                    setAuthError('');
                    setIsAuthModalOpen(true);
                  }}
                >
                  <LogIn size={13} /> Sign In
                </button>
                <button
                  className="btn-v btn-v-primary"
                  onClick={() => {
                    setAuthTab('signup');
                    setAuthError('');
                    setIsAuthModalOpen(true);
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </header>

        {workspaceMode === 'admin' ? (
          <AdminUsersView />
        ) : (status === 'loading' || (workspaceMode === 'team' ? teamLoading : loading)) ? (
          currentTab === 'stats' ? (
            /* Stats & Analytics Skeleton */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <section className="metrics-row">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="metric-card skeleton-interactive" style={{ gap: '0.85rem' }}>
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
                  <div key={i} className="skeleton-interactive" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="skeleton-shimmer" style={{ width: 90, height: 10 }} />
                    <div className="skeleton-shimmer" style={{ width: 110, height: 20 }} />
                  </div>
                ))}
              </div>

              <div className="analytics-grid">
                {[1, 2].map((i) => (
                  <div key={i} className="analytics-card skeleton-interactive" style={{ gap: '1.2rem' }}>
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
                  <div className="skeleton-shimmer skeleton-interactive" style={{ flex: 1, minWidth: 240, height: 36, borderRadius: 6 }} />
                  <div className="skeleton-shimmer skeleton-interactive" style={{ width: 140, height: 36, borderRadius: 6 }} />
                  <div className="skeleton-shimmer skeleton-interactive" style={{ width: 120, height: 36, borderRadius: 6 }} />
                  <div className="skeleton-shimmer skeleton-interactive" style={{ width: 120, height: 36, borderRadius: 6 }} />
                  <div className="skeleton-shimmer skeleton-interactive" style={{ width: 80, height: 36, borderRadius: 6 }} />
                </div>
              </section>

              <div className="table-smart-wrapper">
                <div className="table-sub-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div className="sync-pulse-badge">
                      <span className="sync-pulse-dot" />
                      Syncing workspace database orders...
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div className="skeleton-shimmer skeleton-interactive" style={{ width: 55, height: 22, borderRadius: 4 }} />
                    <div className="skeleton-shimmer skeleton-interactive" style={{ width: 55, height: 22, borderRadius: 4 }} />
                  </div>
                </div>

                <div className="v-table-container">
                  <table className="v-table">
                    <thead>
                      <tr>
                        <th>Assign Date</th>
                        <th>{workspaceMode === 'team' ? 'Sales Person' : 'Client Username'}</th>
                        <th>Profile</th>
                        <th>{workspaceMode === 'team' ? 'Client ID' : 'Brief Doc'}</th>
                        <th>{workspaceMode === 'team' ? 'Order #' : 'Gross'}</th>
                        <th>{workspaceMode === 'team' ? 'Gross' : 'Net (80%)'}</th>
                        <th>{workspaceMode === 'team' ? 'Net (80%)' : 'Order Status'}</th>
                        <th>{workspaceMode === 'team' ? 'Assigned Member(s)' : 'Staging Subdomain'}</th>
                        <th>{workspaceMode === 'team' ? 'Est. Deli' : 'Deadline'}</th>
                        <th>{workspaceMode === 'team' ? 'Deli Date' : 'Schedule'}</th>
                        <th>{workspaceMode === 'team' ? 'Status' : 'Live Domain'}</th>
                        <th>{workspaceMode === 'team' ? 'Sheet / Payout' : 'Daily Update'}</th>
                        <th>{workspaceMode === 'team' ? 'Remark' : 'Review'}</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row, idx) => (
                        <tr key={row} className="skeleton-row">
                          <td><div className="skeleton-shimmer" style={{ width: '70%', height: 12, animationDelay: `${idx * 0.04}s` }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: '85%', height: 14, animationDelay: `${idx * 0.04 + 0.02}s` }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: '65%', height: 12, animationDelay: `${idx * 0.04 + 0.04}s` }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: 48, height: 20, borderRadius: 4, animationDelay: `${idx * 0.04}s` }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: '60%', height: 14, animationDelay: `${idx * 0.04 + 0.03}s` }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: '60%', height: 14, animationDelay: `${idx * 0.04 + 0.05}s` }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: 70, height: 20, borderRadius: 999, animationDelay: `${idx * 0.04}s` }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: 65, height: 20, borderRadius: 4, animationDelay: `${idx * 0.04 + 0.02}s` }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: '75%', height: 12, animationDelay: `${idx * 0.04 + 0.04}s` }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: '55%', height: 12, animationDelay: `${idx * 0.04 + 0.01}s` }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: 48, height: 20, borderRadius: 4, animationDelay: `${idx * 0.04 + 0.03}s` }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: '80%', height: 12, animationDelay: `${idx * 0.04 + 0.02}s` }} /></td>
                          <td><div className="skeleton-shimmer" style={{ width: '65%', height: 12, animationDelay: `${idx * 0.04 + 0.04}s` }} /></td>
                          <td style={{ textAlign: 'center' }}><div className="skeleton-shimmer" style={{ width: 55, height: 18, borderRadius: 4, animationDelay: `${idx * 0.04}s` }} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        ) : currentTab === 'stats' ? (
          /* Dedicated Stats & Analytics Page (Personal vs Team) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Primary KPI Cards */}
            <section className="metrics-row">
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-title">{workspaceMode === 'team' ? 'Total Team Gross' : 'Total Gross Volume'}</span>
                  <Wallet size={15} color="var(--accents-5)" />
                </div>
                <div className="metric-value">
                  ${(workspaceMode === 'team' ? teamKpis.totalGross : kpis.totalGross).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="metric-footer">
                  <span className="metric-badge">
                    {workspaceMode === 'team' ? teamProjects.length : projects.length} Total Orders
                  </span> {workspaceMode === 'team' ? 'EleSquad pipeline' : 'Across all profiles'}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-title">Net Revenue (Take-Home 80%)</span>
                  <TrendingUp size={15} color="#10b981" />
                </div>
                <div className="metric-value" style={{ color: 'var(--geist-foreground)' }}>
                  ${(workspaceMode === 'team' ? teamKpis.netAmount : kpis.netAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="metric-footer">
                  <span className="metric-badge green">-20% Fee (${(workspaceMode === 'team' ? teamKpis.platformFee : kpis.platformFee).toFixed(2)})</span> 80% Net profit
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-title">Work In Progress</span>
                  <Clock size={15} color="#0284c7" />
                </div>
                <div className="metric-value">
                  {workspaceMode === 'team' ? teamKpis.activeWip : kpis.activeWip}
                </div>
                <div className="metric-footer">
                  <span className="metric-badge blue">
                    ${(workspaceMode === 'team' ? teamKpis.wipVal : kpis.wipVal).toFixed(0)} In Queue
                  </span> Active development
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-title">Delivery Success Rate</span>
                  <CheckCircle2 size={15} color="#10b981" />
                </div>
                <div className="metric-value">
                  {workspaceMode === 'team' ? teamKpis.rate : kpis.rate}%
                </div>
                <div className="metric-footer">
                  <span className="metric-badge green">
                    {workspaceMode === 'team' ? teamKpis.deliveredDone : kpis.deliveredDone} Delivered
                  </span> Successfully completed
                </div>
              </div>
            </section>

            {/* Secondary KPIs Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '0.85rem 1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)', textTransform: 'uppercase', fontWeight: 600 }}>Average Order Value</span>
                <div className="mono-text" style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 4 }}>
                  ${(workspaceMode === 'team' ? teamKpis.avgOrderValue : kpis.avgOrderValue).toFixed(2)}
                </div>
              </div>

              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '0.85rem 1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {workspaceMode === 'team' ? 'Active Team Members' : 'Marketplace Profiles'}
                </span>
                <div className="mono-text" style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 4 }}>
                  {workspaceMode === 'team' ? `${teamMemberList.length} Members` : `${uniqueProfiles.length} Profiles`}
                </div>
              </div>

              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '0.85rem 1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)', textTransform: 'uppercase', fontWeight: 600 }}>Total Completed / Done</span>
                <div className="mono-text" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981', marginTop: 4 }}>
                  {workspaceMode === 'team' ? teamKpis.deliveredDone : kpis.deliveredDone} Orders
                </div>
              </div>

              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '0.85rem 1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {workspaceMode === 'team' ? 'Sales Pipeline' : '5-Star Reviews'}
                </span>
                <div className="mono-text" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f5a623', marginTop: 4 }}>
                  {workspaceMode === 'team' ? `${teamSalesList.length} Sales Persons` : '100% Top Rated'}
                </div>
              </div>
            </div>

            {/* Analytics Grid: Breakdowns */}
            <div className="analytics-grid">
              {workspaceMode === 'team' ? (
                <>
                  {/* Team Member Workload Breakdown */}
                  <div className="analytics-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--foreground)' }}>
                        Member Workload & Order Volume
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accents-5)' }}>
                        {teamMemberList.length} Assigned Members
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {teamMemberList.map((member) => {
                        const count = teamMemberCounts[member] || 0;
                        const pct = Math.round((count / (teamProjects.length || 1)) * 100);
                        const memberGross = teamProjects
                          .filter((p) => Array.isArray(p.assignedMembers) && p.assignedMembers.includes(member))
                          .reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
                        return (
                          <div key={member} className="breakdown-row">
                            <div className="breakdown-info">
                              <span style={{ fontWeight: 600 }}>{member}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span className="mono-text" style={{ fontWeight: 600 }}>${memberGross.toFixed(2)}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)' }}>({count} orders • {pct}%)</span>
                              </div>
                            </div>
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill green" style={{ width: `${Math.min(pct * 2, 100)}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Team Sales Person Breakdown */}
                  <div className="analytics-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--foreground)' }}>
                        Sales Person Pipeline Share
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accents-5)' }}>
                        {teamSalesList.length} Sales Persons
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {teamSalesList.map((sp) => {
                        const count = teamSalesCounts[sp] || 0;
                        const pct = Math.round((count / (teamProjects.length || 1)) * 100);
                        const spGross = teamProjects
                          .filter((p) => p.salesPerson === sp)
                          .reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
                        return (
                          <div key={sp} className="breakdown-row">
                            <div className="breakdown-info">
                              <span style={{ fontWeight: 600 }}>{sp}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span className="mono-text" style={{ fontWeight: 600 }}>${spGross.toFixed(2)}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)' }}>({count} orders • {pct}%)</span>
                              </div>
                            </div>
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill blue" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Personal Profiles Breakdown */}
                  <div className="analytics-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--foreground)' }}>
                        Revenue by Marketplace Profile
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accents-5)' }}>
                        {profileStats.length} Profiles
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {profileStats.map((p) => {
                        const percent = kpis.totalGross > 0 ? (p.gross / kpis.totalGross) * 100 : 0;
                        return (
                          <div key={p.name} className="breakdown-row">
                            <div className="breakdown-info">
                              <span style={{ fontWeight: 600 }}>{p.name}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span className="mono-text" style={{ fontWeight: 600 }}>${p.gross.toFixed(2)}</span>
                                <span className="mono-text" style={{ color: '#10b981', fontSize: '0.74rem' }}>Net: ${p.net.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Personal Monthly Performance */}
                  <div className="analytics-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--foreground)' }}>
                        Monthly Performance Breakdown
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accents-5)' }}>
                        {monthStats.length} Recorded Months
                      </span>
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
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Table / Kanban View (Personal vs Team) */
          <>
            {/* Filter & Search Bar */}
            <section className="control-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <div className="v-input-wrapper">
                  <input
                    type="text"
                    className="v-input"
                    placeholder={
                      workspaceMode === 'team'
                        ? 'Search orders, client ID, order #, member, remark...'
                        : 'Search orders, clients, subdomains, notes...'
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {workspaceMode === 'team' ? (
                  <>
                    {/* Team Member Filter */}
                    <select
                      className="v-select"
                      value={teamMemberFilter}
                      onChange={(e) => setTeamMemberFilter(e.target.value)}
                    >
                      <option value="all">All Members ({teamMemberList.length})</option>
                      {teamMemberList.map((m) => (
                        <option key={m} value={m}>{m} ({teamMemberCounts[m] || 0})</option>
                      ))}
                    </select>

                    {/* Sales Person Filter */}
                    <select
                      className="v-select"
                      value={teamSalesFilter}
                      onChange={(e) => setTeamSalesFilter(e.target.value)}
                    >
                      <option value="all">All Sales ({teamSalesList.length})</option>
                      {teamSalesList.map((sp) => (
                        <option key={sp} value={sp}>{sp} ({teamSalesCounts[sp] || 0})</option>
                      ))}
                    </select>

                    {/* Profile Filter */}
                    <select
                      className="v-select"
                      value={profileFilter}
                      onChange={(e) => setProfileFilter(e.target.value)}
                    >
                      <option value="all">All Profiles ({teamUniqueProfiles.length})</option>
                      {teamUniqueProfiles.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>

                    {/* Status Filter */}
                    <select
                      className="v-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="Wip">Wip</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Done">Done</option>
                      <option value="NRA">NRA</option>
                      <option value="Need Requirements">Need Requirements</option>
                      <option value="Cancel">Cancel</option>
                    </select>
                  </>
                ) : (
                  <>
                    <select
                      className="v-select"
                      value={profileFilter}
                      onChange={(e) => setProfileFilter(e.target.value)}
                    >
                      <option value="all">All Profiles ({uniqueProfiles.length})</option>
                      {uniqueProfiles.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>

                    <select
                      className="v-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Order Statuses</option>
                      <option value="Done">Done</option>
                      <option value="Wip">Wip</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Issue">Issue</option>
                      <option value="Cancel">Cancel</option>
                    </select>

                    <select
                      className="v-select"
                      value={currentStatusFilter}
                      onChange={(e) => setCurrentStatusFilter(e.target.value)}
                    >
                      <option value="all">All Issue Statuses</option>
                      <option value="All Sorted">All Sorted</option>
                      <option value="Issue">Issue</option>
                      <option value="WIP">WIP</option>
                      <option value="Solved">Solved</option>
                    </select>

                    <select
                      className="v-select"
                      style={{ minWidth: 150 }}
                      value={scheduleFilter}
                      onChange={(e) => setScheduleFilter(e.target.value)}
                    >
                      <option value="all">All Order Types</option>
                      <option value="Fresh Query">Fresh Query</option>
                      <option value="Repeat">Repeat Order</option>
                      <option value="Add-on">Add-on</option>
                    </select>
                  </>
                )}

                <button
                  className="btn-v btn-v-secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setProfileFilter('all');
                    setStatusFilter('all');
                    setCurrentStatusFilter('all');
                    setScheduleFilter('all');
                    setTeamMemberFilter('all');
                    setTeamSalesFilter('all');
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
                      <SlidersHorizontal size={12} /> {workspaceMode === 'team'
                        ? `${currentTab === 'all' ? 'All Team Orders' : currentTab === 'running' ? 'Running Team Orders' : `${currentTab} Orders`}: ${filteredTeamProjects.length} Records`
                        : `${currentTab === 'all' ? 'All Orders' : currentTab === 'running' ? 'Running Orders' : `${currentTab} Orders`}: ${filteredProjects.length} Records`}
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
                    {workspaceMode === 'team' ? (
                      /* TEAM TABLE HEADERS (Google Sheet Columns) */
                      <thead>
                        <tr>
                          {['Owner', 'admin'].includes(session?.user?.role) && (
                            <th style={{ width: 40, textAlign: 'center' }}>
                              <input 
                                type="checkbox" 
                                checked={filteredTeamProjects.length > 0 && selectedTeamOrders.length === filteredTeamProjects.length}
                                onChange={toggleSelectAll}
                                style={{ cursor: 'pointer' }}
                                title="Select All"
                              />
                            </th>
                          )}
                          <th className="sortable" onClick={() => handleSort('assignDate')}>Assign Date</th>
                          <th className="sortable" onClick={() => handleSort('salesPerson')}>Sales Person</th>
                          <th className="sortable" onClick={() => handleSort('profileName')}>Profile</th>
                          <th className="sortable" onClick={() => handleSort('clientUserId')}>Client User ID</th>
                          <th className="sortable" onClick={() => handleSort('orderNumber')}>Order #</th>
                          <th className="sortable" onClick={() => handleSort('amount')}>Gross</th>
                          <th>Net (80%)</th>
                          <th>Assigned Member(s)</th>
                          <th className="sortable" onClick={() => handleSort('estimatedDeliveryDate')}>Est. Deli</th>
                          <th>Deli Date</th>
                          <th>Order Status</th>
                          <th>Order Type</th>
                          <th>Sheet</th>
                          <th>Payout</th>
                          <th>Note</th>
                          <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                    ) : (
                      /* PERSONAL TABLE HEADERS */
                      <thead>
                        <tr>
                          <th className="sortable" onClick={() => handleSort('assignDate')}>Assign Date</th>
                          <th className="sortable" onClick={() => handleSort('salesPerson')}>Sales Person</th>
                          <th className="sortable" onClick={() => handleSort('profileName')}>Profile</th>
                          <th className="sortable" onClick={() => handleSort('clientUsername')}>Client User ID</th>
                          <th className="sortable" onClick={() => handleSort('orderNumber')}>Order #</th>
                          <th className="sortable" onClick={() => handleSort('amount')}>Gross</th>
                          <th>Net (80%)</th>
                          <th className="sortable" onClick={() => handleSort('estimatedDeliveryDate')}>Est. Deli</th>
                          <th>Deli Date</th>
                          <th>Order Status</th>
                          <th>Order Type</th>
                          <th>Sheet</th>
                          <th>Remark</th>
                          <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                    )}
                    <tbody>
                      {workspaceMode === 'team' ? (
                        /* TEAM TABLE ROWS */
                        filteredTeamProjects.length === 0 ? (
                          <tr>
                            <td colSpan={16} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--accents-5)' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--foreground)' }}>
                                  No team orders found matching your filters.
                                </span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--accents-4)' }}>
                                  Click <button type="button" onClick={openNewTeamModal} style={{ color: '#38bdf8', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>+ Add Team Order</button> to create one.
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredTeamProjects.map((p) => {
                            const gross = parseFloat(p.amount) || 0;
                            const net = parseFloat(p.netAmount) || gross * 0.8;
                            const members = Array.isArray(p.assignedMembers) ? p.assignedMembers : [];
                            const statusLower = (p.orderStatus || 'Wip').toLowerCase();
                            const statusClass =
                              statusLower === 'done'
                                ? 'v-status-done'
                                : statusLower === 'delivered'
                                ? 'v-status-delivered'
                                : statusLower === 'cancel'
                                ? 'v-status-cancel'
                                : statusLower === 'nra'
                                ? 'v-status-nra'
                                : statusLower.includes('need')
                                ? 'v-status-need'
                                : statusLower === 'issue'
                                ? 'v-status-issue'
                                : 'v-status-wip';

                            return (
                              <tr key={p._id} className={selectedTeamOrders.includes(p._id) ? 'selected-row' : ''}>
                                {['Owner', 'admin'].includes(session?.user?.role) && (
                                  <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                                    <input 
                                      type="checkbox"
                                      checked={selectedTeamOrders.includes(p._id)}
                                      onChange={() => toggleSelectOrder(p._id)}
                                      style={{ cursor: 'pointer' }}
                                    />
                                  </td>
                                )}
                                <td className="mono-text" style={{ color: 'var(--accents-5)' }}>
                                  <div>{p.assignDate || '-'}</div>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--accents-4)' }}>{p.month || ''}</div>
                                </td>
                                <td>
                                  <span style={{ fontWeight: 600 }}>{p.salesPerson || '-'}</span>
                                </td>
                                <td>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--accents-5)' }}>{p.profileName || '-'}</span>
                                </td>
                                <td>
                                  <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{p.clientUserId || '-'}</span>
                                </td>
                                <td className="mono-text" style={{ fontWeight: 600 }}>
                                  {p.orderNumber || '-'}
                                </td>
                                <td className="mono-text" style={{ fontWeight: 600 }}>${gross.toFixed(2)}</td>
                                <td className="mono-text" style={{ color: '#10b981', fontWeight: 600 }}>${net.toFixed(2)}</td>
                                <td>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    {members.length > 0 ? (
                                      members.map((m) => (
                                        <span key={m} style={{ fontSize: '0.7rem', background: 'var(--accents-1)', border: '1px solid var(--border-subtle)', padding: '0.1rem 0.4rem', borderRadius: 999 }}>
                                          {m}
                                        </span>
                                      ))
                                    ) : (
                                      <span style={{ color: 'var(--accents-4)', fontSize: '0.75rem' }}>-</span>
                                    )}
                                  </div>
                                </td>
                                <td className="mono-text" style={{ color: 'var(--accents-5)' }}>
                                  {p.estimatedDeliveryDate || '-'}
                                </td>
                                <td className="mono-text" style={{ color: 'var(--accents-5)' }}>
                                  {p.deliveryDate || '-'}
                                </td>
                                <td>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                                    <div className={`v-status-badge ${statusClass}`}>
                                      <span className="v-status-dot"></span>
                                      <select
                                        style={{
                                          background: 'transparent',
                                          border: 'none',
                                          color: 'inherit',
                                          outline: 'none',
                                          cursor: 'pointer',
                                          fontFamily: 'inherit',
                                          fontSize: '0.73rem',
                                          fontWeight: 600,
                                        }}
                                        value={p.orderStatus || 'Wip'}
                                        onChange={(e) => handleQuickUpdateTeamStatus(p._id, e.target.value)}
                                      >
                                        <option value="Wip">Wip</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Done">Done</option>
                                        <option value="NRA">NRA</option>
                                        <option value="Need Requirements">Need Requirements</option>
                                        <option value="Cancel">Cancel</option>
                                        {['delivered', 'done', 'issue'].includes((p.orderStatus || '').toLowerCase()) && (
                                          <option value="Issue">Issue</option>
                                        )}
                                      </select>
                                    </div>
                                    {(() => {
                                      const effCStatus = getEffectiveCurrentStatus(p);
                                      const cStatusLower = effCStatus.toLowerCase();
                                      const orderStatusLower = (p.orderStatus || '').toLowerCase();
                                      const isIssueOrder = orderStatusLower === 'issue';
                                      const hasNote = Boolean(p.issueNote);

                                      // Show secondary flag ONLY if order status is NOT Issue and current status is wip or solved
                                      const showSecondaryFlag = !isIssueOrder && (cStatusLower === 'wip' || cStatusLower === 'solved');

                                      // Eye button is shown ONLY if order status is Issue, or cStatus is issue/wip, or issueNote exists
                                      const showEyeBtn = isIssueOrder || cStatusLower === 'issue' || cStatusLower === 'wip' || hasNote;

                                      if (!showSecondaryFlag && !showEyeBtn) return null;

                                      const flagClass = cStatusLower === 'wip' ? 'v-issue-flag-wip' : 'v-issue-flag-solved';
                                      const flagLabel = cStatusLower === 'wip' ? 'Issue WIP' : 'Solved';

                                      return (
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                          {showSecondaryFlag && (
                                            <span className={`v-issue-flag-badge ${flagClass}`}>
                                              <span className="v-issue-flag-dot"></span>
                                              {flagLabel}
                                            </span>
                                          )}
                                          {showEyeBtn && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openIssueNoteModal(p);
                                              }}
                                              className="v-issue-eye-btn"
                                              title={p.issueNote ? `View Issue Note: "${p.issueNote}"` : 'Add Issue Note'}
                                              style={{ flexShrink: 0 }}
                                            >
                                              <Eye size={13} />
                                              {p.issueNote ? <span className="v-issue-dot"></span> : null}
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </td>
                                <td>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--accents-5)' }}>
                                    {p.timeSchedule || 'Fresh Query'}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    {ensureValidUrl(p.sheetLink) ? (
                                      <a href={ensureValidUrl(p.sheetLink)} target="_blank" rel="noreferrer" className="btn-v btn-v-secondary" style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }} title="Open Sheet">
                                        <ExternalLink size={11} /> Sheet
                                      </a>
                                    ) : null}
                                  </div>
                                </td>
                                <td>
                                  {p.percentage ? (
                                    <span className="mono-text" style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600 }}>
                                      ${p.percentage}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--accents-5)' }}>
                                  {p.note || '-'}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <button className="btn-v-ghost" style={{ padding: 4 }} onClick={() => openEditTeamModal(p)} title="Edit Order">
                                      <Edit2 size={13} />
                                    </button>
                                    <button className="btn-v-ghost" style={{ padding: 4, color: '#ef4444' }} onClick={() => handleTeamDelete(p._id)} title="Delete Order">
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )
                      ) : (
                        /* PERSONAL TABLE ROWS */
                        session?.user?.role === 'Visitor' ? (
                          <tr>
                            <td colSpan={14} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--accents-5)' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
                                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>
                                  Dashboard Access Pending
                                </span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--accents-5)', maxWidth: 450, lineHeight: 1.5 }}>
                                  You are currently registered as a Visitor. Once an Admin assigns you a Member role, your data and orders will appear here automatically.
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : filteredProjects.length === 0 ? (
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
                            const statusLower = (p.orderStatus || 'Wip').toLowerCase();
                            const statusClass =
                              statusLower === 'done'
                                ? 'v-status-done'
                                : statusLower === 'delivered'
                                ? 'v-status-delivered'
                                : statusLower === 'cancel'
                                ? 'v-status-cancel'
                                : statusLower === 'nra'
                                ? 'v-status-nra'
                                : statusLower.includes('need')
                                ? 'v-status-need'
                                : statusLower === 'issue'
                                ? 'v-status-issue'
                                : 'v-status-wip';

                            return (
                              <tr key={p._id}>
                                <td className="mono-text" style={{ color: 'var(--accents-5)' }}>
                                  <div>{p.assignDate || '-'}</div>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--accents-4)' }}>{p.month || ''}</div>
                                </td>
                                <td>
                                  <span style={{ fontWeight: 600 }}>{p.salesPerson || '-'}</span>
                                </td>
                                <td>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--accents-5)' }}>{p.profileName || '-'}</span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 600 }}>{p.clientUsername}</span>
                                    {currentTab.toLowerCase() === currentCalendarMonth.toLowerCase() && p.month && p.month.toLowerCase() !== currentCalendarMonth.toLowerCase() && (
                                      <span style={{ fontSize: '0.65rem', padding: '0.06rem 0.35rem', borderRadius: 3, background: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.25)', fontWeight: 500 }} title={`Assigned in ${p.month} • Running project`}>
                                        from {p.month}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="mono-text" style={{ fontWeight: 600 }}>
                                  {p.orderNumber || '-'}
                                </td>
                                <td className="mono-text" style={{ fontWeight: 600 }}>${gross.toFixed(2)}</td>
                                <td className="mono-text" style={{ color: '#10b981', fontWeight: 600 }}>${net.toFixed(2)}</td>
                                <td className="mono-text" style={{ color: p.timeSchedule === 'Late' ? '#ee0000' : 'var(--accents-5)' }}>
                                  {p.estimatedDeliveryDate || p.deadline || '-'}
                                </td>
                                <td className="mono-text" style={{ color: 'var(--accents-5)' }}>
                                  {p.deliveryDate || '-'}
                                </td>
                                <td>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                                    <div className={`v-status-badge ${statusClass}`}>
                                      <span className="v-status-dot"></span>
                                      <select
                                        style={{
                                          background: 'transparent',
                                          border: 'none',
                                          color: 'inherit',
                                          outline: 'none',
                                          cursor: 'pointer',
                                          fontFamily: 'inherit',
                                          fontSize: '0.73rem',
                                          fontWeight: 600,
                                        }}
                                        value={p.orderStatus || 'Wip'}
                                        onChange={(e) => handleQuickStatusChange(p._id, e.target.value)}
                                      >
                                        <option value="Wip">Wip</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Done">Done</option>
                                        <option value="NRA">NRA</option>
                                        <option value="Need Requirements">Need Requirements</option>
                                        <option value="Cancel">Cancel</option>
                                        {['delivered', 'done', 'issue'].includes((p.orderStatus || '').toLowerCase()) && (
                                          <option value="Issue">Issue</option>
                                        )}
                                      </select>
                                    </div>
                                    {(() => {
                                      const effCStatus = getEffectiveCurrentStatus(p);
                                      const cStatusLower = effCStatus.toLowerCase();
                                      const orderStatusLower = (p.orderStatus || '').toLowerCase();
                                      const isIssueOrder = orderStatusLower === 'issue';
                                      const hasNote = Boolean(p.issueNote);

                                      // Show secondary flag ONLY if order status is NOT Issue and current status is wip or solved
                                      const showSecondaryFlag = !isIssueOrder && (cStatusLower === 'wip' || cStatusLower === 'solved');

                                      // Eye button is shown ONLY if order status is Issue, or cStatus is issue/wip, or issueNote exists
                                      const showEyeBtn = isIssueOrder || cStatusLower === 'issue' || cStatusLower === 'wip' || hasNote;

                                      if (!showSecondaryFlag && !showEyeBtn) return null;

                                      const flagClass = cStatusLower === 'wip' ? 'v-issue-flag-wip' : 'v-issue-flag-solved';
                                      const flagLabel = cStatusLower === 'wip' ? 'Issue WIP' : 'Solved';

                                      return (
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                          {showSecondaryFlag && (
                                            <span className={`v-issue-flag-badge ${flagClass}`}>
                                              <span className="v-issue-flag-dot"></span>
                                              {flagLabel}
                                            </span>
                                          )}
                                          {showEyeBtn && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openIssueNoteModal(p);
                                              }}
                                              className="v-issue-eye-btn"
                                              title={p.issueNote ? `View Issue Note: "${p.issueNote}"` : 'Add Issue Note'}
                                              style={{ flexShrink: 0 }}
                                            >
                                              <Eye size={13} />
                                              {p.issueNote ? <span className="v-issue-dot"></span> : null}
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </td>
                                <td>
                                  <span style={{ fontSize: '0.75rem', color: p.timeSchedule === 'Late' ? '#f5a623' : 'var(--accents-5)' }}>
                                    {p.timeSchedule || 'Fresh Query'}
                                  </span>
                                </td>
                                <td>
                                  {p.instructionSheet ? (
                                    <a href={ensureValidUrl(p.instructionSheet)} target="_blank" rel="noreferrer" className="btn-v btn-v-secondary" style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}>
                                      <ExternalLink size={11} /> Sheet
                                    </a>
                                  ) : '-'}
                                </td>
                                <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--accents-5)' }}>
                                  {p.remark || p.notes || '-'}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <button className="btn-v-ghost" style={{ padding: 4 }} onClick={() => openDetailModal(p)} title="View Details">
                                      <Eye size={13} />
                                    </button>
                                    <button className="btn-v-ghost" style={{ padding: 4 }} onClick={() => openEditModal(p)} title="Edit Order">
                                      <Edit2 size={13} />
                                    </button>
                                    <button className="btn-v-ghost" style={{ padding: 4, color: '#ee0000' }} onClick={() => handleDelete(p._id, p.clientUsername)} title="Delete Order">
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* KANBAN VIEW (Personal vs Team) */
              <div className="v-kanban-board">
                {workspaceMode === 'team'
                  ? ['Wip', 'Delivered', 'Done', 'NRA', 'Need Requirements', 'Cancel'].map((colStatus) => {
                      const colItems = filteredTeamProjects.filter(
                        (p) => (p.orderStatus || 'Wip').toLowerCase() === colStatus.toLowerCase()
                      );
                      const colGross = colItems.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);

                      return (
                        <div key={colStatus} className="v-kanban-col">
                          <div className="v-kanban-header">
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                              {colStatus}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                                ${colGross.toFixed(0)}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--accents-5)', background: 'var(--accents-1)', padding: '0.1rem 0.4rem', borderRadius: 4, border: '1px solid var(--border-default)' }}>
                                {colItems.length}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {colItems.map((p) => {
                              const gross = parseFloat(p.amount) || 0;
                              const net = parseFloat(p.netAmount) || gross * 0.8;
                              const members = Array.isArray(p.assignedMembers) ? p.assignedMembers : [];

                              return (
                                <div key={p._id} className="v-kanban-card">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                      {p.orderNumber || p.clientUserId}
                                    </span>
                                    <span className="mono-text" style={{ color: '#10b981', fontWeight: 600 }}>
                                      ${gross}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--accents-5)' }}>
                                    <span>{p.salesPerson} • {p.profileName}</span>
                                    <span className="mono-text" style={{ color: '#38bdf8' }}>Net: ${net.toFixed(0)}</span>
                                  </div>

                                  <div className="member-chip-wrapper" style={{ marginTop: 2 }}>
                                    {members.map((m, idx) => (
                                      <span key={idx} className="member-chip" style={{ fontSize: '0.65rem', padding: '0.08rem 0.4rem' }}>
                                        {m}
                                      </span>
                                    ))}
                                  </div>

                                  {p.remark && (
                                    <div style={{ fontSize: '0.73rem', color: 'var(--accents-6)', background: 'var(--accents-1)', padding: '0.35rem 0.5rem', borderRadius: 4, borderLeft: '2px solid var(--border-highlight)' }}>
                                      {p.remark}
                                    </div>
                                  )}

                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem' }}>
                                    <span style={{ color: 'var(--accents-5)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Clock size={11} /> {p.estimatedDeliveryDate || p.assignDate || 'No date'}
                                    </span>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                      <button className="btn-v-ghost" style={{ padding: 2 }} onClick={() => openEditTeamModal(p)}>
                                        <Edit2 size={12} />
                                      </button>
                                      <button className="btn-v-ghost" style={{ padding: 2, color: '#ef4444' }} onClick={() => handleTeamDelete(p._id)}>
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  : ['Assigned', 'Wip', 'Issue', 'Delivered', 'Done'].map((colStatus) => {
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
                                {['Owner', 'admin'].includes(session?.user?.role) && (
                                  <div style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                                    <input 
                                      type="checkbox"
                                      checked={selectedTeamOrders.includes(p._id)}
                                      onChange={() => toggleSelectOrder(p._id)}
                                      style={{ cursor: 'pointer' }}
                                    />
                                  </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.clientUsername}</span>
                                    {currentTab.toLowerCase() === currentCalendarMonth.toLowerCase() && p.month && p.month.toLowerCase() !== currentCalendarMonth.toLowerCase() && (
                                      <span style={{ fontSize: '0.62rem', padding: '0.05rem 0.3rem', borderRadius: 3, background: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.25)', fontWeight: 500 }} title={`Assigned in ${p.month}`}>
                                        {p.month}
                                      </span>
                                    )}
                                  </div>
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
                  {/* Smart Raw Paste Box for Personal Orders */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(16, 185, 129, 0.08))',
                    border: '1px dashed rgba(56, 189, 248, 0.4)',
                    borderRadius: 8,
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    marginBottom: '1.2rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 600, color: '#38bdf8' }}>
                        <Sparkles size={15} />
                        <span>⚡ Smart Quick Auto-Fill (Copy & Paste Raw Text)</span>
                      </div>
                      {personalPasteSuccess && (
                        <span style={{ fontSize: '0.73rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Check size={12} /> Auto-filled!
                        </span>
                      )}
                    </div>
                    <textarea
                      className="v-input"
                      rows={2}
                      style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}
                      placeholder="Paste raw Google Sheet row/text here to auto-fill..."
                      value={personalRawText}
                      onPaste={handlePersonalTextareaPaste}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPersonalRawText(val);
                        if (val.trim()) {
                          handlePersonalQuickPaste(val);
                        }
                      }}
                    />
                  </div>

                  <div className="v-form-grid">
                    <div className="v-form-group">
                      <label>Assign Date *</label>
                      <input
                        type="date"
                        className="v-input"
                        value={formData.assignDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          const autoM = getMonthFromDate(val, formData.month);
                          setFormData({ ...formData, assignDate: val, month: autoM });
                        }}
                        required
                      />
                    </div>
                    <div className="v-form-group">
                      <label>Month (Auto-synced)</label>
                      <select className="v-select" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })}>
                        {MONTH_LIST.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="v-form-group">
                      <label>Sales Person</label>
                      <input type="text" className="v-input" placeholder="e.g. Shuvo" value={formData.salesPerson} onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })} />
                    </div>
                    <div className="v-form-group">
                      <label>Client Username / ID *</label>
                      <input type="text" className="v-input" placeholder="e.g. darlanjoubert" value={formData.clientUsername} onChange={(e) => setFormData({ ...formData, clientUsername: e.target.value })} required />
                    </div>
                    <div className="v-form-group">
                      <label>Order Number</label>
                      <input type="text" className="v-input mono-text" placeholder="e.g. FO1705781001" value={formData.orderNumber} onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })} />
                    </div>
                    <div className="v-form-group">
                      <label>Profile Name *</label>
                      <input type="text" className="v-input" placeholder="e.g. LeadsBridge, WpStellar" value={formData.profileName} onChange={(e) => setFormData({ ...formData, profileName: e.target.value })} required />
                    </div>
                    <div className="v-form-group">
                      <label>Gross Amount ($) *</label>
                      <input type="number" step="0.01" className="v-input mono-text" placeholder="e.g. 200" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
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
                        <option value="Delivered">Delivered</option>
                        <option value="Done">Done</option>
                        <option value="NRA">NRA</option>
                        <option value="Need Requirements">Need Requirements</option>
                        <option value="Cancel">Cancel</option>
                        {['delivered', 'done', 'issue'].includes((formData.orderStatus || '').toLowerCase()) && (
                          <option value="Issue">Issue</option>
                        )}
                      </select>
                    </div>
                    <div className="v-form-group">
                      <label>Issue Status</label>
                      <select className="v-select" value={formData.currentStatus || 'All Sorted'} onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}>
                        <option value="All Sorted">All Sorted</option>
                        <option value="Issue">Issue</option>
                        <option value="WIP">WIP</option>
                        <option value="Solved">Solved</option>
                      </select>
                    </div>
                    <div className="v-form-group">
                      <label>Estimated Delivery Date</label>
                      <input type="date" className="v-input" value={formData.estimatedDeliveryDate || formData.deadline} onChange={(e) => setFormData({ ...formData, estimatedDeliveryDate: e.target.value, deadline: e.target.value })} />
                    </div>
                    <div className="v-form-group">
                      <label>Actual Delivery Date</label>
                      <input type="date" className="v-input" value={formData.deliveryDate} onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })} />
                    </div>
                    <div className="v-form-group">
                      <label>Order Type</label>
                      <select className="v-select" value={formData.timeSchedule} onChange={(e) => setFormData({ ...formData, timeSchedule: e.target.value })}>
                        <option value="Fresh Query">Fresh Query</option>
                        <option value="Repeat">Repeat Order</option>
                        <option value="Add-on">Add-on</option>
                      </select>
                    </div>
                    <div className="v-form-group full">
                      <label>Instruction Sheet / Brief URL</label>
                      <input type="url" className="v-input" placeholder="https://docs.google.com/..." value={formData.instructionSheet} onChange={(e) => setFormData({ ...formData, instructionSheet: e.target.value })} />
                    </div>
                    <div className="v-form-group">
                      <label>Staging Subdomain</label>
                      <input type="url" className="v-input" placeholder="https://client.wpcoreweb.com/" value={formData.ourSubdomain} onChange={(e) => setFormData({ ...formData, ourSubdomain: e.target.value })} />
                    </div>
                    <div className="v-form-group">
                      <label>Client Live Domain</label>
                      <input type="url" className="v-input" placeholder="https://clientdomain.com/" value={formData.clientDomain} onChange={(e) => setFormData({ ...formData, clientDomain: e.target.value })} />
                    </div>
                    <div className="v-form-group full">
                      <label>Remark / Notes</label>
                      <input type="text" className="v-input" placeholder="Special notes, instructions, or developer comments..." value={formData.notes || formData.remark} onChange={(e) => setFormData({ ...formData, notes: e.target.value, remark: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="v-modal-footer">
                  <button type="button" className="btn-v btn-v-secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-v btn-v-primary"
                    disabled={isSubmitting}
                    style={{ minWidth: 140, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
                  >
                    {isSubmitting && <div className="status-saving-spinner" style={{ width: 13, height: 13, borderWidth: 2 }} />}
                    <span>
                      {isSubmitting
                        ? (activeProject ? 'Updating Order...' : 'Creating Order...')
                        : (activeProject ? 'Save Changes' : 'Create Order')}
                    </span>
                  </button>
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

        {/* Team Order Modal */}
        <TeamOrderModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          onSubmit={handleTeamSubmit}
          isSubmitting={teamIsSubmitting}
          formData={teamFormData}
          setFormData={setTeamFormData}
          isEdit={!!activeTeamProject}
        />

        {/* Shared Auth Modal */}
        {renderAuthModal()}

        {/* ISSUE NOTE QUICK CHECK MODAL */}
        {isIssueNoteModalOpen && issueNoteProject && (
          <div className="v-modal-overlay" onClick={closeIssueNoteModal}>
            <div
              className="v-modal-dialog"
              style={{ maxWidth: 500, width: '92%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="v-modal-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--foreground)' }}>
                      📝 Issue & WIP Note
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.55rem',
                        borderRadius: 999,
                        background:
                          (issueNoteProject.currentStatus || 'WIP').toLowerCase() === 'issue'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                        color:
                          (issueNoteProject.currentStatus || 'WIP').toLowerCase() === 'issue'
                            ? '#ef4444'
                            : '#f59e0b',
                        border:
                          (issueNoteProject.currentStatus || 'WIP').toLowerCase() === 'issue'
                            ? '1px solid rgba(239, 68, 68, 0.3)'
                            : '1px solid rgba(245, 158, 11, 0.3)',
                      }}
                    >
                      {issueNoteProject.currentStatus || issueNoteProject.orderStatus || 'WIP'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--accents-5)', marginTop: 4 }}>
                    Order #{issueNoteProject.orderNumber || '-'} • {issueNoteProject.clientUsername || issueNoteProject.clientUserId || 'Client'} ({issueNoteProject.profileName || 'Profile'})
                  </div>
                </div>
                <button className="btn-v-ghost" onClick={closeIssueNoteModal}><X size={16} /></button>
              </div>

              <div className="v-modal-body" style={{ paddingTop: '1rem' }}>
                <div className="v-form-group" style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--accents-6)' }}>
                    Issue Status
                  </label>
                  <select
                    className="v-select"
                    value={issueNoteStatus}
                    onChange={(e) => setIssueNoteStatus(e.target.value)}
                    style={{ width: '100%', fontSize: '0.84rem', padding: '0.5rem 0.75rem', borderRadius: 6 }}
                  >
                    <option value="Issue">Issue (Rose Red Flag)</option>
                    <option value="WIP">Issue WIP (Amber Flag)</option>
                    <option value="Solved">Solved (Cyan Solved Flag)</option>
                    <option value="All Sorted">All Sorted (No Issue Flag)</option>
                  </select>
                </div>
                <div className="v-form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--accents-6)' }}>
                    Issue Description & Notes
                  </label>
                  <textarea
                    className="v-textarea"
                    rows={4}
                    value={issueNoteText}
                    onChange={(e) => setIssueNoteText(e.target.value)}
                    placeholder="Type what issue occurred, client instructions, or work-in-progress notes here..."
                    style={{
                      width: '100%',
                      fontSize: '0.84rem',
                      lineHeight: 1.5,
                      padding: '0.65rem 0.8rem',
                      borderRadius: 8,
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--foreground)',
                      resize: 'vertical',
                    }}
                    autoFocus
                  />
                </div>
              </div>

              <div className="v-modal-footer" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  className="btn-v btn-v-secondary"
                  onClick={closeIssueNoteModal}
                  disabled={isIssueNoteSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-v btn-v-primary"
                  onClick={handleSaveIssueNote}
                  disabled={isIssueNoteSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {isIssueNoteSaving ? (
                    <>
                      <div className="status-saving-spinner" style={{ width: 13, height: 13 }} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Note</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Bulk Action Bar for Team Workspace */}
        {workspaceMode === 'team' && selectedTeamOrders.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-default)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            padding: '0.75rem 1.5rem',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            zIndex: 999
          }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground)' }}>
              {selectedTeamOrders.length} Order{selectedTeamOrders.length > 1 ? 's' : ''} Selected
            </span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="btn-v-ghost" 
                onClick={() => setSelectedTeamOrders([])}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                Clear
              </button>
              <button 
                className="btn-v btn-v-primary" 
                style={{ background: '#ef4444', borderColor: '#ef4444', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setIsBulkDeleteModalOpen(true)}
              >
                <Trash2 size={14} style={{ marginRight: 6 }} /> Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {isBulkDeleteModalOpen && (
          <div className="v-modal-overlay">
            <div className="v-modal" style={{ maxWidth: 400 }}>
              <div className="v-modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <h3 className="v-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }}>
                  <AlertCircle size={20} /> Bulk Delete Confirmation
                </h3>
                <button className="v-modal-close" onClick={() => { setIsBulkDeleteModalOpen(false); setBulkDeleteConfirmText(''); }}>
                  <X size={18} />
                </button>
              </div>
              <div className="v-modal-body" style={{ paddingTop: '0.5rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--accents-6)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  You are about to permanently delete <strong>{selectedTeamOrders.length} team order{selectedTeamOrders.length > 1 ? 's' : ''}</strong>. 
                  This action <strong>cannot</strong> be undone and will remove these orders from all synced personal workspaces as well.
                </p>
                <div className="v-form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground)' }}>
                    Type <code style={{ background: 'var(--accents-2)', padding: '2px 6px', borderRadius: 4, color: '#ef4444' }}>DELETE {selectedTeamOrders.length} ORDERS</code> to confirm
                  </label>
                  <input
                    type="text"
                    className="v-input"
                    style={{ borderColor: bulkDeleteConfirmText === `DELETE ${selectedTeamOrders.length} ORDERS` ? '#10b981' : undefined }}
                    placeholder={`DELETE ${selectedTeamOrders.length} ORDERS`}
                    value={bulkDeleteConfirmText}
                    onChange={(e) => setBulkDeleteConfirmText(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div className="v-modal-footer" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  className="btn-v btn-v-secondary"
                  onClick={() => { setIsBulkDeleteModalOpen(false); setBulkDeleteConfirmText(''); }}
                  disabled={isBulkDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-v btn-v-primary"
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting || bulkDeleteConfirmText !== `DELETE ${selectedTeamOrders.length} ORDERS`}
                  style={{ 
                    background: bulkDeleteConfirmText === `DELETE ${selectedTeamOrders.length} ORDERS` ? '#ef4444' : 'var(--accents-3)', 
                    borderColor: bulkDeleteConfirmText === `DELETE ${selectedTeamOrders.length} ORDERS` ? '#ef4444' : 'var(--border-subtle)',
                    color: bulkDeleteConfirmText === `DELETE ${selectedTeamOrders.length} ORDERS` ? '#fff' : 'var(--accents-5)',
                  }}
                >
                  {isBulkDeleting ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
