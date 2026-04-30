import { createSelector } from '@reduxjs/toolkit';
import { getChildFolders } from './helpers';

const selectFoldersQuery = (state) => state.api.queries.getFolders;

export const selectAllFolders = createSelector(
  [selectFoldersQuery],
  (query) => query?.data || []
);

export const selectFoldersLoading = createSelector(
  [selectFoldersQuery],
  (query) => query?.isLoading || false
);

export const selectFoldersError = createSelector(
  [selectFoldersQuery],
  (query) => query?.error || null
);

export const selectFolderById = (id) =>
  createSelector([selectAllFolders], (folders) =>
    folders.find((folder) => folder.id === id)
  );

export const selectChildFolders = (folderId) =>
  createSelector([selectAllFolders], (folders) => {
    const folder = folders.find((item) => item.id === folderId);
    return getChildFolders(folder);
  });

export const selectRootFolders = createSelector(
  [selectAllFolders],
  (folders) => folders.filter((folder) => folder.folder == null)
);
