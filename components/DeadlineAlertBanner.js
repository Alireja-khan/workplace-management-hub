'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Clock, AlertTriangle, Flame, ArrowUpRight, ChevronRight } from 'lucide-react';

const REMINDER_MESSAGES = [
  "Time is flying! {timeRemaining} left for #{orderNumber}.",
  "The clock is ticking on #{orderNumber}! {timeRemaining} remaining.",
  "Friendly ping! #{orderNumber}'s deadline is in {timeRemaining}.",
  "Delivering #{orderNumber} on time brings 5-star reviews! ⏳ {timeRemaining} left.",
  "Order #{orderNumber} countdown: {timeRemaining}.",
  "Stay in the flow! #{orderNumber} deadline is in {timeRemaining}.",
  "Clock tickin'! {timeRemaining} left on #{orderNumber}.",
  "Speed run mode! #{orderNumber} is due in {timeRemaining}."
];

/**
 * Robust date parser supporting MM/DD/YYYY, YYYY-MM-DD, ISO, and Date strings
 */
export function parseDeadlineMs(deadlineStr) {
  if (!deadlineStr || typeof deadlineStr !== 'string') return NaN;
  const str = deadlineStr.trim();
  if (!str) return NaN;

  // 1. ISO format with 'T': e.g. "2026-09-24T18:00"
  if (str.includes('T')) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  // 2. Format with slashes: e.g. "09/24/2026"
  if (str.includes('/')) {
    const parts = str.split(' ');
    const datePart = parts[0];
    const timePart = parts[1] || '23:59:59';
    const dateBits = datePart.split('/');
    if (dateBits.length === 3) {
      const [m, d, y] = dateBits;
      if (m && d && y) {
        const isoStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${timePart.includes(':') ? (timePart.split(':').length === 2 ? `${timePart}:00` : timePart) : '23:59:59'}`;
        const parsed = new Date(isoStr);
        if (!isNaN(parsed.getTime())) return parsed.getTime();
      }
    }
  }

  // 3. Format YYYY-MM-DD (no T): e.g. "2026-09-24"
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = new Date(`${str}T23:59:59`);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  // 4. Fallback direct parse
  const direct = new Date(str);
  if (!isNaN(direct.getTime())) return direct.getTime();

  return NaN;
}

export default function DeadlineAlertBanner({
  projects = [],
  session = null,
  workspaceMode = 'personal',
  onLocateOrder = null,
}) {
  const [now, setNow] = useState(Date.now());
  const [msgIndex, setMsgIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate reminder text every 8 seconds
  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % REMINDER_MESSAGES.length);
    }, 8000);
    return () => clearInterval(msgTimer);
  }, []);

  // Filter urgent candidates with deadline <= 72 hours (or overdue)
  const urgentCandidates = useMemo(() => {
    if (!projects || !Array.isArray(projects) || projects.length === 0) return [];

    const currentUserName = (session?.user?.assignedName || session?.user?.name || '').toLowerCase().trim();
    const currentUserEmail = (session?.user?.email || '').toLowerCase().trim();
    const role = session?.user?.role || 'Member';
    const isLeaderOrOwner = ['Owner', 'Leader', 'Co-Leader', 'admin'].includes(role);

    const filtered = projects.filter((p) => {
      if (!p || !p.deadline) return false;

      const statusLower = (p.orderStatus || p.status || 'Wip').toLowerCase();
      // Skip completed or cancelled orders
      if (['done', 'delivered', 'cancel'].includes(statusLower)) return false;

      // Filter by member assignment (only in team mode for non-leaders):
      if (workspaceMode === 'team' && !isLeaderOrOwner && currentUserName) {
        const isAssigned = Array.isArray(p.assignedMembers) &&
          p.assignedMembers.some((m) => m && m.toLowerCase().trim().includes(currentUserName));
        const isUserEmail = p.userEmail && currentUserEmail && p.userEmail.toLowerCase() === currentUserEmail;
        if (!isAssigned && !isUserEmail) return false;
      }

      // Parse deadline ms
      const deadlineMs = parseDeadlineMs(p.deadline);
      if (isNaN(deadlineMs)) return false;

      const diffMs = deadlineMs - now;
      const diffHours = diffMs / (1000 * 60 * 60);

      // Trigger if deadline <= 72 hours (3 days) or overdue
      return diffHours <= 72;
    });

    // Sort candidates by most urgent deadline first (smallest deadlineMs)
    filtered.sort((a, b) => parseDeadlineMs(a.deadline) - parseDeadlineMs(b.deadline));

    return filtered;
  }, [projects, session, workspaceMode, now]);

  useEffect(() => {
    if (selectedIndex >= urgentCandidates.length) {
      setSelectedIndex(0);
    }
  }, [urgentCandidates.length, selectedIndex]);

  if (!urgentCandidates || urgentCandidates.length === 0) {
    return null;
  }

  const urgentOrder = urgentCandidates[selectedIndex] || urgentCandidates[0];
  const candidateCount = urgentCandidates.length;

  // Calculate remaining time
  const deadlineMs = parseDeadlineMs(urgentOrder.deadline);
  const diffMs = deadlineMs - now;
  const isLate = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((absDiff % (1000 * 60)) / 1000);

  const formatUnit = (n) => (n < 10 ? `0${n}` : `${n}`);
  const timeFormatted = `${days > 0 ? `${days}d ` : ''}${formatUnit(hours)}h ${formatUnit(mins)}m ${formatUnit(secs)}s`;

  const memberName = (Array.isArray(urgentOrder.assignedMembers) && urgentOrder.assignedMembers[0]) ||
    urgentOrder.clientUsername ||
    session?.user?.assignedName ||
    session?.user?.name ||
    'Member';

  const orderNumber = urgentOrder.orderNumber || urgentOrder.clientUserId || 'Order';

  // Format message text
  const currentRawMsg = REMINDER_MESSAGES[msgIndex % REMINDER_MESSAGES.length];
  const customMsg = currentRawMsg
    .replace(/{name}/g, memberName)
    .replace(/{orderNumber}/g, orderNumber)
    .replace(/{timeRemaining}/g, timeFormatted);

  const remainingHours = diffMs / (1000 * 60 * 60);
  const urgencyTitle = isLate
    ? `OVERDUE (${timeFormatted})`
    : remainingHours <= 48
    ? `DUE IN ${timeFormatted}`
    : `DUE IN ${days > 0 ? `${days}d ` : ''}${hours}h`;

  const clientName = urgentOrder.clientUserId || urgentOrder.clientUsername || '';

  return (
    <div className="v-minimal-banner-root">
      <div className="v-minimal-banner-card" onClick={() => onLocateOrder && onLocateOrder(urgentOrder)}>
        
        {/* Left Indicator & Live Countdown */}
        <div className="v-minimal-timer-badge">
          <span className="v-minimal-pulse-dot" />
          <span className="v-minimal-timer-text">{timeFormatted}</span>
        </div>

        {/* Center Minimal Text & Pills */}
        <div className="v-minimal-body-center">
          <div className="v-minimal-meta-row">
            <span className="v-minimal-tag-label">{urgencyTitle}</span>
            <span className="v-minimal-member-pill">{memberName}</span>
            <span className="v-minimal-order-pill">#{orderNumber}</span>
            {clientName && <span className="v-minimal-client-pill">{clientName}</span>}
            {candidateCount > 1 && (
              <button
                type="button"
                className="v-minimal-count-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev + 1) % candidateCount);
                }}
                title="Click to view next urgent order"
              >
                {selectedIndex + 1} of {candidateCount} ➔
              </button>
            )}
          </div>
        </div>

        {/* Right Action */}
        <div className="v-minimal-action-right">
          <button
            type="button"
            className="v-minimal-locate-btn"
            onClick={(e) => {
              e.stopPropagation();
              onLocateOrder && onLocateOrder(urgentOrder);
            }}
          >
            <span>Locate</span>
            <ArrowUpRight size={12} />
          </button>
        </div>

      </div>
    </div>
  );
}
