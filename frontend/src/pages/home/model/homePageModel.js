export const getHomePageCtaState = (isAuthenticated, routes) => ({
  landingLink: isAuthenticated ? routes.notes : routes.auth,
  headerLabel: isAuthenticated ? 'Перейти к заметкам' : 'Начать',
  mainLabel: isAuthenticated ? 'Перейти к заметкам' : 'Начать пользоваться',
});
