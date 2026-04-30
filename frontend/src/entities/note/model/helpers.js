export const isFolderNote = (note) => Boolean(note?.is_folder);

export const isRegularNote = (note) => Boolean(note) && !isFolderNote(note);

export const getNoteTitle = (note) => note?.title || `Заметка ${note?.id ?? ''}`.trim();

export const getNotePreview = (content, maxLength = 100) => {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  return `${content.slice(0, maxLength)}...`;
};

export const noteMatchesSearch = (note, search = '') =>
  getNoteTitle(note).toLowerCase().includes(search.toLowerCase());
