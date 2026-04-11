import { createSelector } from '@reduxjs/toolkit';

// Базовый селектор заметок из RTK Query
const selectNotesQuery = (state) => state.api.queries.getNotes;

export const selectAllNotes = createSelector(
  [selectNotesQuery],
  (query) => query?.data || []
);

export const selectNotesLoading = createSelector(
  [selectNotesQuery],
  (query) => query?.isLoading || false
);

export const selectNotesError = createSelector(
  [selectNotesQuery],
  (query) => query?.error || null
);

// Селектор заметки по ID
export const selectNoteById = (id) => createSelector(
  [selectAllNotes],
  (notes) => notes.find((note) => note.id === id)
);

// Селектор заметок по папке
export const selectNotesByFolderId = (folderId) => createSelector(
  [selectAllNotes],
  (notes) => notes.filter((note) => note.parent === folderId)
);
