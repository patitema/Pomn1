import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { routes } from '@shared/config';
import { SeoPage } from './SeoPage';
import { seoPages } from './seoPagesData';
import { buildSeoCanonicalUrl } from './model/seoPageModel';

const authState = vi.hoisted(() => ({
  isAuthenticated: false,
}));

vi.mock('react-redux', () => ({
  useSelector: (selector) => selector({ auth: { isAuthenticated: authState.isAuthenticated } }),
}));

vi.mock('@widgets/footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}));

const renderSeoPage = (pageKey) => render(
  <MemoryRouter>
    <SeoPage pageKey={pageKey} />
  </MemoryRouter>,
);

const getButtonHrefs = (container) => Array.from(container.querySelectorAll('.seo-route-button'))
  .map((link) => link.getAttribute('href'));

const getRelatedHrefs = (container) => Array.from(container.querySelectorAll('.seo-route-related a'))
  .map((link) => link.getAttribute('href'));

afterEach(() => {
  cleanup();
  authState.isAuthenticated = false;
  document.title = '';
  document.head.querySelector('link[rel="canonical"]')?.remove();
  document.head.querySelectorAll('meta[name="description"], meta[property^="og:"]').forEach((element) => element.remove());
});

describe('SeoPage', () => {
  it('renders anonymous CTA routes and related links for a known page', () => {
    const { container } = renderSeoPage('notesOnline');
    const page = seoPages.notesOnline;

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(page.title);
    expect(getButtonHrefs(container)).toEqual([routes.registration, routes.home, routes.registration]);
    expect(getRelatedHrefs(container)).toEqual(page.related.map((relatedKey) => seoPages[relatedKey].path));
    expect(screen.getByTestId('footer')).toBeTruthy();
  });

  it('uses app CTA route for authenticated users', () => {
    authState.isAuthenticated = true;

    const { container } = renderSeoPage('tasksAndNotes');

    expect(getButtonHrefs(container)).toEqual([routes.notes, routes.home, routes.notes]);
  });

  it('falls back to the default page and updates document metadata', () => {
    renderSeoPage('missingPage');
    const page = seoPages.notesOnline;

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(page.title);
    expect(document.title).toBe(page.metaTitle);
    expect(document.head.querySelector('meta[name="description"]').getAttribute('content')).toBe(page.description);
    expect(document.head.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(buildSeoCanonicalUrl(page));
  });
});
