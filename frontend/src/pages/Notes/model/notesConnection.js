import { getLinkEndpoints } from '@entities/link'

export const CONNECTION_MODE = {
  IDLE: 'idle',
  PICK_SOURCE: 'pick-source',
  PICK_TARGET: 'pick-target',
}

export const getNoteFolderPair = (source, target) => {
  const items = [source, target]
  const childNote = items.find((item) => item && !item.is_folder)
  const folderNote = items.find((item) => item?.is_folder)

  return { childNote, folderNote }
}

export const isCurrentFolderPair = (source, target) => {
  const { childNote, folderNote } = getNoteFolderPair(source, target)
  return Boolean(childNote && folderNote && childNote.folder === folderNote.id)
}

export const hasExistingConnection = (links, sourceId, targetId) =>
  links.some((link) => {
    const [from, to] = getLinkEndpoints(link)
    return (
      (from === sourceId && to === targetId) ||
      (from === targetId && to === sourceId)
    )
  })

export const isValidConnectionTarget = ({ links = [], source, target }) =>
  Boolean(
    source &&
      target &&
      source.id !== target.id &&
      !isCurrentFolderPair(source, target) &&
      !hasExistingConnection(links, source.id, target.id)
  )

export const getConnectionNodeAction = ({
  connectionMode,
  connectionSourceId,
  notes = [],
  targetNote,
}) => {
  if (!targetNote || connectionMode === CONNECTION_MODE.IDLE) return null

  if (connectionMode === CONNECTION_MODE.PICK_SOURCE) {
    return {
      type: 'pick-source',
      sourceId: targetNote.id,
    }
  }

  if (!connectionSourceId || targetNote.id === connectionSourceId) return null

  const sourceNote = notes.find((item) => item.id === connectionSourceId)
  const { childNote, folderNote } = getNoteFolderPair(sourceNote, targetNote)

  if (childNote && folderNote && childNote.folder === folderNote.id) {
    return { type: 'cancel' }
  }

  if (childNote && folderNote && !childNote.folder) {
    return {
      type: 'assign-folder',
      noteId: childNote.id,
      folderId: folderNote.id,
    }
  }

  return {
    type: 'create-link',
    noteFrom: connectionSourceId,
    noteTo: targetNote.id,
  }
}

export const getConnectionEdgeDeleteRequest = (edge) => {
  if (!edge) return null

  if (edge.type === 'folder') {
    return {
      type: 'clear-folder',
      noteId: edge.noteId,
    }
  }

  if (edge.linkId) {
    return {
      type: 'delete-link',
      linkId: edge.linkId,
    }
  }

  return null
}