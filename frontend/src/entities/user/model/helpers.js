export const getInitials = (username) => {
  if (!username) return '';
  return username
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatUserName = (user) => {
  if (!user) return '';
  return user.username || user.email || 'Пользователь';
};
