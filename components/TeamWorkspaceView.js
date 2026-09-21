'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Table as TableIcon,
  Columns,
  BarChart3,
  DollarSign,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  ChevronDown,
  UserCheck,
  Briefcase,
  Check
} from 'lucide-react';

const STATUS_OPTIONS = [
  'Wip',
  'Delivered',
  'Done',
  'NRA',
  'Cancel',
  'Need Requirements'
];

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

export default function TeamWorkspaceView({
  projects = [],
  isLoading = false,
  searchTerm = '',
  setSearchTerm,
  statusFilter = 'All',
  setStatusFilter,
  selectedMember = 'All',
  setSelectedMember,
  selectedSalesPerson = 'All',
  setSelectedSalesPerson,
  selectedMonth = 'All',
  setSelectedMonth,
  viewMode = 'table', // 'table' | 'kanban' | 'analytics'
  setViewMode,
  onOpenAddModal,
  onEditProject,
  onDeleteProject,
  onQuickUpdateStatus,
  onQuickUpdateCurrentStatus,
  onQuickUpdateDraftCount,
  highlightedOrderId
}) {
  const [activeTab, setActiveTab] = useState(viewMode);
  const { data: session, status } = useSession();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (setViewMode) setViewMode(tab);
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    // Search
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch =
      !term ||
      (p.orderNumber && p.orderNumber.toLowerCase().includes(term)) ||
      (p.clientUserId && p.clientUserId.toLowerCase().includes(term)) ||
      (p.profileName && p.profileName.toLowerCase().includes(term)) ||
      (p.salesPerson && p.salesPerson.toLowerCase().includes(term)) ||
      (p.remark && p.remark.toLowerCase().includes(term)) ||
      (Array.isArray(p.assignedMembers) &&
        p.assignedMembers.some((m) => m.toLowerCase().includes(term)));

    // Status
    const matchesStatus =
      (statusFilter || '').toLowerCase() === 'all' ||
      (p.status && p.status.toLowerCase() === statusFilter.toLowerCase());

    // Member
    const matchesMember =
      (selectedMember || '').toLowerCase() === 'all' ||
      (Array.isArray(p.assignedMembers) &&
        p.assignedMembers.some(
          (m) => m.toLowerCase() === selectedMember.toLowerCase()
        ));

    // Sales Person
    const matchesSales =
      (selectedSalesPerson || '').toLowerCase() === 'all' ||
      (p.salesPerson &&
        p.salesPerson.toLowerCase() === selectedSalesPerson.toLowerCase());

    // Month
    const matchesMonth =
      (selectedMonth || '').toLowerCase() === 'all' ||
      (p.month && p.month.toLowerCase() === selectedMonth.toLowerCase());

    return matchesSearch && matchesStatus && matchesMember && matchesSales && matchesMonth;
  });

  // Calculate Metrics
  const totalOrders = filteredProjects.length;
  const totalGross = filteredProjects.reduce(
    (acc, p) => acc + (parseFloat(p.amount) || 0),
    0
  );
  const totalNet = filteredProjects.reduce(
    (acc, p) => acc + (parseFloat(p.netAmount) || (parseFloat(p.amount) || 0) * 0.8),
    0
  );
  const wipOrders = filteredProjects.filter(
    (p) => (p.status || '').toLowerCase() === 'wip'
  ).length;
  const doneOrders = filteredProjects.filter((p) => {
    const s = (p.status || '').toLowerCase();
    return s === 'done' || s === 'delivered';
  }).length;

  // Extract unique members with counts
  const memberCounts = {};
  projects.forEach((p) => {
    if (Array.isArray(p.assignedMembers)) {
      p.assignedMembers.forEach((m) => {
        if (m) memberCounts[m] = (memberCounts[m] || 0) + 1;
      });
    }
  });
  const memberList = Object.keys(memberCounts).sort(
    (a, b) => memberCounts[b] - memberCounts[a]
  );

  // Extract unique sales persons
  const salesCounts = {};
  projects.forEach((p) => {
    if (p.salesPerson) {
      salesCounts[p.salesPerson] = (salesCounts[p.salesPerson] || 0) + 1;
    }
  });

  const getStatusBadgeStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'wip') return { background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' };
    if (s === 'delivered') return { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
    if (s === 'done') return { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
    if (s === 'nra') return { background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' };
    if (s === 'cancel') return { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
    if (s === 'issue') return { background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.35)' };
    if (s === 'need requirements' || s.includes('need')) return { background: 'rgba(234, 179, 8, 0.15)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.3)' };
    return { background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header & Team Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-default)',
          padding: '1.15rem 1.35rem',
          borderRadius: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--accents-1)',
              border: '1px solid var(--border-highlight)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--geist-foreground)',
            }}
          >
            <Users size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                EleSquad Team Workspace
              </h2>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 999,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                SMT 2025-2026
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--accents-5)', margin: '2px 0 0 0' }}>
              Centralized team order pipeline, multi-member assignments & 80% net tracking
            </p>
          </div>
        </div>

        {/* View Switcher & Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div className="segmented-nav">
            <button
              className={`segmented-item ${activeTab === 'table' ? 'active' : ''}`}
              onClick={() => handleTabChange('table')}
            >
              <TableIcon size={13} style={{ marginRight: 4 }} /> Sheet Table
            </button>
            <button
              className={`segmented-item ${activeTab === 'kanban' ? 'active' : ''}`}
              onClick={() => handleTabChange('kanban')}
            >
              <Columns size={13} style={{ marginRight: 4 }} /> Kanban
            </button>
            <button
              className={`segmented-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => handleTabChange('analytics')}
            >
              <BarChart3 size={13} style={{ marginRight: 4 }} /> Team Stats
            </button>
          </div>

          {status === 'authenticated' && session?.user && !['Member', 'Visitor'].includes(session.user.role) && (
            <button className="btn-v btn-v-primary" onClick={onOpenAddModal} style={{ gap: '0.4rem' }}>
              <Plus size={14} /> Add Team Order
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem' }}>
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accents-5)', fontWeight: 500 }}>Total Orders</span>
            <FileSpreadsheet size={16} color="var(--accents-5)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.1 }}>{totalOrders}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accents-5)' }}>Filtered count</div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accents-5)', fontWeight: 500 }}>Gross Amount</span>
            <DollarSign size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', lineHeight: 1.1 }}>
            ${totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accents-5)' }}>100% Client Total</div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accents-5)', fontWeight: 500 }}>Net Share (80%)</span>
            <DollarSign size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8', lineHeight: 1.1 }}>
            ${totalNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accents-5)' }}>Net team payout pool</div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accents-5)', fontWeight: 500 }}>In Progress (WIP)</span>
            <Clock size={16} color="#f5a623" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f5a623', lineHeight: 1.1 }}>{wipOrders}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accents-5)' }}>Active delivery queue</div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accents-5)', fontWeight: 500 }}>Delivered / Done</span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', lineHeight: 1.1 }}>{doneOrders}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accents-5)' }}>Completed orders</div>
        </div>
      </div>

      {/* Member Quick Filter Bar */}
      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-default)',
          padding: '0.65rem 0.85rem',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accents-5)', fontSize: '0.74rem', fontWeight: 600, textTransform: 'uppercase', paddingRight: '0.35rem', flexShrink: 0 }}>
          <UserCheck size={14} /> Assignee:
        </div>
        <button
          onClick={() => setSelectedMember('All')}
          className={`btn-v ${selectedMember === 'All' ? 'btn-v-primary' : 'btn-v-secondary'}`}
          style={{ height: 28, padding: '0 0.65rem', fontSize: '0.74rem', flexShrink: 0 }}
        >
          All Members ({projects.length})
        </button>
        {memberList.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMember(m)}
            className={`btn-v ${selectedMember.toLowerCase() === m.toLowerCase() ? 'btn-v-primary' : 'btn-v-secondary'}`}
            style={{ height: 28, padding: '0 0.65rem', fontSize: '0.74rem', flexShrink: 0, gap: '0.35rem' }}
          >
            <span>{m}</span>
            <span
              style={{
                fontSize: '0.65rem',
                padding: '0.05rem 0.35rem',
                borderRadius: 999,
                background: selectedMember.toLowerCase() === m.toLowerCase() ? 'rgba(0,0,0,0.25)' : 'var(--accents-2)',
                color: selectedMember.toLowerCase() === m.toLowerCase() ? '#fff' : 'var(--accents-5)',
              }}
            >
              {memberCounts[m]}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
        {/* Search */}
        <div className="search-bar" style={{ minWidth: 260 }}>
          <Search size={14} />
          <input
            type="text"
            placeholder="Search Order #, Client, Profile, Member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Sales Person Filter */}
        <div className="filter-group">
          <label>Sales:</label>
          <select
            value={selectedSalesPerson}
            onChange={(e) => setSelectedSalesPerson(e.target.value)}
          >
            <option value="All">All Sales Persons</option>
            {Object.keys(salesCounts).map((sp) => (
              <option key={sp} value={sp}>
                {sp} ({salesCounts[sp]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="table-smart-wrapper">
            <div className="table-sub-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div className="sync-pulse-badge">
                  <span className="sync-pulse-dot" />
                  Syncing EleSquad pipeline & team orders...
                </div>
              </div>
            </div>
            <div className="v-table-container">
              <table className="v-table">
                <thead>
                  <tr>
                    <th style={{ width: 100 }}>Assign Date</th>
                    <th style={{ width: 110 }}>Sales Person</th>
                    <th style={{ width: 90 }}>Profile</th>
                    <th style={{ width: 120 }}>Client ID</th>
                    <th style={{ width: 130 }}>Order #</th>
                    <th style={{ width: 90 }}>Gross</th>
                    <th style={{ width: 90 }}>Net (80%)</th>
                    <th style={{ width: 180 }}>Assigned Members</th>
                    <th style={{ width: 100 }}>Est. Deli</th>
                    <th style={{ width: 100 }}>Deli Date</th>
                    <th style={{ width: 110 }}>Order Status</th>
                    <th style={{ width: 120 }}>Issue Status</th>
                    <th style={{ width: 90 }}>Sheet / Payout</th>
                    <th style={{ width: 150 }}>Remark</th>
                    <th style={{ width: 80, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((row, idx) => (
                    <tr key={row} className="skeleton-row">
                      <td><div className="skeleton-shimmer" style={{ width: '75%', height: 12, animationDelay: `${idx * 0.04}s` }} /></td>
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
      ) : filteredProjects.length === 0 ? (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '3.5rem 1rem', textAlign: 'center' }}>
          <FileSpreadsheet size={40} color="var(--accents-4)" style={{ margin: '0 auto 0.75rem auto' }} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>No team orders found</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--accents-5)', marginTop: 4 }}>
            Try adjusting your search query, status filters, or assigned team member selection.
          </p>
          <button onClick={onOpenAddModal} className="btn-v btn-v-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            <Plus size={13} /> Add New Team Order
          </button>
        </div>
      ) : activeTab === 'table' ? (
        /* TABLE VIEW (Google Sheet Columns) */
        <div className="table-wrapper">
          <div className="sticky-table-container">
            <table className="v-table">
              <thead>
                <tr>
                  <th style={{ width: 100 }}>Assign Date</th>
                  <th style={{ width: 110 }}>Sales Person</th>
                  <th style={{ width: 90 }}>Profile</th>
                  <th style={{ width: 120 }}>Client ID</th>
                  <th style={{ width: 130 }}>Order #</th>
                  <th style={{ width: 90, textAlign: 'right' }}>Amount</th>
                  <th style={{ width: 90, textAlign: 'right' }}>Net (80%)</th>
                  <th style={{ width: 180 }}>Assigned Members</th>
                  <th style={{ width: 100 }}>Est. Deli</th>
                  <th style={{ width: 100 }}>Deli Date</th>
                  <th style={{ width: 120 }}>Status</th>
                  <th style={{ width: 90 }}>Sheet / Payout</th>
                  <th style={{ width: 150 }}>Remark</th>
                  <th style={{ width: 80, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => {
                  const gross = parseFloat(p.amount) || 0;
                  const net = parseFloat(p.netAmount) || gross * 0.8;
                  const members = Array.isArray(p.assignedMembers)
                    ? p.assignedMembers
                    : [];

                  return (
                    <tr id={`order-row-${p._id}`} key={p._id} className={highlightedOrderId === p._id ? 'v-row-pop-pulse' : ''}>
                      {/* Assign Date */}
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--geist-foreground)' }}>
                          {p.assignDate || '—'}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--accents-5)' }}>
                          {p.month || ''}
                        </div>
                      </td>

                      {/* Sales Person */}
                      <td>
                        <span style={{ fontWeight: 500, color: 'var(--geist-foreground)' }}>
                          {p.salesPerson || '—'}
                        </span>
                      </td>

                      {/* Profile Name */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontFamily: 'var(--font-mono)',
                            background: 'var(--accents-1)',
                            padding: '0.15rem 0.4rem',
                            borderRadius: 4,
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {p.profileName || '—'}
                        </span>
                      </td>

                      {/* Client User ID */}
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--geist-foreground)' }}>
                          {p.clientUserId || '—'}
                        </span>
                      </td>

                      {/* Order Number */}
                      <td>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: 'var(--geist-foreground)',
                          }}
                        >
                          {p.orderNumber || '—'}
                        </span>
                      </td>

                      {/* Gross Amount */}
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>
                        ${gross.toFixed(2)}
                      </td>

                      {/* Net Amount (80%) */}
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>
                        ${net.toFixed(2)}
                      </td>

                      {/* Assigned Members (Multi-Tag) */}
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {members.length > 0 ? (
                            members.map((m, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '0.1rem 0.45rem',
                                  borderRadius: 999,
                                  background: 'var(--accents-2)',
                                  color: 'var(--geist-foreground)',
                                  border: '1px solid var(--border-default)',
                                  fontWeight: 500,
                                }}
                              >
                                {m}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: 'var(--accents-4)', fontStyle: 'italic', fontSize: '0.72rem' }}>
                              Unassigned
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Est. Delivery */}
                      <td style={{ color: 'var(--accents-5)', fontSize: '0.75rem' }}>
                        {p.estimatedDeliveryDate || '—'}
                      </td>

                      {/* Deli Date */}
                      <td style={{ color: 'var(--accents-5)', fontSize: '0.75rem' }}>
                        {p.deliveryDate || '—'}
                      </td>

                      {/* Status with Quick Select & Draft Badge */}
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <select
                            value={p.status || p.orderStatus || 'Wip'}
                            onChange={(e) =>
                              onQuickUpdateStatus &&
                              onQuickUpdateStatus(p._id, e.target.value)
                            }
                            style={{
                              ...getStatusBadgeStyle(p.status || p.orderStatus),
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              padding: '0.2rem 0.5rem',
                              borderRadius: 999,
                              cursor: 'pointer',
                              outline: 'none',
                            }}
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st} style={{ background: 'var(--card-bg)', color: 'var(--geist-foreground)' }}>
                                {st}
                              </option>
                            ))}
                            {(['delivered', 'done', 'issue'].includes((p.status || p.orderStatus || '').toLowerCase()) || (p.draftCount && p.draftCount > 0)) && (
                              <option value="Issue" style={{ background: 'var(--card-bg)', color: 'var(--geist-foreground)' }}>
                                Issue
                              </option>
                            )}
                          </select>

                          {/* Draft Count Badge & Controls */}
                          {p.draftCount && p.draftCount > 0 ? (
                            <div className="v-draft-wrapper" title={`Draft ${p.draftCount} delivered`}>
                              <button
                                type="button"
                                className="v-draft-btn-dec"
                                title="Decrease Draft Count"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onQuickUpdateDraftCount) {
                                    onQuickUpdateDraftCount(p._id, Math.max(0, (p.draftCount || 1) - 1));
                                  }
                                }}
                              >
                                -
                              </button>
                              <span className="v-draft-label">Draft #{p.draftCount}</span>
                              <button
                                type="button"
                                className="v-draft-btn-inc"
                                title="Increase Draft Count"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onQuickUpdateDraftCount) {
                                    onQuickUpdateDraftCount(p._id, (p.draftCount || 0) + 1);
                                  }
                                }}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="v-draft-add-btn"
                              title="Mark First Draft Delivered"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onQuickUpdateDraftCount) {
                                  onQuickUpdateDraftCount(p._id, 1);
                                }
                              }}
                            >
                              + Draft
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Current Status with Quick Select */}
                      <td>
                        {(() => {
                          const effCStatus = getEffectiveCurrentStatus(p);
                          const cStatusLower = effCStatus.toLowerCase();
                          const cStatusClass =
                            cStatusLower === 'issue'
                              ? 'v-cstatus-issue'
                              : cStatusLower === 'wip'
                              ? 'v-cstatus-wip'
                              : cStatusLower === 'solved'
                              ? 'v-cstatus-solved'
                              : 'v-cstatus-all-sorted';

                          return (
                            <div className={`v-cstatus-badge ${cStatusClass}`}>
                              <span className="v-cstatus-dot"></span>
                              <select
                                value={effCStatus}
                                onChange={(e) =>
                                  onQuickUpdateCurrentStatus &&
                                  onQuickUpdateCurrentStatus(p._id, e.target.value)
                                }
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
                              >
                                <option value="All Sorted">All Sorted</option>
                                <option value="Issue">Issue</option>
                                <option value="WIP">WIP</option>
                                <option value="Solved">Solved</option>
                              </select>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Sheet Link / Payout */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {p.sheetLink ? (
                            <a
                              href={p.sheetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-v-ghost"
                              style={{ padding: 3 }}
                              title="Open External Sheet"
                            >
                              <ExternalLink size={13} />
                            </a>
                          ) : null}
                          {p.percentage ? (
                            <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--accents-5)' }}>
                              ${p.percentage}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Remark */}
                      <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--accents-6)' }}>
                        {p.remark || '—'}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                          <button
                            className="btn-v-ghost"
                            style={{ padding: 3 }}
                            onClick={() => onEditProject(p)}
                            title="Edit Team Order"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn-v-ghost"
                            style={{ padding: 3, color: '#ef4444' }}
                            onClick={() => onDeleteProject(p._id)}
                            title="Delete Order"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'start' }}>
          {STATUS_OPTIONS.map((columnStatus) => {
            const columnProjects = filteredProjects.filter(
              (p) =>
                (p.status || '').toLowerCase() === columnStatus.toLowerCase()
            );
            const columnGross = columnProjects.reduce(
              (acc, p) => acc + (parseFloat(p.amount) || 0),
              0
            );

            return (
              <div
                key={columnStatus}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 10,
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  minHeight: 350,
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background:
                          columnStatus === 'Wip'
                            ? '#0284c7'
                            : columnStatus === 'Done' || columnStatus === 'Delivered'
                            ? '#10b981'
                            : columnStatus === 'Cancel'
                            ? '#ef4444'
                            : columnStatus === 'NRA'
                            ? '#a855f7'
                            : '#eab308',
                      }}
                    />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                      {columnStatus}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '0.05rem 0.35rem',
                        borderRadius: 999,
                        background: 'var(--accents-2)',
                        color: 'var(--accents-6)',
                      }}
                    >
                      {columnProjects.length}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#10b981' }}>
                    ${columnGross.toFixed(0)}
                  </span>
                </div>

                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                  {columnProjects.map((p) => {
                    const gross = parseFloat(p.amount) || 0;
                    const net = parseFloat(p.netAmount) || gross * 0.8;
                    const members = Array.isArray(p.assignedMembers)
                      ? p.assignedMembers
                      : [];

                    return (
                      <div
                        key={p._id}
                        className="v-kanban-card"
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700 }}>
                            {p.orderNumber || 'No Order #'}
                          </span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#10b981' }}>
                            ${gross}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--accents-5)' }}>
                          <span>{p.clientUserId || 'Client'}</span>
                          <span style={{ color: '#38bdf8', fontWeight: 600 }}>Net: ${net.toFixed(0)}</span>
                        </div>

                        {/* Assigned Members */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {members.map((m, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '0.65rem',
                                padding: '0.08rem 0.4rem',
                                borderRadius: 4,
                                background: 'var(--accents-1)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--geist-foreground)',
                              }}
                            >
                              {m}
                            </span>
                          ))}
                        </div>

                        {/* Date & Action Footer */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: '0.35rem',
                            borderTop: '1px solid var(--border-subtle)',
                            fontSize: '0.7rem',
                            color: 'var(--accents-5)',
                          }}
                        >
                          <span>{p.estimatedDeliveryDate || p.assignDate || ''}</span>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              className="btn-v-ghost"
                              style={{ padding: 2 }}
                              onClick={() => onEditProject(p)}
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              className="btn-v-ghost"
                              style={{ padding: 2, color: '#ef4444' }}
                              onClick={() => onDeleteProject(p._id)}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ANALYTICS / TEAM PERFORMANCE VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {/* Member Workload Breakdown */}
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-default)',
              padding: '1.25rem',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} color="var(--accents-5)" /> Member Workload & Order Volume
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {memberList.map((member) => {
                const count = memberCounts[member] || 0;
                const pct = Math.round((count / (projects.length || 1)) * 100);
                const memberGross = projects
                  .filter(
                    (p) =>
                      Array.isArray(p.assignedMembers) &&
                      p.assignedMembers.includes(member)
                  )
                  .reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);

                return (
                  <div key={member} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ fontWeight: 600 }}>{member}</span>
                      <div style={{ display: 'flex', gap: '0.65rem' }}>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>${memberGross.toFixed(0)}</span>
                        <span style={{ color: 'var(--accents-5)' }}>
                          {count} orders ({pct}%)
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: 6,
                        borderRadius: 999,
                        background: 'var(--accents-2)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(pct * 2, 100)}%`,
                          height: '100%',
                          background: 'var(--geist-foreground)',
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sales Person Breakdown */}
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-default)',
              padding: '1.25rem',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={16} color="var(--accents-5)" /> Sales Person Pipeline Share
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {Object.keys(salesCounts).map((sp) => {
                const count = salesCounts[sp];
                const pct = Math.round((count / (projects.length || 1)) * 100);
                const spGross = projects
                  .filter((p) => p.salesPerson === sp)
                  .reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);

                return (
                  <div key={sp} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ fontWeight: 600 }}>{sp}</span>
                      <div style={{ display: 'flex', gap: '0.65rem' }}>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>${spGross.toFixed(0)}</span>
                        <span style={{ color: 'var(--accents-5)' }}>
                          {count} orders ({pct}%)
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: 6,
                        borderRadius: 999,
                        background: 'var(--accents-2)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: '#10b981',
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
