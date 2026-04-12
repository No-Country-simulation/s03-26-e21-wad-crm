import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '../utils/header.utils'

interface UserAvatarProps {
  userName: string
}

export function UserAvatar({ userName }: UserAvatarProps) {
  return (
    <Avatar className="size-8">
      <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-700 text-white text-sm font-bold">
        {getInitials(userName)}
      </AvatarFallback>
    </Avatar>
  )
}