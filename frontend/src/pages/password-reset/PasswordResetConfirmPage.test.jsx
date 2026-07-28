import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PasswordResetConfirmPage from './PasswordResetConfirmPage'

vi.mock('@features/password-reset-confirm', () => ({
  PasswordResetConfirmForm: () => <div data-testid="password-reset-confirm-form" />,
}))

describe('PasswordResetConfirmPage', () => {
  it('renders the confirm form feature inside the password reset page layout', () => {
    render(<PasswordResetConfirmPage />)

    const confirmForm = screen.getByTestId('password-reset-confirm-form')

    expect(confirmForm).toBeTruthy()
    expect(confirmForm.closest('.password-reset-page')).not.toBeNull()
  })
})