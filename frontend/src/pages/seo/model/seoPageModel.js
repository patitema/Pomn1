export const DEFAULT_SEO_PAGE_KEY = 'notesOnline';

export const getSeoPage = (pageKey, pages, fallbackKey = DEFAULT_SEO_PAGE_KEY) => (
  pages[pageKey] ?? pages[fallbackKey]
);

export const getSeoCtaState = (isAuthenticated, routes) => ({
  primaryRoute: isAuthenticated ? routes.notes : routes.registration,
  heroLabel: isAuthenticated ? 'Перейти к заметкам' : 'Начать пользоваться',
  finalLabel: isAuthenticated ? 'Перейти к заметкам' : 'Создать аккаунт',
});

export const getRelatedSeoPages = (page, pages) => (
  page.related
    .map((relatedKey) => pages[relatedKey])
    .filter(Boolean)
);

export const buildSeoCanonicalUrl = (page, origin = 'https://pomn1.ru') => origin + page.path;

export const buildSeoJsonLd = (page) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'POMNI',
      url: 'https://pomn1.ru/',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Web',
      inLanguage: 'ru-RU',
      description: 'Онлайн-сервис для заметок, папок, графа знаний и задач.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'RUB',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: page.faq.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      })),
    },
  ],
});
