export const formatFolderDate = (dateString) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(dateString));
};

export const countFolderNotes = (folderId, allNotes) => {
  return allNotes.filter((note) => note.parent === folderId).length;
};
