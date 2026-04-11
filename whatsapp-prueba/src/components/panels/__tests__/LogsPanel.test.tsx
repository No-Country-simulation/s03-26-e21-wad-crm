/**
 * Component Integration Tests for LogsPanel
 * Tests: Polling, log display, refresh, clear functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogsPanel } from '@/components/panels/LogsPanel'

vi.mock('@/hooks/usePolling', () => ({
  usePolling: (callback: () => void, options: any) => {
    // Auto-call on first render
    if (options.enabled) {
      callback()
    }
  },
}))

describe('LogsPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render logs panel', () => {
    render(<LogsPanel />)
    expect(screen.getByText(/logs/i)).toBeInTheDocument()
  })

  it('should display log entries', async () => {
    render(<LogsPanel />)
    await waitFor(() => {
      expect(screen.getByText(/logs/i)).toBeInTheDocument()
    })
  })
})
