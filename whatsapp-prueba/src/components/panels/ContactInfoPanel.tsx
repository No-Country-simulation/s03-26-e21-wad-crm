/**
 * ContactInfoPanel.tsx
 * Side panel showing contact information and allowing updates
 * Opened by clicking contact name in ConversationsPanel header
 * Only visible for ADMIN and AGENT roles
 */

'use client';

import { useState } from 'react';
import { useWhatsAppStore } from '@/store/whatsappStore';
import { Contact, ROLES } from '@/types';

interface ContactInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
}

export function ContactInfoPanel({ isOpen, onClose, contact }: ContactInfoPanelProps) {
  const currentRole = useWhatsAppStore((state) => state.currentRole);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Contact | null>(contact);

  if (!isOpen || !contact) return null;

  // Only ADMIN and AGENT can view/edit contact info
  const canViewContactPanel = currentRole === ROLES.ADMIN || currentRole === ROLES.AGENT;
  if (!canViewContactPanel) return null;

  const handleSave = () => {
    if (!formData) return;
    // TODO: Implement contact update API call
    console.log('Saving contact:', formData);
    setIsEditing(false);
    // Call API to update contact
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-slate-900 shadow-lg border-l border-slate-700 flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Contact Info</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded transition text-slate-400 hover:text-white"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isEditing ? (
          // Edit Mode
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
              <input
                type="text"
                value={formData?.name || ''}
                onChange={(e) => setFormData(formData ? { ...formData, name: e.target.value } : null)}
                className="w-full px-3 py-2 border border-slate-600 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
              <input
                type="tel"
                value={formData?.phone || ''}
                onChange={(e) => setFormData(formData ? { ...formData, phone: e.target.value } : null)}
                className="w-full px-3 py-2 border border-slate-600 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition font-medium"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(contact);
                }}
                className="flex-1 bg-slate-700 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-600 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          // View Mode
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Name</p>
              <p className="text-base text-white">{contact.name}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Phone</p>
              <p className="text-base text-white font-mono">{contact.phone}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">ID</p>
              <p className="text-sm text-slate-400 font-mono break-all">{contact.id}</p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full mt-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition font-medium"
            >
              Edit Contact
            </button>
          </div>
        )}
      </div>

      {/* Footer - TODO Section */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <p className="text-xs text-amber-400 font-semibold mb-2">TODO</p>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>- Implement contact update API</li>
          <li>- Add validation</li>
          <li>- Show success/error messages</li>
          <li>- Add email field (when available)</li>
        </ul>
      </div>
    </div>
  );
}
