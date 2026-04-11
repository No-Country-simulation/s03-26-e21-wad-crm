/**
 * Component Integration Tests for ConfigPanel
 * Tests: Config loading, form updates, persistence
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigPanel } from '@/components/panels/ConfigPanel'

vi.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: (key: string, initialValue: any) => ({
    value: initialValue,
    setValue: vi.fn(),
  }),
}))

const defaultConfig = {
  apiKey: 'test-key',
  appSecret: 'test-secret',
  accessToken: 'test-token',
}

describe('ConfigPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render config panel', () => {
    render(<ConfigPanel config={defaultConfig} />)
    expect(screen.getByText(/configuración/i)).toBeInTheDocument()
  })

  it('should display form fields', () => {
    render(<ConfigPanel config={defaultConfig} />)
    expect(screen.getByDisplayValue('test-key')).toBeInTheDocument()
  })

  it('should update config on change', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<ConfigPanel config={defaultConfig} onSave={onSave} />)

    const input = screen.getByDisplayValue('test-key')
    await user.clear(input)
    await user.type(input, 'new-key')

    expect(input).toHaveValue('new-key')
  })
})
