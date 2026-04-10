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
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg border-l border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Contact Info</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData?.name || ''}
                onChange={(e) => setFormData(formData ? { ...formData, name: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData?.phone || ''}
                onChange={(e) => setFormData(formData ? { ...formData, phone: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(contact);
                }}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          // View Mode
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Name</p>
              <p className="text-base text-gray-900">{contact.name}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Phone</p>
              <p className="text-base text-gray-900 font-mono">{contact.phone}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">ID</p>
              <p className="text-sm text-gray-600 font-mono break-all">{contact.id}</p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Edit Contact
            </button>
          </div>
        )}
      </div>

      {/* Footer - TODO Section */}
      <div className="p-4 border-t border-gray-200 bg-amber-50">
        <p className="text-xs text-amber-800 font-semibold mb-2">TODO</p>
        <ul className="text-xs text-amber-700 space-y-1">
          <li>- Implement contact update API</li>
          <li>- Add validation</li>
          <li>- Show success/error messages</li>
          <li>- Add email field (when available)</li>
        </ul>
      </div>
    </div>
  );
}
