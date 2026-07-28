import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectUser } from '@entities/user'
import { getTaskWeekQuery } from '@entities/task'
import { isRegularNote } from '@entities/note'
import {
  useDeleteTaskMutation,
  useDeleteFolderMutation,
  useDeleteNoteMutation,
  useGetFoldersQuery,
  useGetNotesQuery,
  useGetTasksQuery,
  useUpdateTaskMutation,
  useUpdateNoteMutation,
} from '@shared/api'
import { DEFAULT_FOLDER_VIEW_FILTERS } from '@widgets/folder-tree'
import { useTaskModalController } from '@features/manage-task'
import {
  createNoteMoveRequest,
  toggleSetValue,
  updateFolderFiltersField,
} from './foldersPageModel'

export const useFoldersPageModel = () => {
  const navigate = useNavigate()
  const user = useSelector(selectUser)

  const { data: notes = [], isLoading: notesLoading } = useGetNotesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const { data: folders = [], isLoading: foldersLoading } = useGetFoldersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const { data: tasks = [], isLoading: tasksLoading } = useGetTasksQuery({ scope: 'regular' }, {
    refetchOnMountOrArgChange: true,
  })
  const regularNotes = notes.filter(isRegularNote)

  const [updateNote] = useUpdateNoteMutation()
  const [updateTask] = useUpdateTaskMutation()
  const [deleteNoteMutation] = useDeleteNoteMutation()
  const [deleteFolderMutation] = useDeleteFolderMutation()
  const [deleteTask] = useDeleteTaskMutation()

  const [openFolders, setOpenFolders] = useState(new Set())
  const [openNotes, setOpenNotes] = useState(new Set())
  const [folderFilters, setFolderFilters] = useState(DEFAULT_FOLDER_VIEW_FILTERS)
  const [isNoteEditOpen, setIsNoteEditOpen] = useState(false)
  const [isFolderEditOpen, setIsFolderEditOpen] = useState(false)
  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false)
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editType, setEditType] = useState('')
  const taskModal = useTaskModalController({ deleteTask, updateTask })

  const handleDragEnd = async (event) => {
    const moveRequest = createNoteMoveRequest({
      activeId: event.active.id,
      overId: event.over?.id,
      regularNotes,
      notes,
    })

    if (!moveRequest) return

    try {
      await updateNote(moveRequest).unwrap()
    } catch (err) {
      console.error('Ошибка перемещения заметки:', err)
      alert('Не удалось переместить заметку.')
    }
  }

  const toggleNote = (noteId) => {
    setOpenNotes((currentOpenNotes) => toggleSetValue(currentOpenNotes, noteId))
  }

  const toggleFolder = (folderId) => {
    setOpenFolders((currentOpenFolders) => toggleSetValue(currentOpenFolders, folderId))
  }

  const handleFolderFilterChange = (name, value) => {
    setFolderFilters((currentFilters) => updateFolderFiltersField(currentFilters, name, value))
  }

  const resetFolderFilters = () => {
    setFolderFilters(DEFAULT_FOLDER_VIEW_FILTERS)
  }

  const openEdit = (item, type) => {
    setEditItem(item)
    setEditType(type)

    if (type === 'folder') {
      setIsFolderEditOpen(true)
    } else {
      setIsNoteEditOpen(true)
    }
  }

  const openCreateNote = () => {
    setIsCreateNoteModalOpen(true)
  }

  const closeCreateNote = () => {
    setIsCreateNoteModalOpen(false)
  }

  const closeCreateFolder = () => {
    setIsCreateFolderModalOpen(false)
  }

  const switchToFolderCreate = () => {
    setIsCreateNoteModalOpen(false)
    setIsCreateFolderModalOpen(true)
  }

  const switchToNoteCreate = () => {
    setIsCreateFolderModalOpen(false)
    setIsCreateNoteModalOpen(true)
  }

  const closeNoteEdit = () => {
    setIsNoteEditOpen(false)
    setEditItem(null)
    setEditType('')
  }

  const closeFolderEdit = () => {
    setIsFolderEditOpen(false)
    setEditItem(null)
    setEditType('')
  }

  const handleItemUpdated = (updatedItem) => {
    setEditItem(updatedItem ?? null)
  }

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNoteMutation(noteId).unwrap()
    } catch (err) {
      console.error('Ошибка удаления заметки:', err)
      alert('Не удалось удалить заметку.')
    }
  }

  const handleDeleteFolder = async (folderId) => {
    try {
      await deleteFolderMutation(folderId).unwrap()
    } catch (err) {
      console.error('Ошибка удаления папки:', err)
      alert('Не удалось удалить папку.')
    }
  }

  const handleToggleTaskDone = async (task) => {
    try {
      await updateTask({
        id: task.id,
        body: { status: task.status === 'done' ? 'planned' : 'done' },
      }).unwrap()
    } catch (err) {
      console.error('Failed to update task:', err)
      alert('Не удалось обновить задачу.')
    }
  }

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Удалить задачу "${task.title}"?`)) return

    try {
      await deleteTask(task.id).unwrap()
    } catch (err) {
      console.error('Failed to delete task:', err)
      alert('Не удалось удалить задачу.')
    }
  }

  const handleOpenTaskWeek = (task) => {
    navigate(getTaskWeekQuery(task))
  }

  return {
    editItem,
    editType,
    folderFilters,
    folders,
    handleDeleteFolder,
    handleDeleteNote,
    handleDeleteTask,
    handleDragEnd,
    handleFolderFilterChange,
    handleItemUpdated,
    handleOpenTaskWeek,
    handleToggleTaskDone,
    isCreateFolderModalOpen,
    isCreateNoteModalOpen,
    isFolderEditOpen,
    isLoading: notesLoading || foldersLoading || tasksLoading,
    isNoteEditOpen,
    notes,
    openCreateNote,
    openFolders,
    openNotes,
    regularNotes,
    resetFolderFilters,
    taskModal,
    tasks,
    toggleFolder,
    toggleNote,
    user,
    closeCreateFolder,
    closeCreateNote,
    closeFolderEdit,
    closeNoteEdit,
    openEdit,
    switchToFolderCreate,
    switchToNoteCreate,
  }
}
