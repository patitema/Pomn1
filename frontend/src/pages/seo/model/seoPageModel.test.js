import {
  buildSeoCanonicalUrl,
  buildSeoJsonLd,
  POMNI_BRAND_ALIASES,
  getRelatedSeoPages,
  getSeoCtaState,
  getSeoPage,
} from './seoPageModel';

const routes = {
  notes: '/notes',
  registration: '/registration',
};

const pages = {
  notesOnline: {
    path: '/notes-online',
    title: 'Notes online',
    related: ['tasksAndNotes', 'missingPage'],
    faq: [
      ['Question?', 'Answer.'],
    ],
  },
  tasksAndNotes: {
    path: '/tasks-and-notes',
    title: 'Tasks and notes',
    related: [],
    faq: [],
  },
};

describe('seo page model', () => {
  it('returns a known page by key', () => {
    expect(getSeoPage('notesOnline', pages)).toBe(pages.notesOnline);
  });

  it('falls back to the default page for an unknown page key', () => {
    expect(getSeoPage('unknown', pages)).toBe(pages.notesOnline);
  });

  it('builds logged-in CTA state', () => {
    expect(getSeoCtaState(true, routes)).toEqual({
      primaryRoute: '/notes',
      heroLabel: 'Перейти к заметкам',
      finalLabel: 'Перейти к заметкам',
    });
  });

  it('builds anonymous CTA state', () => {
    expect(getSeoCtaState(false, routes)).toEqual({
      primaryRoute: '/registration',
      heroLabel: 'Начать пользоваться',
      finalLabel: 'Создать аккаунт',
    });
  });

  it('filters related page keys that are not present', () => {
    expect(getRelatedSeoPages(pages.notesOnline, pages)).toEqual([pages.tasksAndNotes]);
  });

  it('builds canonical URL from page path', () => {
    expect(buildSeoCanonicalUrl(pages.notesOnline)).toBe('https://pomn1.ru/notes-online');
  });

  it('builds application structured data with pomn1 brand aliases', () => {
    const application = buildSeoJsonLd(pages.notesOnline)['@graph'][0];

    expect(application.name).toBe('POMNI');
    expect(application.alternateName).toEqual(POMNI_BRAND_ALIASES);
    expect(application.publisher).toEqual({
      '@type': 'Organization',
      name: 'POMNI',
      alternateName: POMNI_BRAND_ALIASES,
      url: 'https://pomn1.ru/',
    });
  });

  it('builds FAQ structured data from page FAQ entries', () => {
    expect(buildSeoJsonLd(pages.notesOnline)['@graph'][1].mainEntity).toEqual([
      {
        '@type': 'Question',
        name: 'Question?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Answer.',
        },
      },
    ]);
  });
});
