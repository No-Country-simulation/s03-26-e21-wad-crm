import { useRef, useEffect } from 'react'

export function useSubNavFocus(collapsed: boolean) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!collapsed && inputRef.current) {
      inputRef.current.focus()
    }
  }, [collapsed])

  return { inputRef }
}