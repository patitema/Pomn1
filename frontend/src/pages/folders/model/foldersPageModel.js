import { isFolderNote } from '@entities/note'

export const getTargetFolderId = (targetId) => (targetId === 'root' ? null : Number(targetId))

export const toggleSetValue = (currentSet, value) => {
  const nextSet = new Set(currentSet)

  if (nextSet.has(value)) {
    nextSet.delete(value)
  } else {
    nextSet.add(value)
  }

  return nextSet
}

export const updateFolderFiltersField = (currentFilters, name, value) => ({
  ...currentFilters,
  [name]: value,
})

export const createNoteMoveRequest = ({ activeId, overId, regularNotes, notes }) => {
  if (!overId) return null

  const noteId = Number(activeId)
  const currentNote = regularNotes.find((note) => note.id === noteId)

  if (!currentNote) return null

  const newFolderId = getTargetFolderId(overId)
  const targetFolderExists = newFolderId === null || notes.some(
    (note) => note.id === newFolderId && isFolderNote(note)
  )

  if (!targetFolderExists || noteId === newFolderId) {
    return null
  }

  if (currentNote.folder === newFolderId) {
    return null
  }

  return {
    id: noteId,
    body: { folder_id: newFolderId },
  }
}
