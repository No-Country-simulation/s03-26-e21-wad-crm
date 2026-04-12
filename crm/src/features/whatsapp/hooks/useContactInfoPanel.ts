import { useState } from 'react'
import type { Contact } from '@/types'

interface UseContactInfoPanelProps {
  contact: Contact | null
}

export function useContactInfoPanel({ contact }: UseContactInfoPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Contact | null>(contact)

  const handleSave = () => {
    if (!formData) return
    console.log('Saving contact:', formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData(contact)
  }

  const updateFormData = (updates: Partial<Contact>) => {
    if (!formData) return
    setFormData({ ...formData, ...updates })
  }

  return {
    isEditing,
    formData,
    setIsEditing,
    handleSave,
    handleCancel,
    updateFormData,
  }
}
