import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ReduxProvider } from './providers/ReduxProvider';
import { AppRoutes } from './providers/Router';

// Инициализация Telegram Web App
if (window.Telegram && window.Telegram.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
}

export const App = () => (
  <ReduxProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </ReduxProvider>
);
