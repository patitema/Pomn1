import { createSelector } from '@reduxjs/toolkit';
import { isLinkConnectedToNote } from './helpers';

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

export const selectLinksByNoteId = (noteId) =>
  createSelector([selectAllLinks], (links) =>
    links.filter((link) => isLinkConnectedToNote(link, noteId))
  );
