import { routes } from '@shared/config';
import { getHomePageCtaState } from './homePageModel';

describe('home page model', () => {
  it('builds anonymous CTA state', () => {
    expect(getHomePageCtaState(false, routes)).toEqual({
      landingLink: routes.auth,
      headerLabel: 'Начать',
      mainLabel: 'Начать пользоваться',
    });
  });

  it('builds authenticated CTA state', () => {
    expect(getHomePageCtaState(true, routes)).toEqual({
      landingLink: routes.notes,
      headerLabel: 'Перейти к заметкам',
      mainLabel: 'Перейти к заметкам',
    });
  });
});
