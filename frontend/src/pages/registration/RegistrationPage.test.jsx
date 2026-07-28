import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RegistrationPage from './RegistrationPage'

vi.mock('../../features/auth-by-registration', () => ({
  RegistrationForm: () => <div data-testid="registration-form" />,
}))

describe('RegistrationPage', () => {
  it('renders the registration feature inside the registration layout', () => {
    render(<RegistrationPage />)

    const registrationForm = screen.getByTestId('registration-form')

    expect(registrationForm).toBeTruthy()
    expect(registrationForm.closest('.auth-container')).not.toBeNull()
    expect(registrationForm.closest('.page-container--centered')).not.toBeNull()
  })
})