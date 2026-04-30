export const formatDateTime = (dateString, locale = 'ru-RU') => {
  const date = new Date(dateString);

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
