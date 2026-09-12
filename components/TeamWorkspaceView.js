'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Table as TableIcon,
  Kanban as KanbanIcon,
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
  Briefcase
} from 'lucide-react';

const STATUS_OPTIONS = [
  'Wip',
  'Delivered',
  'Done',
  'NRA',
  'Cancel',
  'Need Requirements'
];

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
  onQuickUpdateStatus
}) {
  const [activeTab, setActiveTab] = useState(viewMode);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (setViewMode) setViewMode(tab);
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    // Search
    const term = searchTerm.toLowerCase();
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
      statusFilter === 'All' ||
      (p.status && p.status.toLowerCase() === statusFilter.toLowerCase());

    // Member
    const matchesMember =
      selectedMember === 'All' ||
      (Array.isArray(p.assignedMembers) &&
        p.assignedMembers.some(
          (m) => m.toLowerCase() === selectedMember.toLowerCase()
        ));

    // Sales Person
    const matchesSales =
      selectedSalesPerson === 'All' ||
      (p.salesPerson &&
        p.salesPerson.toLowerCase() === selectedSalesPerson.toLowerCase());

    // Month
    const matchesMonth =
      selectedMonth === 'All' ||
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

  const getStatusBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'wip') return 'v-status-wip';
    if (s === 'delivered') return 'v-status-delivered';
    if (s === 'done') return 'v-status-done';
    if (s === 'nra') return 'v-status-nra';
    if (s === 'cancel') return 'v-status-cancel';
    if (s === 'need requirements' || s.includes('need')) return 'v-status-need';
    return 'v-status-wip';
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Team Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#18181B] border border-[#27272A] p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#27272A] flex items-center justify-center text-white border border-[#3F3F46]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  EleSquad Team Workspace
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                  SMT 2025-2026
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Centralized team order pipeline, multi-member assignments & 80% net tracking
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher & Add Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-[#09090B] p-1 rounded-xl border border-[#27272A]">
            <button
              onClick={() => handleTabChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'table'
                  ? 'bg-[#27272A] text-white shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Sheet Table
            </button>
            <button
              onClick={() => handleTabChange('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'kanban'
                  ? 'bg-[#27272A] text-white shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => handleTabChange('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-[#27272A] text-white shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Team Stats
            </button>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-[#F4F4F5] rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Team Order
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl">
          <div className="text-xs font-medium text-[#A1A1AA] flex items-center justify-between">
            <span>Total Orders</span>
            <FileSpreadsheet className="w-4 h-4 text-[#71717A]" />
          </div>
          <div className="text-xl font-bold text-white mt-1.5">{totalOrders}</div>
          <div className="text-[11px] text-[#71717A] mt-0.5">Matched filters</div>
        </div>

        <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl">
          <div className="text-xs font-medium text-[#A1A1AA] flex items-center justify-between">
            <span>Gross Amount</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white mt-1.5">
            ${totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5">100% Client Total</div>
        </div>

        <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl">
          <div className="text-xs font-medium text-[#A1A1AA] flex items-center justify-between">
            <span>Net Share (80%)</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white mt-1.5">
            ${totalNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#A1A1AA] mt-0.5">Net team payout pool</div>
        </div>

        <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl">
          <div className="text-xs font-medium text-[#A1A1AA] flex items-center justify-between">
            <span>In Progress (WIP)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 mt-1.5">{wipOrders}</div>
          <div className="text-[11px] text-[#71717A] mt-0.5">Active delivery queue</div>
        </div>

        <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl col-span-2 md:col-span-1">
          <div className="text-xs font-medium text-[#A1A1AA] flex items-center justify-between">
            <span>Delivered / Done</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1.5">{doneOrders}</div>
          <div className="text-[11px] text-[#71717A] mt-0.5">Completed successfully</div>
        </div>
      </div>

      {/* Member Quick Filter Pills Bar */}
      <div className="bg-[#18181B] border border-[#27272A] p-3 rounded-xl flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-semibold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5 pl-1 pr-2 shrink-0">
          <UserCheck className="w-3.5 h-3.5 text-[#A1A1AA]" />
          Assignee:
        </span>
        <button
          onClick={() => setSelectedMember('All')}
          className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
            selectedMember === 'All'
              ? 'bg-white text-black font-semibold shadow-sm'
              : 'bg-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#3F3F46]'
          }`}
        >
          All Members ({projects.length})
        </button>
        {memberList.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMember(m)}
            className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 ${
              selectedMember.toLowerCase() === m.toLowerCase()
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'bg-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#3F3F46]'
            }`}
          >
            <span>{m}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedMember.toLowerCase() === m.toLowerCase()
                  ? 'bg-black text-white'
                  : 'bg-[#18181B] text-[#A1A1AA]'
              }`}
            >
              {memberCounts[m]}
            </span>
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search Order #, Client ID, Profile, Member, Remark..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-white transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none focus:outline-none focus:border-white transition-all cursor-pointer"
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" />
        </div>

        {/* Sales Person Filter */}
        <div className="relative">
          <select
            value={selectedSalesPerson}
            onChange={(e) => setSelectedSalesPerson(e.target.value)}
            className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none focus:outline-none focus:border-white transition-all cursor-pointer"
          >
            <option value="All">All Sales Persons</option>
            {Object.keys(salesCounts).map((sp) => (
              <option key={sp} value={sp}>
                {sp} ({salesCounts[sp]})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" />
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-16 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <p className="text-xs text-[#A1A1AA] mt-4 font-medium">
            Loading team pipeline data...
          </p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-16 text-center">
          <FileSpreadsheet className="w-12 h-12 text-[#71717A] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-white">No team orders found</h3>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-sm mx-auto">
            Try adjusting your search query, status filters, or assigned team member selection.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 bg-white text-black font-semibold text-xs rounded-xl hover:bg-[#F4F4F5] transition-all"
          >
            Create First Team Order
          </button>
        </div>
      ) : activeTab === 'table' ? (
        /* TABLE VIEW (Google Sheet Columns) */
        <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#E4E4E7] border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-[#121214] border-b border-[#27272A] text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Assign Date</th>
                  <th className="py-3.5 px-3 font-semibold">Sales Person</th>
                  <th className="py-3.5 px-3 font-semibold">Profile</th>
                  <th className="py-3.5 px-3 font-semibold">Client ID</th>
                  <th className="py-3.5 px-3 font-semibold">Order #</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Amount</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Net (80%)</th>
                  <th className="py-3.5 px-4 font-semibold">Assigned Members</th>
                  <th className="py-3.5 px-3 font-semibold">Est. Deli</th>
                  <th className="py-3.5 px-3 font-semibold">Deli Date</th>
                  <th className="py-3.5 px-3 font-semibold">Status</th>
                  <th className="py-3.5 px-3 font-semibold">Links / Payout</th>
                  <th className="py-3.5 px-4 font-semibold">Remark</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {filteredProjects.map((p) => {
                  const gross = parseFloat(p.amount) || 0;
                  const net = parseFloat(p.netAmount) || gross * 0.8;
                  const members = Array.isArray(p.assignedMembers)
                    ? p.assignedMembers
                    : [];

                  return (
                    <tr
                      key={p._id}
                      className="hover:bg-[#27272A]/50 transition-colors group"
                    >
                      {/* Assign Date & Month */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-white">{p.assignDate || '—'}</div>
                        <div className="text-[10px] text-[#71717A]">{p.month || ''}</div>
                      </td>

                      {/* Sales Person */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-medium text-[#D4D4D8]">
                          {p.salesPerson || '—'}
                        </span>
                      </td>

                      {/* Profile Name */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#27272A] text-[#A1A1AA] text-[11px] font-mono">
                          {p.profileName || '—'}
                        </span>
                      </td>

                      {/* Client User ID */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-medium text-white">{p.clientUserId || '—'}</span>
                      </td>

                      {/* Order Number */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono text-white font-semibold">
                        {p.orderNumber || '—'}
                      </td>

                      {/* Gross Amount */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-right font-medium text-emerald-400">
                        ${gross.toFixed(2)}
                      </td>

                      {/* Net Amount (80%) */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-right font-semibold text-blue-400">
                        ${net.toFixed(2)}
                      </td>

                      {/* Assigned Members (Multi-Tag) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-[200px]">
                          {members.length > 0 ? (
                            members.map((m, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#27272A] text-[#E4E4E7] border border-[#3F3F46]"
                              >
                                {m}
                              </span>
                            ))
                          ) : (
                            <span className="text-[#71717A] italic text-[11px]">
                              Unassigned
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Est. Delivery */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-[#A1A1AA]">
                        {p.estimatedDeliveryDate || '—'}
                      </td>

                      {/* Deli Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-[#A1A1AA]">
                        {p.deliveryDate || '—'}
                      </td>

                      {/* Status with Quick Select */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <select
                          value={p.status || 'Wip'}
                          onChange={(e) =>
                            onQuickUpdateStatus &&
                            onQuickUpdateStatus(p._id, e.target.value)
                          }
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer appearance-none ${getStatusBadgeClass(
                            p.status
                          )}`}
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st} className="bg-[#18181B] text-white">
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Sheet Link / Payout */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {p.sheetLink ? (
                            <a
                              href={p.sheetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white transition-colors"
                              title="Open External Sheet"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : null}
                          {p.percentage ? (
                            <span className="text-[10px] text-[#A1A1AA] font-mono">
                              {p.percentage}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Remark */}
                      <td className="py-3.5 px-4 max-w-[180px] truncate text-[#A1A1AA]">
                        {p.remark || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditProject(p)}
                            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors"
                            title="Edit Team Order"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProject(p._id)}
                            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-red-400 hover:bg-red-950/40 transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-start">
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
                className="bg-[#18181B] border border-[#27272A] rounded-xl p-3 flex flex-col min-h-[400px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#27272A] mb-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        columnStatus === 'Wip'
                          ? 'bg-amber-400'
                          : columnStatus === 'Done' ||
                            columnStatus === 'Delivered'
                          ? 'bg-emerald-400'
                          : columnStatus === 'Cancel'
                          ? 'bg-red-400'
                          : columnStatus === 'NRA'
                          ? 'bg-purple-400'
                          : 'bg-blue-400'
                      }`}
                    ></span>
                    <span className="text-xs font-bold text-white">
                      {columnStatus}
                    </span>
                    <span className="text-[10px] bg-[#27272A] text-[#A1A1AA] px-1.5 py-0.2 rounded-full">
                      {columnProjects.length}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400">
                    ${columnGross.toFixed(0)}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2.5 flex-1">
                  {columnProjects.map((p) => {
                    const gross = parseFloat(p.amount) || 0;
                    const net = parseFloat(p.netAmount) || gross * 0.8;
                    const members = Array.isArray(p.assignedMembers)
                      ? p.assignedMembers
                      : [];

                    return (
                      <div
                        key={p._id}
                        className="bg-[#09090B] border border-[#27272A] hover:border-[#3F3F46] rounded-xl p-3 space-y-2.5 transition-all shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-white">
                            {p.orderNumber || 'No Order #'}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-400">
                            ${gross}
                          </span>
                        </div>

                        <div className="text-[11px] text-[#A1A1AA] flex items-center justify-between">
                          <span>{p.clientUserId || 'Client'}</span>
                          <span className="text-blue-400 font-medium">Net: ${net.toFixed(0)}</span>
                        </div>

                        {/* Assigned Members */}
                        <div className="flex items-center gap-1 flex-wrap pt-1">
                          {members.map((m, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#18181B] text-[#D4D4D8] border border-[#27272A]"
                            >
                              {m}
                            </span>
                          ))}
                        </div>

                        {/* Date & Action Footer */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-[#27272A]/80 text-[10px] text-[#71717A]">
                          <span>{p.estimatedDeliveryDate || p.assignDate || ''}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onEditProject(p)}
                              className="p-1 hover:text-white transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteProject(p._id)}
                              className="p-1 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Member Workload Breakdown */}
          <div className="bg-[#18181B] border border-[#27272A] p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#A1A1AA]" />
              Member Workload & Order Volume
            </h3>
            <div className="space-y-3">
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
                  <div key={member} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{member}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-medium">
                          ${memberGross.toFixed(0)}
                        </span>
                        <span className="text-[#A1A1AA]">
                          {count} orders ({pct}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-[#27272A] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-white h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pct * 2, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sales Person Breakdown */}
          <div className="bg-[#18181B] border border-[#27272A] p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#A1A1AA]" />
              Sales Person Pipeline Share
            </h3>
            <div className="space-y-3">
              {Object.keys(salesCounts).map((sp) => {
                const count = salesCounts[sp];
                const pct = Math.round((count / (projects.length || 1)) * 100);
                const spGross = projects
                  .filter((p) => p.salesPerson === sp)
                  .reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);

                return (
                  <div key={sp} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{sp}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-medium">
                          ${spGross.toFixed(0)}
                        </span>
                        <span className="text-[#A1A1AA]">
                          {count} orders ({pct}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-[#27272A] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
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
