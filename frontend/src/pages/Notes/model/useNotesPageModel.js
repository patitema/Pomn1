import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getTaskWeekQuery } from '@entities/task'
import { selectUser } from '@entities/user'
import { TASK_PRIORITIES, TASK_STATUSES, useTaskModalController } from '@features/manage-task'
import {
  useCreateLinkMutation,
  useDeleteLinkMutation,
  useDeleteTaskMutation,
  useDeleteNoteMutation,
  useGetLinksQuery,
  useGetNotesQuery,
  useGetTasksQuery,
  useUpdateNoteMutation,
  useUpdateTaskMutation,
} from '@shared/api'
import { getNotesMainClassName } from './notesLayout'
import { useMobileScrollLock } from './useMobileScrollLock'
import {
  CONNECTION_MODE,
  getConnectionEdgeDeleteRequest,
  getConnectionNodeAction,
} from './notesConnection'

export const useNotesPageModel = () => {
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const { data: notes = [] } = useGetNotesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const { data: tasks = [] } = useGetTasksQuery({ scope: 'regular' }, {
    refetchOnMountOrArgChange: true,
  })
  const { data: links = [] } = useGetLinksQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false)
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false)
  const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false)
  const [deleteNote] = useDeleteNoteMutation()
  const [deleteTask] = useDeleteTaskMutation()
  const [createLink] = useCreateLinkMutation()
  const [deleteLink] = useDeleteLinkMutation()
  const [updateNote] = useUpdateNoteMutation()
  const [updateTask] = useUpdateTaskMutation()
  const [connectionMode, setConnectionMode] = useState(CONNECTION_MODE.IDLE)
  const [connectionSourceId, setConnectionSourceId] = useState(null)
  const [isFooterVisible, setIsFooterVisible] = useState(false)
  const footerBoundaryRef = useRef(null)

  const selectedNote = notes.find((note) => note.id === selectedNoteId) || null
  const noteOptions = notes.filter((note) => !note.is_folder)
  const folderOptions = notes.filter((note) => note.is_folder)
  const isReaderOpen = Boolean(selectedNote)
  const isConnectionModeActive = connectionMode !== CONNECTION_MODE.IDLE
  const notesMainClassName = getNotesMainClassName({ isFooterVisible, isReaderOpen })
  const taskModal = useTaskModalController({ deleteTask, updateTask })

  useMobileScrollLock(isReaderOpen)

  const cancelConnectionMode = useCallback(() => {
    setConnectionMode(CONNECTION_MODE.IDLE)
    setConnectionSourceId(null)
  }, [])

  const closeCreateNote = () => {
    setIsCreateNoteModalOpen(false)
  }

  const closeCreateFolder = () => {
    setIsCreateFolderModalOpen(false)
  }

  const closeEditNote = () => {
    setIsEditNoteModalOpen(false)
  }

  const closeEditFolder = () => {
    setIsEditFolderModalOpen(false)
  }

  const handleAddNote = () => {
    setIsCreateNoteModalOpen(true)
  }

  const handleSwitchToFolderCreate = () => {
    setIsCreateNoteModalOpen(false)
    setIsCreateFolderModalOpen(true)
  }

  const handleSwitchToNoteCreate = () => {
    setIsCreateFolderModalOpen(false)
    setIsCreateNoteModalOpen(true)
  }

  const handleEditNote = () => {
    if (!selectedNote) return

    if (selectedNote.is_folder) {
      setIsEditFolderModalOpen(true)
    } else {
      setIsEditNoteModalOpen(true)
    }
  }

  const handleGraphNoteEdit = (note) => {
    if (!note) return

    setSelectedNoteId(note.id)
    if (note.is_folder) {
      setIsEditFolderModalOpen(true)
    } else {
      setIsEditNoteModalOpen(true)
    }
  }

  const handleNoteSelect = (note) => {
    setSelectedNoteId(note?.id ?? null)
  }

  const handleToggleConnectionMode = () => {
    if (isConnectionModeActive) {
      cancelConnectionMode()
      return
    }

    if (selectedNote) {
      setConnectionSourceId(selectedNote.id)
      setSelectedNoteId(null)
      setConnectionMode(CONNECTION_MODE.PICK_TARGET)
      return
    }

    setConnectionMode(CONNECTION_MODE.PICK_SOURCE)
  }

  useEffect(() => {
    if (!isConnectionModeActive) return undefined

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        cancelConnectionMode()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [cancelConnectionMode, isConnectionModeActive])

  useEffect(() => {
    const footerBoundary = footerBoundaryRef.current

    if (!footerBoundary) {
      return undefined
    }

    let animationFrameId = null

    const updateFooterVisibility = () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId)
      }

      animationFrameId = window.requestAnimationFrame(() => {
        const footerTop = footerBoundary.getBoundingClientRect().top

        setIsFooterVisible(footerTop <= window.innerHeight)
        animationFrameId = null
      })
    }

    updateFooterVisibility()
    window.addEventListener('scroll', updateFooterVisibility, { passive: true })
    window.addEventListener('resize', updateFooterVisibility)

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId)
      }

      window.removeEventListener('scroll', updateFooterVisibility)
      window.removeEventListener('resize', updateFooterVisibility)
    }
  }, [])

  const handleConnectionNodeClick = async (note) => {
    const action = getConnectionNodeAction({
      connectionMode,
      connectionSourceId,
      notes,
      targetNote: note,
    })

    if (!action) return

    if (action.type === 'pick-source') {
      setConnectionSourceId(action.sourceId)
      setConnectionMode(CONNECTION_MODE.PICK_TARGET)
      return
    }

    if (action.type === 'cancel') {
      cancelConnectionMode()
      return
    }

    try {
      if (action.type === 'assign-folder') {
        await updateNote({
          id: action.noteId,
          body: { folder_id: action.folderId },
        }).unwrap()
      } else if (action.type === 'create-link') {
        await createLink({
          note_from: action.noteFrom,
          note_to: action.noteTo,
        }).unwrap()
      }
      setSelectedNoteId(null)
      cancelConnectionMode()
    } catch (err) {
      console.error('Failed to create link:', err)
      alert('Не удалось создать связь.')
      cancelConnectionMode()
    }
  }

  const handleNoteUpdated = (note) => {
    setSelectedNoteId(note?.id ?? selectedNoteId)
  }

  const handleClosePanel = () => {
    setSelectedNoteId(null)
  }

  const handleDelete = async () => {
    if (!selectedNote) return

    const confirmDelete = window.confirm(
      `Удалить заметку "${selectedNote.title}"?`
    )

    if (confirmDelete) {
      try {
        await deleteNote(selectedNote.id).unwrap()
        setSelectedNoteId(null)
      } catch (err) {
        console.error('Failed to delete note:', err)
        alert('Не удалось удалить заметку.')
      }
    }
  }

  const handleColorChange = () => {
    if (!selectedNote) return
    alert('Изменение цвета пока в разработке.')
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

  const handleConnectionEdgeClick = async (edge) => {
    if (connectionMode === CONNECTION_MODE.IDLE) return

    const deleteRequest = getConnectionEdgeDeleteRequest(edge)
    if (!deleteRequest) return

    try {
      if (deleteRequest.type === 'clear-folder') {
        await updateNote({
          id: deleteRequest.noteId,
          body: { folder_id: null },
        }).unwrap()
      } else if (deleteRequest.type === 'delete-link') {
        await deleteLink(deleteRequest.linkId).unwrap()
      }
    } catch (err) {
      console.error('Failed to delete graph edge:', err)
      alert('Не удалось удалить связь.')
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
    closeCreateFolder,
    closeCreateNote,
    closeEditFolder,
    closeEditNote,
    connectionMode,
    connectionSourceId,
    folderOptions,
    footerBoundaryRef,
    handleAddNote,
    handleClosePanel,
    handleColorChange,
    handleConnectionEdgeClick,
    handleConnectionNodeClick,
    handleDelete,
    handleDeleteTask,
    handleEditNote,
    handleGraphNoteEdit,
    handleNoteSelect,
    handleNoteUpdated,
    handleOpenTaskWeek,
    handleSwitchToFolderCreate,
    handleSwitchToNoteCreate,
    handleToggleConnectionMode,
    handleToggleTaskDone,
    isConnectionModeActive,
    isCreateFolderModalOpen,
    isCreateNoteModalOpen,
    isEditFolderModalOpen,
    isEditNoteModalOpen,
    isReaderOpen,
    links,
    noteOptions,
    notes,
    notesMainClassName,
    selectedNote,
    selectedNoteId,
    taskModal,
    tasks,
    taskPriorities: TASK_PRIORITIES,
    taskStatuses: TASK_STATUSES,
    user,
  }
}