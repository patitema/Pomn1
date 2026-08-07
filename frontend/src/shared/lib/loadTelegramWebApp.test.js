import {
  initTelegramWebApp,
  isTelegramWebAppEnvironment,
} from './loadTelegramWebApp';

const TELEGRAM_SCRIPT_SRC = 'https://telegram.org/js/telegram-web-app.js';

const setPath = (path) => {
  window.history.pushState({}, '', path);
};

describe('loadTelegramWebApp', () => {
  beforeEach(() => {
    document.querySelectorAll(`script[src="${TELEGRAM_SCRIPT_SRC}"]`).forEach((script) => {
      script.remove();
    });
    delete window.Telegram;
    setPath('/');
  });

  it('does not treat Telegram launch params on ordinary routes as Telegram context', () => {
    setPath('/notes?tgWebAppData=unsafe');

    expect(isTelegramWebAppEnvironment()).toBe(false);
  });

  it('allows Telegram launch params only on the explicit Telegram route', () => {
    setPath('/telegram?tgWebAppData=signed-data');

    expect(isTelegramWebAppEnvironment()).toBe(true);
  });

  it('does not append the Telegram script outside the explicit Telegram route', async () => {
    setPath('/profile#tgWebAppVersion=7.0');

    const initialized = await initTelegramWebApp();

    expect(initialized).toBe(false);
    expect(document.querySelector(`script[src="${TELEGRAM_SCRIPT_SRC}"]`)).toBeNull();
  });
});