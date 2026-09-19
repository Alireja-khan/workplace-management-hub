'use client';

import React, { useState } from 'react';
import { X, Plus, UserPlus, Check, Trash2, Calendar, DollarSign, ExternalLink, Sparkles, Clipboard } from 'lucide-react';
import { MONTH_LIST } from '@/lib/dateUtils';
import { parseRawSheetText, extractUrlFromHtmlOrText } from '@/lib/sheetParser';

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
  const [rawText, setRawText] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);

  // Reset local state when opened
  React.useEffect(() => {
    if (isOpen) {
      setRawText('');
      setCustomMember('');
      setPasteSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQuickPaste = (textToParse, overrideUrl = '') => {
    const parsed = parseRawSheetText(textToParse, overrideUrl);
    if (parsed) {
      setFormData((prev) => ({
        ...prev,
        ...parsed,
      }));
      setPasteSuccess(true);
      setTimeout(() => setPasteSuccess(false), 3500);
    }
  };

  const handleTextareaPaste = (e) => {
    e.preventDefault(); // Stop onChange from firing and overwriting the extracted URL
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const htmlData = clipboardData.getData('text/html') || '';
    const textData = clipboardData.getData('text/plain') || '';
    
    setRawText(textData);

    const extractedUrl = extractUrlFromHtmlOrText(htmlData, textData);
    handleQuickPaste(textData, extractedUrl);
  };

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
    <div className="v-modal-overlay" onMouseDown={onClose}>
      <div className="v-modal-dialog" style={{ maxWidth: 1000 }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="v-modal-header">
          <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
            {isEdit ? 'Edit Team Order' : 'Create New Team Order'}
          </span>
          <button type="button" className="btn-v-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="v-modal-body">
            {/* Smart Raw Paste Box */}
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
                {pasteSuccess && (
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
                value={rawText}
                onPaste={handleTextareaPaste}
                onChange={(e) => {
                  const val = e.target.value;
                  setRawText(val);
                  if (val.trim()) {
                    handleQuickPaste(val);
                  }
                }}
              />
            </div>

            <div className="v-form-grid-3">
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
                  placeholder="e.g. Sales Name"
                  value={formData.salesPerson}
                  onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                />
              </div>

              <div className="v-form-group">
                <label>Client User ID *</label>
                <input
                  type="text"
                  className="v-input"
                  placeholder="e.g. client123"
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
                  placeholder="e.g. ORD-001"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                />
              </div>

              <div className="v-form-group">
                <label>Profile Name</label>
                <input
                  type="text"
                  className="v-input"
                  placeholder="e.g. Profile 1"
                  value={formData.profileName}
                  onChange={(e) => setFormData({ ...formData, profileName: e.target.value })}
                />
              </div>

              {/* Assigned Member(s) */}
              <div className="v-form-group full">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Assigned Member(s) (Select Multiple)</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)' }}>
                    {(formData.assignedMembers || []).length} assigned
                  </span>
                </label>

                <div className="member-picker-container">
                  <div className="member-chip-wrapper">
                    {(formData.assignedMembers || []).length === 0 && (
                      <span style={{ fontSize: '0.74rem', color: 'var(--accents-4)', fontStyle: 'italic' }}>
                        No members assigned yet.
                      </span>
                    )}
                    {(formData.assignedMembers || []).map((member) => (
                      <span key={member} className="member-chip">
                        <span>{member}</span>
                        <button
                          type="button"
                          className="member-chip-remove"
                          onClick={() => removeMember(member)}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>

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

                  <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.25rem' }}>
                    <input
                      type="text"
                      className="v-input"
                      style={{ height: 30, fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                      placeholder="Type custom name..."
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

              <div className="v-form-group">
                <label>Gross Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="v-input mono-text"
                  placeholder="e.g. 200"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="v-form-group">
                <label>Fresh / Net 80% ($)</label>
                <div className="mono-text" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-default)', padding: '0.5rem 0.85rem', borderRadius: 5, color: '#10b981', fontWeight: 600 }}>
                  ${netAmount}
                </div>
              </div>

              <div className="v-form-group">
                <label>Payout ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="v-input mono-text"
                  placeholder="e.g. 50"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                />
              </div>

              <div className="v-form-group">
                <label>Order Status</label>
                <select
                  className="v-select"
                  value={formData.orderStatus}
                  onChange={(e) => setFormData({ ...formData, orderStatus: e.target.value })}
                >
                  <option value="Wip">Wip</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Done">Done</option>
                  <option value="NRA">NRA</option>
                  <option value="Need Requirements">Need Requirements</option>
                  <option value="Cancel">Cancel</option>
                  {(['delivered', 'done', 'issue'].includes((formData.orderStatus || '').toLowerCase()) || (formData.draftCount && formData.draftCount > 0)) && (
                    <option value="Issue">Issue</option>
                  )}
                </select>
              </div>

              <div className="v-form-group">
                <label>Draft Count</label>
                <input
                  type="number"
                  min="0"
                  className="v-input mono-text"
                  placeholder="0 (e.g. 1 for First Draft)"
                  value={formData.draftCount !== undefined ? formData.draftCount : 0}
                  onChange={(e) => setFormData({ ...formData, draftCount: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                />
              </div>



              <div className="v-form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  className="v-input"
                  value={formData.deadline || ''}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div className="v-form-group">
                <label>Estimated Delivery Date</label>
                <input
                  type="date"
                  className="v-input"
                  value={formData.estimatedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, estimatedDeliveryDate: e.target.value })}
                />
              </div>

              <div className="v-form-group">
                <label>Actual Delivery Date</label>
                <input
                  type="date"
                  className="v-input"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                />
              </div>

              <div className="v-form-group">
                <label>Instruction / Sheet Link</label>
                <input
                  type="url"
                  className="v-input"
                  placeholder="https://docs.google.com/..."
                  value={formData.sheetLink}
                  onChange={(e) => setFormData({ ...formData, sheetLink: e.target.value })}
                />
              </div>

              <div className="v-form-group">
                <label>Order Type</label>
                <select
                  className="v-select"
                  value={formData.timeSchedule}
                  onChange={(e) => setFormData({ ...formData, timeSchedule: e.target.value })}
                >
                  <option value="Fresh Query">Fresh Query</option>
                  <option value="Repeat">Repeat Order</option>
                  <option value="Add-on">Add-on</option>
                </select>
              </div>

              <div className="v-form-group">
                <label>Team Name</label>
                <input
                  type="text"
                  className="v-input"
                  placeholder="e.g. EleSquad"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                />
              </div>

              <div className="v-form-group full">
                <label>Additional Notes</label>
                <input
                  type="text"
                  className="v-input"
                  placeholder="Special instructions or notes..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          <div className="v-modal-footer">
            <button type="button" className="btn-v btn-v-secondary" onClick={onClose} disabled={isSubmitting}>
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
                  ? (isEdit ? 'Updating Order...' : 'Creating Order...')
                  : (isEdit ? 'Save Changes' : 'Create Order')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
