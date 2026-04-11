import { createSelector } from '@reduxjs/toolkit';

// Базовый селектор папок из RTK Query
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

// Селектор папки по ID
export const selectFolderById = (id) => createSelector(
  [selectAllFolders],
  (folders) => folders.find((folder) => folder.id === id)
);

// Селектор дочерних папок
export const selectChildFolders = (parentId) => createSelector(
  [selectAllFolders],
  (folders) => folders.filter((folder) => folder.parent === parentId)
);

// Селектор корневых папок
export const selectRootFolders = createSelector(
  [selectAllFolders],
  (folders) => folders.filter((folder) => !folder.parent)
);
