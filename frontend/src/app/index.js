import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ReduxProvider } from './providers/ReduxProvider';
import { AppRoutes } from './providers/Router';
import { Navigation } from '@widgets/navigation';
import UserInit from './providers/UserInit/UserInit';

// Инициализация Telegram Web App
if (window.Telegram && window.Telegram.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
}

export const App = () => (
  <ReduxProvider>
    <BrowserRouter>
      <UserInit />
      <div className="app">
        <Navigation />
        <main className="app__content">
          <AppRoutes />
        </main>
      </div>
    </BrowserRouter>
  </ReduxProvider>
);
