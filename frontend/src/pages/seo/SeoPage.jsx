import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@entities/user/model/selectors';
import { Footer } from '@widgets/footer';
import { routes } from '@shared/config';
import {
  buildSeoCanonicalUrl,
  buildSeoJsonLd,
  getRelatedSeoPages,
  getSeoCtaState,
  getSeoPage,
} from './model/seoPageModel';
import { seoPages } from './seoPagesData';
import './SeoPage.css';

const updateMeta = (selector, attribute, value, content) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  element.setAttribute(attribute, value);
  element.setAttribute('content', content);
};

const updateCanonical = (href) => {
  let canonical = document.head.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }

  canonical.setAttribute('href', href);
};

const useSeoHead = (page) => {
  useEffect(() => {
    const canonicalUrl = buildSeoCanonicalUrl(page);

    document.title = page.metaTitle;
    updateMeta('meta[name="description"]', 'name', 'description', page.description);
    updateMeta('meta[property="og:title"]', 'property', 'og:title', page.metaTitle);
    updateMeta('meta[property="og:description"]', 'property', 'og:description', page.description);
    updateMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    updateCanonical(canonicalUrl);
  }, [page]);
};

export const SeoPage = ({ pageKey }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const page = getSeoPage(pageKey, seoPages);
  const { primaryRoute, heroLabel, finalLabel } = getSeoCtaState(isAuthenticated, routes);
  const relatedPages = getRelatedSeoPages(page, seoPages);

  useSeoHead(page);

  return (
    <div className="page-container seo-route-page">
      <script type="application/ld+json">
        {JSON.stringify(buildSeoJsonLd(page))}
      </script>

      <header className="seo-route-hero">
        <div>
          <p className="seo-route-eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="seo-route-lead">{page.lead}</p>
          <div className="seo-route-actions">
            <Link className="seo-route-button" to={primaryRoute}>
              {heroLabel}
            </Link>
            <Link className="seo-route-button seo-route-button--ghost" to={routes.home}>
              На главную
            </Link>
          </div>
        </div>

        <aside className="seo-route-card">
          <h2>Что дает POMNI</h2>
          <ul>
            {page.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </header>

      <main className="seo-route-main">
        {page.sections.map((section) => (
          <section className="seo-route-section" key={section.title}>
            <div>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </div>

            {section.cards && (
              <div className="seo-route-grid">
                {section.cards.map(([title, text]) => (
                  <article className="seo-route-card" key={title}>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            )}

            {section.list && (
              <ul className="seo-route-list">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="seo-route-section seo-route-faq-section">
          <h2>Вопросы</h2>
          <div className="seo-route-faq">
            {page.faq.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="seo-route-section">
          <h2>Связанные возможности</h2>
          <div className="seo-route-related">
            {relatedPages.map((relatedPage) => (
              <Link to={relatedPage.path} key={relatedPage.path}>
                {relatedPage.eyebrow}
                <span>{relatedPage.title}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="seo-route-section seo-route-final">
          <h2>Попробуйте POMNI в работе</h2>
          <p>Создайте аккаунт и соберите заметки, задачи и связи в одном месте.</p>
          <Link className="seo-route-button" to={primaryRoute}>
            {finalLabel}
          </Link>
        </section>


      </main>

      <Footer />
    </div>
  );
};

export default SeoPage;