'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, Check, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function parseInitialDateTime(val) {
  let dateObj = new Date();
  let hasValue = false;

  if (val && typeof val === 'string' && val.trim()) {
    const str = val.trim();
    if (str.includes('T')) {
      const parsed = new Date(str);
      if (!isNaN(parsed.getTime())) {
        dateObj = parsed;
        hasValue = true;
      }
    } else if (str.includes('/')) {
      const parts = str.split(' ');
      const [m, d, y] = parts[0].split('/');
      const time = parts[1] || '23:59';
      if (m && d && y) {
        const parsed = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${time}`);
        if (!isNaN(parsed.getTime())) {
          dateObj = parsed;
          hasValue = true;
        }
      }
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const parsed = new Date(`${str}T23:59`);
      if (!isNaN(parsed.getTime())) {
        dateObj = parsed;
        hasValue = true;
      }
    }
  }

  return {
    year: dateObj.getFullYear(),
    month: dateObj.getMonth(),
    day: dateObj.getDate(),
    hours: dateObj.getHours(),
    minutes: dateObj.getMinutes(),
    hasValue,
  };
}

export default function DateTimePickerPopover({
  value = '',
  onSave,
  disabled = false,
  placeholder = 'Set Deadline',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Draft state inside popover
  const initial = parseInitialDateTime(value);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [selectedDay, setSelectedDay] = useState(initial.day);
  const [hours12, setHours12] = useState(() => {
    const h24 = initial.hours;
    const h12 = h24 % 12 || 12;
    return String(h12).padStart(2, '0');
  });
  const [minutes, setMinutes] = useState(String(initial.minutes).padStart(2, '0'));
  const [ampm, setAmpm] = useState(initial.hours >= 12 ? 'PM' : 'AM');

  // Sync draft state when opened or value prop changes
  const resetDraftState = () => {
    const parsed = parseInitialDateTime(value);
    setViewYear(parsed.year);
    setViewMonth(parsed.month);
    setSelectedDay(parsed.day);
    const h12 = parsed.hours % 12 || 12;
    setHours12(String(h12).padStart(2, '0'));
    setMinutes(String(parsed.minutes).padStart(2, '0'));
    setAmpm(parsed.hours >= 12 ? 'PM' : 'AM');
  };

  useEffect(() => {
    if (isOpen) {
      resetDraftState();
    }
  }, [isOpen, value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Days calculations
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleClear = () => {
    if (onSave) onSave('');
    setIsOpen(false);
  };

  const handleOkSubmit = () => {
    // Convert 12h + AM/PM to 24h
    let h24 = parseInt(hours12, 10) || 12;
    if (ampm === 'PM' && h24 < 12) h24 += 12;
    if (ampm === 'AM' && h24 === 12) h24 = 0;

    const mNum = Math.min(59, Math.max(0, parseInt(minutes, 10) || 0));

    const yStr = String(viewYear);
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(selectedDay).padStart(2, '0');
    const hStr = String(h24).padStart(2, '0');
    const minStr = String(mNum).padStart(2, '0');

    // Format ISO string: YYYY-MM-DDTHH:mm
    const finalFormatted = `${yStr}-${mStr}-${dStr}T${hStr}:${minStr}`;

    if (onSave) {
      onSave(finalFormatted);
    }
    setIsOpen(false);
  };

  // Format label for button trigger
  const formatDisplayTrigger = (valStr) => {
    if (!valStr || !valStr.trim()) return null;
    const str = valStr.trim();
    let d = new Date(str);

    if (isNaN(d.getTime())) {
      if (str.includes('/')) {
        const parts = str.split(' ');
        const [m, day, y] = parts[0].split('/');
        const time = parts[1] || '23:59';
        d = new Date(`${y}-${m.padStart(2, '0')}-${day.padStart(2, '0')}T${time}`);
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        d = new Date(`${str}T23:59`);
      }
    }

    if (isNaN(d.getTime())) return valStr;

    const mShort = MONTH_NAMES[d.getMonth()].substring(0, 3);
    const dateNum = d.getDate();
    const h12 = d.getHours() % 12 || 12;
    const mPad = String(d.getMinutes()).padStart(2, '0');
    const ap = d.getHours() >= 12 ? 'PM' : 'AM';

    return `${mShort} ${dateNum}, ${String(h12).padStart(2, '0')}:${mPad} ${ap}`;
  };

  const displayTriggerText = formatDisplayTrigger(value);

  return (
    <div className="v-dt-popover-wrapper" ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      
      {/* Trigger Button */}
      {disabled ? (
        <span style={{ color: value ? '#ef4444' : 'var(--accents-5)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          {displayTriggerText || '—'}
        </span>
      ) : (
        <button
          type="button"
          className={`v-dt-trigger-btn ${value ? 'has-value' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          title={value ? `Deadline: ${displayTriggerText}` : 'Set Deadline'}
        >
          <CalendarIcon size={12} />
          <span>{displayTriggerText || placeholder}</span>
        </button>
      )}

      {/* Popover Dropdown */}
      {isOpen && !disabled && (
        <div className="v-dt-popover-card">
          {/* Popover Header: Month & Year Selector */}
          <div className="v-dt-card-header">
            <button type="button" className="v-dt-nav-btn" onClick={handlePrevMonth} title="Previous Month">
              <ChevronLeft size={14} />
            </button>
            <span className="v-dt-month-title">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button type="button" className="v-dt-nav-btn" onClick={handleNextMonth} title="Next Month">
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="v-dt-calendar-grid">
            {/* Weekday Labels */}
            {WEEKDAY_NAMES.map((wd) => (
              <div key={wd} className="v-dt-weekday-label">
                {wd}
              </div>
            ))}

            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="v-dt-day-cell empty" />
            ))}

            {/* Day slots */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const isSelected = selectedDay === dayNum;
              const isToday =
                new Date().getDate() === dayNum &&
                new Date().getMonth() === viewMonth &&
                new Date().getFullYear() === viewYear;

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  className={`v-dt-day-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => setSelectedDay(dayNum)}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Time Picker Section */}
          <div className="v-dt-time-section">
            <div className="v-dt-time-label">
              <Clock size={13} /> Time:
            </div>

            <div className="v-dt-time-inputs">
              <select
                className="v-dt-time-select"
                value={hours12}
                onChange={(e) => setHours12(e.target.value)}
              >
                {Array.from({ length: 12 }).map((_, i) => {
                  const hVal = String(i + 1).padStart(2, '0');
                  return (
                    <option key={hVal} value={hVal}>
                      {hVal}
                    </option>
                  );
                })}
              </select>

              <span className="v-dt-time-colon">:</span>

              <select
                className="v-dt-time-select"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              >
                {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className={`v-dt-ampm-btn ${ampm === 'AM' ? 'active' : ''}`}
                onClick={() => setAmpm(ampm === 'AM' ? 'PM' : 'AM')}
              >
                {ampm}
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="v-dt-footer-actions">
            {value ? (
              <button
                type="button"
                className="btn-v btn-v-ghost v-dt-clear-btn"
                onClick={handleClear}
                title="Clear Deadline"
              >
                <Trash2 size={12} /> Clear
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                type="button"
                className="btn-v btn-v-secondary"
                style={{ height: 28, padding: '0 0.55rem', fontSize: '0.72rem' }}
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-v btn-v-primary"
                style={{ height: 28, padding: '0 0.75rem', fontSize: '0.72rem', fontWeight: 600 }}
                onClick={handleOkSubmit}
              >
                <Check size={12} /> OK
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
