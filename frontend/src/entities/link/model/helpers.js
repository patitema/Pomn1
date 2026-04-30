export const getLinkEndpoints = (link) => [link?.note_from, link?.note_to];

export const isLinkConnectedToNote = (link, noteId) =>
  link?.note_from === noteId || link?.note_to === noteId;
