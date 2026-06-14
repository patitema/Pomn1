import { folderMatchesSearch, getChildFolders } from '@entities/folder'
import { noteMatchesSearch } from '@entities/note'

export const DEFAULT_FOLDER_VIEW_FILTERS = {
  search: '',
  itemType: 'all',
  taskState: 'all',
}

export const hasActiveFolderViewFilters = (filters = DEFAULT_FOLDER_VIEW_FILTERS) =>
  Boolean(filters.search?.trim()) ||
  filters.itemType !== DEFAULT_FOLDER_VIEW_FILTERS.itemType ||
  filters.taskState !== DEFAULT_FOLDER_VIEW_FILTERS.taskState

const getTaskNoteId = (task) => Number(task?.note ?? task?.note_id)

const noteHasLinkedTasks = (note, tasks = []) =>
  tasks.some((task) => getTaskNoteId(task) === Number(note?.id))

export const noteMatchesFolderViewFilters = (
  note,
  filters = DEFAULT_FOLDER_VIEW_FILTERS,
  tasks = []
) => {
  if (filters.itemType === 'folders') return false
  if (!noteMatchesSearch(note, filters.search)) return false

  if (filters.taskState === 'hasTasks') {
    return noteHasLinkedTasks(note, tasks)
  }

  if (filters.taskState === 'withoutTasks') {
    return !noteHasLinkedTasks(note, tasks)
  }

  return true
}

export const folderMatchesFolderViewFilters = (
  folder,
  filters = DEFAULT_FOLDER_VIEW_FILTERS
) => {
  if (filters.itemType === 'notes') return false
  if (filters.taskState !== 'all') return false
  return folderMatchesSearch(folder, filters.search)
}

export const folderBranchMatchesFilters = ({
  folder,
  filters = DEFAULT_FOLDER_VIEW_FILTERS,
  notes = [],
  tasks = [],
}) => {
  if (folderMatchesFolderViewFilters(folder, filters)) return true

  const hasMatchingNotes = notes.some(
    (note) => note.folder === folder.id && noteMatchesFolderViewFilters(note, filters, tasks)
  )

  if (hasMatchingNotes) return true

  return getChildFolders(folder).some((childFolder) =>
    folderBranchMatchesFilters({
      folder: childFolder,
      filters,
      notes,
      tasks,
    })
  )
}
