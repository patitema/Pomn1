import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import TermsPage from './TermsPage'

vi.mock('@widgets/footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}))

describe('TermsPage', () => {
  it('renders the terms content markers and footer', () => {
    render(<TermsPage />)

    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    expect(screen.getByText('POMNI')).toBeTruthy()
    expect(screen.getByTestId('footer')).toBeTruthy()
  })
})