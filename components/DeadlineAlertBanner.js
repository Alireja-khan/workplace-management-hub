'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Clock, AlertTriangle, Flame, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

const REMINDER_MESSAGES = [
  "⏰ Hey {name}! Time is flying faster than a client changing their brief! {timeRemaining} left for #{orderNumber}.",
  "🚀 {name}, the clock is ticking on #{orderNumber}! {timeRemaining} remaining. Let's finish strong!",
  "☕ Friendly ping {name}! Grab a coffee, #{orderNumber}'s deadline is in {timeRemaining}.",
  "🌟 {name}, legend says delivering #{orderNumber} on time brings 5-star reviews & good vibes! ⏳ {timeRemaining} left.",
  "🔥 Alert for {name}: Order #{orderNumber} is getting hot! Countdown: {timeRemaining}.",
  "🎯 {name}, stay in the flow! #{orderNumber} deadline is in {timeRemaining}. You've got this!",
  "💡 {name}, clock tickin'! {timeRemaining} left on #{orderNumber}. Need an extension or ready to ship?",
  "⚡ Speed run mode, {name}! #{orderNumber} is due in {timeRemaining}. Let's make magic happen!"
];

export default function DeadlineAlertBanner({
  projects = [],
  session = null,
  workspaceMode = 'personal',
  onLocateOrder = null,
}) {
  const [now, setNow] = useState(Date.now());
  const [msgIndex, setMsgIndex] = useState(0);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate message every 8 seconds
  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % REMINDER_MESSAGES.length);
    }, 8000);
    return () => clearInterval(msgTimer);
  }, []);

  // Find the most urgent project with deadline <= 72 hours (or overdue)
  const urgentOrder = useMemo(() => {
    if (!projects || projects.length === 0) return null;

    const currentUserName = (session?.user?.assignedName || session?.user?.name || '').toLowerCase().trim();

    const candidates = projects.filter((p) => {
      if (!p.deadline) return false;
      const statusLower = (p.orderStatus || 'Wip').toLowerCase();
      // Skip completed / cancelled orders
      if (['done', 'delivered', 'cancel'].includes(statusLower)) return false;

      // In personal mode or member role, check assigned
      if (workspaceMode === 'personal' && currentUserName) {
        const isAssigned = Array.isArray(p.assignedMembers) && p.assignedMembers.some((m) => m && m.toLowerCase().includes(currentUserName));
        const isUserEmail = p.userEmail && session?.user?.email && p.userEmail.toLowerCase() === session.user.email.toLowerCase();
        if (!isAssigned && !isUserEmail) return false;
      }

      // Parse deadline
      let deadlineMs = 0;
      if (p.deadline.includes('T')) {
        deadlineMs = new Date(p.deadline).getTime();
      } else {
        deadlineMs = new Date(`${p.deadline}T23:59:59`).getTime();
      }

      if (isNaN(deadlineMs)) return false;

      const diffMs = deadlineMs - now;
      const diffHours = diffMs / (1000 * 60 * 60);

      // Trigger if deadline <= 72 hours (3 days) or overdue (diffHours <= 0)
      return diffHours <= 72;
    });

    if (candidates.length === 0) return null;

    // Sort candidates by most urgent deadline (smallest deadlineMs)
    candidates.sort((a, b) => {
      const getMs = (item) => (item.deadline.includes('T') ? new Date(item.deadline).getTime() : new Date(`${item.deadline}T23:59:59`).getTime());
      return getMs(a) - getMs(b);
    });

    return candidates[0];
  }, [projects, session, workspaceMode, now]);

  if (!urgentOrder) return null;

  // Calculate remaining time
  let deadlineMs = 0;
  if (urgentOrder.deadline.includes('T')) {
    deadlineMs = new Date(urgentOrder.deadline).getTime();
  } else {
    deadlineMs = new Date(`${urgentOrder.deadline}T23:59:59`).getTime();
  }

  const diffMs = deadlineMs - now;
  const isLate = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((absDiff % (1000 * 60)) / 1000);

  const formatUnit = (n) => (n < 10 ? `0${n}` : `${n}`);
  const timeFormatted = `${days > 0 ? `${days}d ` : ''}${formatUnit(hours)}h ${formatUnit(mins)}m ${formatUnit(secs)}s`;

  // Calculate dynamic 5-hour red opacity
  // At 72h left -> start at 0.15 opacity. Every 5h elapsed -> +0.15 opacity up to 0.85
  const remainingHours = diffMs / (1000 * 60 * 60);
  let redOpacity = 0.15;

  if (isLate) {
    redOpacity = 0.90;
  } else if (remainingHours <= 48) {
    // 48h to 0h -> opacity ranges 0.60 to 0.88
    const elapsedFrom48 = 48 - remainingHours;
    const steps = Math.floor(elapsedFrom48 / 5);
    redOpacity = Math.min(0.88, 0.60 + steps * 0.05);
  } else {
    // 72h to 48h -> opacity ranges 0.15 to 0.55
    const elapsedFrom72 = 72 - remainingHours;
    const steps = Math.floor(elapsedFrom72 / 5);
    redOpacity = Math.min(0.55, 0.15 + steps * 0.08);
  }

  const memberName = (urgentOrder.assignedMembers && urgentOrder.assignedMembers[0]) || session?.user?.assignedName || session?.user?.name || 'Member';
  const orderNumber = urgentOrder.orderNumber || urgentOrder.clientUserId || 'Order';

  // Format message text
  const currentRawMsg = REMINDER_MESSAGES[msgIndex % REMINDER_MESSAGES.length];
  const customMsg = currentRawMsg
    .replace(/{name}/g, memberName)
    .replace(/{orderNumber}/g, orderNumber)
    .replace(/{timeRemaining}/g, timeFormatted);

  return (
    <div
      className="v-deadline-top-alert"
      style={{
        background: isLate
          ? `rgba(239, 68, 68, ${redOpacity})`
          : `rgba(225, 29, 72, ${redOpacity})`,
        border: `1px solid rgba(239, 68, 68, ${Math.min(1, redOpacity + 0.25)})`,
        boxShadow: isLate
          ? '0 0 15px rgba(239, 68, 68, 0.4)'
          : `0 0 12px rgba(225, 29, 72, ${redOpacity * 0.6})`,
      }}
      onClick={() => onLocateOrder && onLocateOrder(urgentOrder)}
      title="Click to scroll to this order"
    >
      <div className="v-alert-badge-left">
        {isLate ? (
          <Flame size={14} className="v-alert-icon-fire" />
        ) : remainingHours <= 48 ? (
          <AlertTriangle size={14} className="v-alert-icon-warn" />
        ) : (
          <Clock size={14} className="v-alert-icon-clock" />
        )}
        <span className="v-alert-timer-text">{isLate ? `LATE BY ${timeFormatted}` : timeFormatted}</span>
      </div>

      <div className="v-alert-msg-center">
        {isLate ? (
          <span>
            🚨 <strong>LATE ORDER:</strong> {memberName}, deadline for #{orderNumber} passed {timeFormatted} ago! Please submit or ask for an extension!
          </span>
        ) : remainingHours <= 48 ? (
          <span>
            🚨 <strong>URGENT (&lt;48h):</strong> {memberName}, #{orderNumber} is due in {timeFormatted}! Finishing up or requesting an extension?
          </span>
        ) : (
          <span>{customMsg}</span>
        )}
      </div>

      {remainingHours > 48 && !isLate && (
        <span className="v-alert-ext-prompt">
          💡 Request Extension
        </span>
      )}
    </div>
  );
}
