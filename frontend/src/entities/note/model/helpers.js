export const isFolderNote = (note) => Boolean(note?.is_folder);

export const isRegularNote = (note) => Boolean(note) && !isFolderNote(note);

export const getNoteTitle = (note) => note?.title || `Заметка ${note?.id ?? ''}`.trim();

export const getNotePreview = (content, maxLength = 100) => {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  return `${content.slice(0, maxLength)}...`;
};

const normalizeSearchText = (value = '') => value.toString().trim().toLowerCase();

const stripMarkdownImagePayloads = (value = '') =>
  value.replace(/!\[[^\]]*]\(data:image\/[^)]+\)/gi, '');

export const noteMatchesSearch = (note, search = '') =>
  !normalizeSearchText(search) ||
  [
    getNoteTitle(note),
    stripMarkdownImagePayloads(note?.text || ''),
  ].some((value) => normalizeSearchText(value).includes(normalizeSearchText(search)));
