/**
 * usePolling - Auto-refresh hook with exponential backoff
 *
 * Features:
 * - Configurable interval (default: 5s)
 * - Exponential backoff on errors
 * - Automatic cleanup on unmount
 * - Pause/resume functionality
 * - Type-safe callback
 */

import { useEffect, useRef, useCallback, useState } from 'react'

interface UsePollingOptions {
  interval?: number // milliseconds, default: 5000
  maxRetries?: number // default: 3
  onError?: (error: Error, retryCount: number) => void
  enabled?: boolean // default: true
}

/**
 * Hook for polling data at regular intervals with exponential backoff
 *
 * @param callback - Function to call on each poll (should be memoized or stable)
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * const fetchLogs = useCallback(async () => {
 *   const response = await fetch('/api/logs')
 *   return response.json()
 * }, [])
 *
 * const { isPolling, pause, resume, lastError } = usePolling(fetchLogs, {
 *   interval: 3000,
 *   maxRetries: 5,
 *   onError: (error, retryCount) => console.error(`Retry ${retryCount}:`, error)
 * })
 * ```
 */
export function usePolling(
  callback: () => Promise<void> | void,
  options: UsePollingOptions = {}
) {
  const { interval = 5000, maxRetries = 3, onError, enabled = true } = options

  const [isPolling, setIsPolling] = useState(enabled)
  const [lastError, setLastError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Calculate backoff delay: exponential with jitter
  const getBackoffDelay = useCallback((attempts: number) => {
    const baseDelay = interval * Math.pow(2, Math.min(attempts, 4))
    const jitter = Math.random() * 0.3 * baseDelay // 0-30% jitter
    return Math.min(baseDelay + jitter, 60000) // cap at 60s
  }, [interval])

  // Execute poll
  const poll = useCallback(async () => {
    try {
      await callbackRef.current()
      setRetryCount(0)
      setLastError(null)

      // Schedule next poll
      if (isPolling) {
        timeoutRef.current = setTimeout(poll, interval)
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      setLastError(err)

      // Check if we should retry
      if (retryCount < maxRetries) {
        const nextRetryCount = retryCount + 1
        setRetryCount(nextRetryCount)
        onError?.(err, nextRetryCount)

        // Schedule retry with backoff
        const delay = getBackoffDelay(nextRetryCount)
        timeoutRef.current = setTimeout(poll, delay)
      } else {
        // Max retries exceeded, stop polling
        setIsPolling(false)
        onError?.(err, retryCount)
      }
    }
  }, [isPolling, interval, maxRetries, getBackoffDelay, retryCount, onError])

  // Start/stop polling based on enabled flag
  useEffect(() => {
    if (enabled) {
      // Start immediately
      poll()
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, poll])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // Pause polling
  const pause = useCallback(() => {
    setIsPolling(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  // Resume polling
  const resume = useCallback(() => {
    setIsPolling(true)
    setRetryCount(0)
    setLastError(null)
    poll()
  }, [poll])

  // Manually trigger poll
  const triggerPoll = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    poll()
  }, [poll])

  return {
    isPolling,
    pause,
    resume,
    triggerPoll,
    lastError,
    retryCount,
  }
}
