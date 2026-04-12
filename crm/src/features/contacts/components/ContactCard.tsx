import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { StatusBadge } from '@/shared/components/status-badge'
import { Mail, Phone, Building } from 'lucide-react'
import { ContactCardProps } from '../types'

export function ContactCard({ contact, onClick }: ContactCardProps) {
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer" 
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{contact.name}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{contact.jobTitle}</p>
          </div>
          <span><StatusBadge status={contact.status} /></span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {contact.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{contact.phone}</span>
          </div>
        )}
        {contact.companyId && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building className="w-4 h-4" />
            <span>Empresa #{contact.companyId}</span>
          </div>
        )}
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {contact.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
