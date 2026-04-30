import { createSelector } from '@reduxjs/toolkit';
import { isRegularNote } from './helpers';

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

export const selectNoteById = (id) =>
  createSelector([selectAllNotes], (notes) => notes.find((note) => note.id === id));

export const selectNotesByFolderId = (folderId) =>
  createSelector([selectAllNotes], (notes) =>
    notes.filter((note) => note.folder === folderId)
  );

export const selectRootNotes = createSelector(
  [selectAllNotes],
  (notes) => notes.filter((note) => note.folder === null)
);

export const selectOnlyNotes = createSelector(
  [selectAllNotes],
  (notes) => notes.filter(isRegularNote)
);
