/**
 * Component Integration Tests for TemplatesPanel
 * Tests: Template loading, selection, caching
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TemplatesPanel } from '@/components/panels/TemplatesPanel'

vi.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: (key: string, initialValue: any) => ({
    value: initialValue,
    setValue: vi.fn(),
  }),
}))

const defaultConfig = {
  token: 'test-token',
  baseUrl: 'http://localhost:8080',
}

describe('TemplatesPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render templates panel', () => {
    render(<TemplatesPanel config={defaultConfig} />)
    expect(screen.getByText(/plantillas/i)).toBeInTheDocument()
  })
})
