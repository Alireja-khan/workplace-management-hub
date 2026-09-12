'use client';

import React, { useState } from 'react';
import { X, Plus, UserPlus, Check, Trash2, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { MONTH_LIST } from '@/lib/dateUtils';

const DEFAULT_TEAM_MEMBERS = ['Alireja', 'Shuvo', 'Jasmin', 'Mahin', 'Fahim', 'Naim', 'Akash', 'Shihad', 'Need Requirements'];

export default function TeamOrderModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  formData,
  setFormData,
  isEdit = false,
}) {
  const [customMember, setCustomMember] = useState('');

  if (!isOpen) return null;

  const toggleMember = (member) => {
    const current = formData.assignedMembers || [];
    if (current.includes(member)) {
      setFormData({
        ...formData,
        assignedMembers: current.filter((m) => m !== member),
      });
    } else {
      setFormData({
        ...formData,
        assignedMembers: [...current, member],
      });
    }
  };

  const addCustomMember = (e) => {
    e.preventDefault();
    const trimmed = customMember.trim();
    if (!trimmed) return;
    const current = formData.assignedMembers || [];
    if (!current.includes(trimmed)) {
      setFormData({
        ...formData,
        assignedMembers: [...current, trimmed],
      });
    }
    setCustomMember('');
  };

  const removeMember = (member) => {
    const current = formData.assignedMembers || [];
    setFormData({
      ...formData,
      assignedMembers: current.filter((m) => m !== member),
    });
  };

  const grossAmount = parseFloat(formData.amount) || 0;
  const netAmount = (grossAmount * 0.8).toFixed(2);

  return (
    <div className="v-modal-overlay" onClick={onClose}>
      <div className="v-modal-card" style={{ maxWidth: 780 }} onClick={(e) => e.stopPropagation()}>
        <div className="v-modal-header">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
              {isEdit ? 'Edit Team Order' : 'Create New Team Order'}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--accents-5)', margin: '0.2rem 0 0 0' }}>
              EleSquad Team Project & Order Delivery Management
            </p>
          </div>
          <button className="btn-v-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem', maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Row 1: Assign Date, Month, Sales Person */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="v-form-group">
              <label>Assign Date *</label>
              <input
                type="date"
                className="v-input"
                value={formData.assignDate}
                onChange={(e) => setFormData({ ...formData, assignDate: e.target.value })}
                required
              />
            </div>

            <div className="v-form-group">
              <label>Month (Auto-Synced)</label>
              <select
                className="v-select"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              >
                {MONTH_LIST.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="v-form-group">
              <label>Sales Person</label>
              <input
                type="text"
                className="v-input"
                placeholder="e.g. Md Rone Miah, Chayon Saha"
                value={formData.salesPerson}
                onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
              />
            </div>
          </div>

          {/* Row 2: Client User ID, Order Number, Profile Name */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="v-form-group">
              <label>Client User ID *</label>
              <input
                type="text"
                className="v-input"
                placeholder="e.g. darlanjoubert, ellieslp"
                value={formData.clientUserId}
                onChange={(e) => setFormData({ ...formData, clientUserId: e.target.value })}
                required
              />
            </div>

            <div className="v-form-group">
              <label>Order Number</label>
              <input
                type="text"
                className="v-input mono-text"
                placeholder="e.g. FO1705781001"
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
              />
            </div>

            <div className="v-form-group">
              <label>Profile Name</label>
              <input
                type="text"
                className="v-input"
                placeholder="e.g. miahs05, wpstellar"
                value={formData.profileName}
                onChange={(e) => setFormData({ ...formData, profileName: e.target.value })}
              />
            </div>
          </div>

          {/* Row 3: Assigned Member(s) Multi-Select Tagging */}
          <div className="v-form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Assigned Member(s) (Select Multiple)</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)' }}>
                {(formData.assignedMembers || []).length} assigned
              </span>
            </label>

            <div className="member-picker-container">
              {/* Active Assigned Member Chips */}
              <div className="member-chip-wrapper">
                {(formData.assignedMembers || []).length === 0 && (
                  <span style={{ fontSize: '0.74rem', color: 'var(--accents-4)', fontStyle: 'italic' }}>
                    No members assigned yet. Click below or type custom name to assign.
                  </span>
                )}
                {(formData.assignedMembers || []).map((member) => (
                  <span key={member} className="member-chip">
                    <span>{member}</span>
                    <button
                      type="button"
                      className="member-chip-remove"
                      onClick={() => removeMember(member)}
                      title={`Remove ${member}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick Select Buttons from Default Team */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.45rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--accents-5)', display: 'block', marginBottom: '0.3rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  Quick Tag Team Members:
                </span>
                <div className="member-quick-tags">
                  {DEFAULT_TEAM_MEMBERS.map((member) => {
                    const isSelected = (formData.assignedMembers || []).includes(member);
                    return (
                      <button
                        key={member}
                        type="button"
                        className={`member-tag-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleMember(member)}
                      >
                        {isSelected && <Check size={10} style={{ marginRight: 3 }} />}
                        {member}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Member Name input */}
              <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.25rem' }}>
                <input
                  type="text"
                  className="v-input"
                  style={{ height: 30, fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  placeholder="Type other member name & hit Add..."
                  value={customMember}
                  onChange={(e) => setCustomMember(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomMember(e);
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-v btn-v-secondary"
                  style={{ height: 30, padding: '0 0.65rem', fontSize: '0.74rem' }}
                  onClick={addCustomMember}
                >
                  <Plus size={12} /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Row 4: Amount, 80% Net Calculation, Member Payout / Percentage */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="v-form-group">
              <label>Gross Amount ($)</label>
              <input
                type="number"
                step="0.01"
                className="v-input mono-text"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="v-form-group">
              <label>Fresh / Net 80% ($)</label>
              <div className="v-input mono-text" style={{ background: 'var(--accents-1)', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                ${netAmount}
              </div>
            </div>

            <div className="v-form-group">
              <label>Member Payout / Percentage ($)</label>
              <input
                type="number"
                step="0.01"
                className="v-input mono-text"
                placeholder="e.g. 50.00"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
              />
            </div>
          </div>

          {/* Row 5: Estimated Delivery Date, Delivery Date, Order Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="v-form-group">
              <label>Estimated Delivery Date</label>
              <input
                type="text"
                className="v-input"
                placeholder="e.g. 20-09-2026 or 2026-09-20"
                value={formData.estimatedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, estimatedDeliveryDate: e.target.value })}
              />
            </div>

            <div className="v-form-group">
              <label>Actual Delivery Date (Deli Date)</label>
              <input
                type="text"
                className="v-input"
                placeholder="e.g. 10-Sep-2026"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              />
            </div>

            <div className="v-form-group">
              <label>Order Status</label>
              <select
                className="v-select"
                value={formData.orderStatus}
                onChange={(e) => setFormData({ ...formData, orderStatus: e.target.value })}
              >
                <option value="Wip">Wip (In Progress)</option>
                <option value="Delivered">Delivered</option>
                <option value="Done">Done</option>
                <option value="NRA">NRA</option>
                <option value="Need Requirements">Need Requirements</option>
                <option value="Cancel">Cancel</option>
              </select>
            </div>
          </div>

          {/* Row 6: Sheet Link, Team Name, Remark */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="v-form-group">
              <label>Instruction / Sheet Link</label>
              <input
                type="text"
                className="v-input"
                placeholder="e.g. ellieslp_Logokarigar or Google Doc URL"
                value={formData.sheetLink}
                onChange={(e) => setFormData({ ...formData, sheetLink: e.target.value })}
              />
            </div>

            <div className="v-form-group">
              <label>Team Name</label>
              <input
                type="text"
                className="v-input"
                placeholder="EleSquad"
                value={formData.teamName}
                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              />
            </div>

            <div className="v-form-group">
              <label>Remark</label>
              <input
                type="text"
                className="v-input"
                placeholder="e.g. Repeat Order, Mutual Cancel"
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              />
            </div>
          </div>

          {/* Row 7: Notes */}
          <div className="v-form-group">
            <label>Additional Notes</label>
            <textarea
              className="v-input"
              rows={2}
              placeholder="Any special client instructions, credentials, or blocker notes..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-v btn-v-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-v btn-v-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="status-saving-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Create Team Order'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
