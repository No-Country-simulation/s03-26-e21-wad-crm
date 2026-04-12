/**
 * ContactInfoPanel.tsx
 * Side panel showing contact information and allowing updates
 * Opened by clicking contact name in ConversationsPanel header
 * Only visible for ADMIN and AGENT roles
 */

'use client';

import { useWhatsAppStore } from '@/store/whatsappStore';
import { Contact, ROLES } from '@/types';
import { useContactInfoPanel } from '../hooks/useContactInfoPanel';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContactInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
}

export function ContactInfoPanel({ isOpen, onClose, contact }: ContactInfoPanelProps) {
  const currentRole = useWhatsAppStore((state) => state.currentRole);
  const { isEditing, formData, setIsEditing, handleSave, handleCancel, updateFormData } = useContactInfoPanel({ contact });

  if (!contact) return null;

  const canViewContactPanel = currentRole === ROLES.ADMIN || currentRole === ROLES.AGENT;
  if (!canViewContactPanel) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Contact Info</SheetTitle>
          <SheetDescription>
            View and edit contact information
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {isEditing ? (
            <form className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData?.name || ''}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData?.phone || ''}
                  onChange={(e) => updateFormData({ phone: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  onClick={handleSave}
                  className="flex-1"
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Name</p>
                <p className="text-base text-foreground">{contact.name}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Phone</p>
                <p className="text-base text-foreground font-mono">{contact.phone}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">ID</p>
                <p className="text-sm text-muted-foreground font-mono break-all">{contact.id}</p>
              </div>

              <Button
                onClick={() => setIsEditing(true)}
                className="w-full mt-6"
              >
                Edit Contact
              </Button>
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-border pt-4">
          <Alert>
            <AlertDescription className="text-xs">
              <p className="font-semibold text-amber-500 mb-2">TODO</p>
              <ul className="text-muted-foreground space-y-1">
                <li>- Implement contact update API</li>
                <li>- Add validation</li>
                <li>- Show success/error messages</li>
                <li>- Add email field (when available)</li>
              </ul>
            </AlertDescription>
          </Alert>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
