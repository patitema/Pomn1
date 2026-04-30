export const getFolderTitle = (folder) => folder?.title || `Папка ${folder?.id ?? ''}`.trim();

export const folderMatchesSearch = (folder, search = '') =>
  getFolderTitle(folder).toLowerCase().includes(search.toLowerCase());

export const getChildFolders = (folder) => folder?.children || [];

export const hasChildFolders = (folder) => getChildFolders(folder).length > 0;
