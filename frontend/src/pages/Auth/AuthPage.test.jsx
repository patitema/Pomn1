import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AuthPage from './AuthPage'

vi.mock('../../features/auth-by-login', () => ({
  LoginForm: () => <div data-testid="login-form" />,
}))

describe('AuthPage', () => {
  it('renders the login feature inside the auth layout', () => {
    render(<AuthPage />)

    const loginForm = screen.getByTestId('login-form')

    expect(loginForm).toBeTruthy()
    expect(loginForm.closest('.auth-container')).not.toBeNull()
    expect(loginForm.closest('.page-container--centered')).not.toBeNull()
  })
})