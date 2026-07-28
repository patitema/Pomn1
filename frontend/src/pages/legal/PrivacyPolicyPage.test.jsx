import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PrivacyPolicyPage from './PrivacyPolicyPage'

vi.mock('@widgets/footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}))

describe('PrivacyPolicyPage', () => {
  it('renders the privacy content markers and footer', () => {
    render(<PrivacyPolicyPage />)

    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    expect(screen.getByText('POMNI')).toBeTruthy()
    expect(screen.getByTestId('footer')).toBeTruthy()
  })
})