'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Clock, AlertTriangle, Flame, ArrowUpRight, Sparkles, AlertCircle } from 'lucide-react';

const REMINDER_MESSAGES = [
  "Time is flying faster than a client changing their brief! {timeRemaining} left for #{orderNumber}.",
  "The clock is ticking on #{orderNumber}! {timeRemaining} remaining. Let's finish strong!",
  "Friendly ping! Grab a coffee, #{orderNumber}'s deadline is in {timeRemaining}.",
  "Legend says delivering #{orderNumber} on time brings 5-star reviews & good vibes! ⏳ {timeRemaining} left.",
  "Order #{orderNumber} is getting hot! Countdown: {timeRemaining}.",
  "Stay in the flow! #{orderNumber} deadline is in {timeRemaining}. You've got this!",
  "Clock tickin'! {timeRemaining} left on #{orderNumber}. Need an extension or ready to ship?",
  "Speed run mode! #{orderNumber} is due in {timeRemaining}. Let's make magic happen!"
];

/**
 * Robust date parser supporting MM/DD/YYYY, YYYY-MM-DD, ISO, and Date strings
 */
export function parseDeadlineMs(deadlineStr) {
  if (!deadlineStr || typeof deadlineStr !== 'string') return NaN;
  const str = deadlineStr.trim();
  if (!str) return NaN;

  // 1. ISO format with 'T': e.g. "2026-09-24T18:00" or "2026-09-24T18:00:00"
  if (str.includes('T')) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  // 2. Format with slashes: e.g. "09/24/2026" or "09/24/2026 18:00"
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

  // 4. Fallback direct parse: e.g. "Sep 24, 2026"
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

  // Keep selected index valid
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

  // Calculate dynamic opacity & urgency colors
  const remainingHours = diffMs / (1000 * 60 * 60);
  let redOpacity = 0.20;

  if (isLate) {
    redOpacity = 0.95;
  } else if (remainingHours <= 48) {
    const elapsedFrom48 = 48 - remainingHours;
    const steps = Math.floor(elapsedFrom48 / 5);
    redOpacity = Math.min(0.90, 0.55 + steps * 0.07);
  } else {
    const elapsedFrom72 = 72 - remainingHours;
    const steps = Math.floor(elapsedFrom72 / 5);
    redOpacity = Math.min(0.50, 0.20 + steps * 0.06);
  }

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

  const urgencyTitle = isLate
    ? `OVERDUE BY ${timeFormatted}`
    : remainingHours <= 48
    ? `URGENT (<48h)`
    : `DUE IN ${days > 0 ? `${days}d ` : ''}${hours}h`;

  return (
    <div className="v-deadline-banner-root" style={{ '--alert-opacity': redOpacity }}>
      <div className="v-deadline-banner-card" onClick={() => onLocateOrder && onLocateOrder(urgentOrder)}>
        
        {/* Left Section: Live Countdown Badge */}
        <div className={`v-deadline-badge ${isLate ? 'is-late' : remainingHours <= 48 ? 'is-urgent' : 'is-warning'}`}>
          <div className="v-deadline-icon-box">
            {isLate ? (
              <Flame size={15} className="v-pulse-icon" />
            ) : remainingHours <= 48 ? (
              <AlertTriangle size={15} className="v-pulse-icon" />
            ) : (
              <Clock size={15} />
            )}
          </div>
          <div className="v-deadline-time-stack">
            <span className="v-deadline-tag-label">{urgencyTitle}</span>
            <span className="v-deadline-time-val">{timeFormatted}</span>
          </div>
        </div>

        {/* Center Section: Creative Message & Order Pill */}
        <div className="v-deadline-body-center">
          <div className="v-deadline-meta-row">
            <span className="v-deadline-member-pill">👤 {memberName}</span>
            <span className="v-deadline-order-pill">#{orderNumber}</span>
            {candidateCount > 1 && (
              <button
                type="button"
                className="v-deadline-count-pill"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev + 1) % candidateCount);
                }}
                title="Click to view next urgent order"
              >
                Order {selectedIndex + 1} of {candidateCount} ➔
              </button>
            )}
          </div>
          <div className="v-deadline-msg-text">
            {isLate ? (
              <span>🚨 <strong>Action Needed:</strong> Deadline passed! Please deliver or request an extension.</span>
            ) : remainingHours <= 48 ? (
              <span>⚡ <strong>Urgent:</strong> Order is in the final stretch! Ready for delivery?</span>
            ) : (
              <span>{customMsg}</span>
            )}
          </div>
        </div>

        {/* Right Section: Locate Action */}
        <div className="v-deadline-action-right">
          <button
            type="button"
            className="v-deadline-locate-btn"
            onClick={(e) => {
              e.stopPropagation();
              onLocateOrder && onLocateOrder(urgentOrder);
            }}
          >
            <span>Locate</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

      </div>
    </div>
  );
}
