import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PasswordResetRequestPage from './PasswordResetRequestPage'

vi.mock('@features/password-reset-request', () => ({
  PasswordResetRequestForm: () => <div data-testid="password-reset-request-form" />,
}))

describe('PasswordResetRequestPage', () => {
  it('renders the request form feature inside the password reset page layout', () => {
    render(<PasswordResetRequestPage />)

    const requestForm = screen.getByTestId('password-reset-request-form')

    expect(requestForm).toBeTruthy()
    expect(requestForm.closest('.password-reset-page')).not.toBeNull()
  })
})