import { useEffect, useRef, useCallback, useState } from 'react';

export function usePolling(callback, options = {}) {
  const { interval = 5000, maxRetries = 3, onError, enabled = true } = options;

  const [isPolling, setIsPolling] = useState(enabled);
  const [lastError, setLastError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const getBackoffDelay = useCallback((attempts) => {
    const baseDelay = interval * Math.pow(2, Math.min(attempts, 4));
    const jitter = Math.random() * 0.3 * baseDelay;
    return Math.min(baseDelay + jitter, 60000);
  }, [interval]);

  const poll = useCallback(async () => {
    try {
      await callbackRef.current();
      setRetryCount(0);
      setLastError(null);

      if (isPolling) {
        timeoutRef.current = setTimeout(poll, interval);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setLastError(err);

      if (retryCount < maxRetries) {
        const nextRetryCount = retryCount + 1;
        setRetryCount(nextRetryCount);
        onError?.(err, nextRetryCount);

        const delay = getBackoffDelay(nextRetryCount);
        timeoutRef.current = setTimeout(poll, delay);
      } else {
        setIsPolling(false);
        onError?.(err, retryCount);
      }
    }
  }, [isPolling, interval, maxRetries, getBackoffDelay, retryCount, onError]);

  useEffect(() => {
    if (enabled) {
      poll();
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [enabled, poll]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const pause = useCallback(() => {
    setIsPolling(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const resume = useCallback(() => {
    setIsPolling(true);
    setRetryCount(0);
    setLastError(null);
    poll();
  }, [poll]);

  return {
    isPolling,
    pause,
    resume,
    lastError,
    retryCount,
  };
}
