const TELEGRAM_SCRIPT_SRC = 'https://telegram.org/js/telegram-web-app.js';

const isTelegramWebAppEnvironment = () => {
  const launchParams = `${window.location.search}${window.location.hash}`;
  return (
    launchParams.includes('tgWebAppData')
    || launchParams.includes('tgWebAppVersion')
    || window.navigator.userAgent.includes('Telegram')
  );
};

const loadTelegramScript = () => new Promise((resolve, reject) => {
  const existingScript = document.querySelector(`script[src="${TELEGRAM_SCRIPT_SRC}"]`);

  if (existingScript) {
    existingScript.addEventListener('load', resolve, { once: true });
    existingScript.addEventListener('error', reject, { once: true });
    return;
  }

  const script = document.createElement('script');
  script.src = TELEGRAM_SCRIPT_SRC;
  script.async = true;
  script.addEventListener('load', resolve, { once: true });
  script.addEventListener('error', reject, { once: true });
  document.head.appendChild(script);
});

export const initTelegramWebApp = async () => {
  if (!isTelegramWebAppEnvironment()) {
    return false;
  }

  if (!window.Telegram?.WebApp) {
    await loadTelegramScript();
  }

  if (!window.Telegram?.WebApp) {
    return false;
  }

  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
  return true;
};
