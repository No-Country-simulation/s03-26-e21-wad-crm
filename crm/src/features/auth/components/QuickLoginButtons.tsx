import { Button } from '@/shared/ui/button'
import type { QuickLoginButtonsProps } from '../types'
import { TEST_USERS } from '../types'

export function QuickLoginButtons({ isLoading, onQuickLogin }: QuickLoginButtonsProps) {
  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Usuarios de prueba</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {TEST_USERS.map((user) => (
          <Button
            key={user.email}
            variant="outline"
            size="sm"
            onClick={() => onQuickLogin(user.email)}
            disabled={isLoading}
          >
            {user.label}
          </Button>
        ))}
      </div>
    </>
  )
}
