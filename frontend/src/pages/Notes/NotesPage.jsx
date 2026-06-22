import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getTaskWeekQuery } from '@entities/task'
import { selectUser } from '@entities/user'
import { Footer } from '@widgets/footer'
import { NoteGraph } from '@widgets/note-graph'
import { NotesReader } from '@widgets/notes-reader'
import { NotesToolbar } from '@widgets/notes-toolbar'
import { TASK_PRIORITIES, TASK_STATUSES, TaskModal, useTaskModalController } from '@features/manage-task'
import { CreateNoteForm } from '@features/create-note'
import { EditNoteModal } from '@features/update-note'
import { EditFolderModal } from '@features/update-folder'
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
import './NotesPage.css'

const CONNECTION_MODE = {
  IDLE: 'idle',
  PICK_SOURCE: 'pick-source',
  PICK_TARGET: 'pick-target',
}

const NotesPage = () => {
  document.title = 'POMNI - NOTES'
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const { data: notes = [] } = useGetNotesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const { data: tasks = [] } = useGetTasksQuery(undefined, {
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
  const isReaderOpen = Boolean(selectedNote)
  const isConnectionModeActive = connectionMode !== CONNECTION_MODE.IDLE
  const notesMainClassName = [
    'notes-page__main',
    isReaderOpen ? 'notes-page__main--reader-open' : '',
    isFooterVisible ? 'notes-page__main--footer-visible' : '',
  ].filter(Boolean).join(' ')
  const taskModal = useTaskModalController({ deleteTask, updateTask })

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

  const cancelConnectionMode = () => {
    setConnectionMode(CONNECTION_MODE.IDLE)
    setConnectionSourceId(null)
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
  }, [isConnectionModeActive])

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
    if (!note || connectionMode === CONNECTION_MODE.IDLE) return

    if (connectionMode === CONNECTION_MODE.PICK_SOURCE) {
      setConnectionSourceId(note.id)
      setConnectionMode(CONNECTION_MODE.PICK_TARGET)
      return
    }

    if (!connectionSourceId || note.id === connectionSourceId) return

    try {
      const sourceNote = notes.find((item) => item.id === connectionSourceId)
      const targetNote = note
      const noteFolderPair = [sourceNote, targetNote]
      const childNote = noteFolderPair.find((item) => item && !item.is_folder)
      const folderNote = noteFolderPair.find((item) => item?.is_folder)

      if (childNote && folderNote && childNote.folder === folderNote.id) {
        cancelConnectionMode()
        return
      }

      if (childNote && folderNote && !childNote.folder) {
        await updateNote({
          id: childNote.id,
          body: { folder_id: folderNote.id },
        }).unwrap()
      } else {
        await createLink({
          note_from: connectionSourceId,
          note_to: note.id,
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
    if (!edge || connectionMode === CONNECTION_MODE.IDLE) return

    try {
      if (edge.type === 'folder') {
        await updateNote({
          id: edge.noteId,
          body: { folder_id: null },
        }).unwrap()
      } else if (edge.linkId) {
        await deleteLink(edge.linkId).unwrap()
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

  return (
    <div className="page-container">
      <header>
        <div className="Hcontainer">
          <div className="hTextContainer">
            <h1>POMNI</h1>
            <h2>{user ? user.username : 'BASE NAME'} BASE</h2>
          </div>
        </div>
      </header>
      <main className={notesMainClassName}>
        <div className="NotesContainer">
          <NoteGraph
            selectedNoteId={selectedNoteId}
            isReaderOpen={isReaderOpen}
            connectionMode={connectionMode}
            connectionSourceId={connectionSourceId}
            onNoteSelect={handleNoteSelect}
            onNoteEdit={handleGraphNoteEdit}
            onConnectionNodeClick={handleConnectionNodeClick}
            onConnectionEdgeClick={handleConnectionEdgeClick}
          />
        </div>

        <NotesReader
          selectedNote={selectedNote}
          notes={notes}
          tasks={tasks}
          onClose={handleClosePanel}
          onDeleteTask={handleDeleteTask}
          onEditTask={taskModal.openTaskModal}
          onOpenTaskWeek={handleOpenTaskWeek}
          onSelectNote={handleNoteSelect}
          onToggleTaskDone={handleToggleTaskDone}
        />

        <NotesToolbar
          selectedNote={selectedNote}
          onAddNote={handleAddNote}
          onEditNote={handleEditNote}
          onColorChange={handleColorChange}
          onDelete={handleDelete}
          onToggleConnectionMode={handleToggleConnectionMode}
          isConnectionModeActive={isConnectionModeActive}
        />
      </main>
      <div className="notes-page__footer-boundary" ref={footerBoundaryRef}>
        <Footer />
      </div>

      <CreateNoteForm
        isOpen={isCreateNoteModalOpen}
        onClose={() => setIsCreateNoteModalOpen(false)}
        onSwitchToFolder={handleSwitchToFolderCreate}
      />

      <CreateNoteForm
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        isFolder={true}
        onSwitchToNote={handleSwitchToNoteCreate}
      />

      <EditNoteModal
        note={selectedNote}
        folderOptions={notes.filter((note) => note.is_folder)}
        isOpen={isEditNoteModalOpen}
        links={links}
        onClose={() => setIsEditNoteModalOpen(false)}
        onUpdated={handleNoteUpdated}
      />

      <EditFolderModal
        folder={selectedNote?.is_folder ? selectedNote : null}
        isOpen={isEditFolderModalOpen}
        onClose={() => setIsEditFolderModalOpen(false)}
        onUpdated={handleNoteUpdated}
      />

      {taskModal.isTaskModalOpen && (
        <TaskModal
          taskForm={taskModal.taskForm}
          isEditing={true}
          error={taskModal.taskFormError}
          minDate={taskModal.minDate}
          minTime={taskModal.minTime}
          minDeadlineTime={taskModal.minDeadlineTime}
          noteOptions={noteOptions}
          priorities={TASK_PRIORITIES}
          statuses={TASK_STATUSES}
          onAddChecklistItem={taskModal.handleAddChecklistItem}
          onChange={taskModal.handleTaskFormChange}
          onChecklistItemChange={taskModal.handleChecklistItemChange}
          onClose={taskModal.closeTaskModal}
          onDelete={taskModal.handleDeleteTask}
          onRemoveChecklistItem={taskModal.handleRemoveChecklistItem}
          onSubmit={taskModal.handleSaveTask}
        />
      )}
    </div>
  )
}

export default NotesPage
