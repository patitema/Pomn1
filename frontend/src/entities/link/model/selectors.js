import { createSelector } from '@reduxjs/toolkit';

// Базовый селектор связей из RTK Query
const selectLinksQuery = (state) => state.api.queries.getLinks;

export const selectAllLinks = createSelector(
  [selectLinksQuery],
  (query) => query?.data || []
);

export const selectLinksLoading = createSelector(
  [selectLinksQuery],
  (query) => query?.isLoading || false
);

export const selectLinksError = createSelector(
  [selectLinksQuery],
  (query) => query?.error || null
);

// Селектор связей по ID заметки
export const selectLinksByNoteId = (noteId) => createSelector(
  [selectAllLinks],
  (links) => links.filter(link =>
    link.note_from === noteId || link.note_to === noteId
  )
);
