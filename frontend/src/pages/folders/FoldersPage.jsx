import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { selectUser } from '@entities/user'
import { getTaskWeekQuery } from '@entities/task'
import { isFolderNote, isRegularNote } from '@entities/note'
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
import { formatDateTime } from '@shared/lib'
import { CreateNoteForm } from '@features/create-note'
import { TASK_PRIORITIES, TASK_STATUSES, TaskModal, useTaskModalController } from '@features/manage-task'
import { EditNoteModal } from '@features/update-note'
import { EditFolderModal } from '@features/update-folder'
import { FolderBrowser } from '@widgets/folder-browser'
import { Footer } from '@widgets/footer'
import './FoldersPage.css'

const FoldersPage = () => {
  document.title = 'POMNI - FOLDER'
  const navigate = useNavigate()
  const user = useSelector(selectUser)

  const { data: notes = [], isLoading: notesLoading } = useGetNotesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const { data: folders = [], isLoading: foldersLoading } = useGetFoldersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const { data: tasks = [], isLoading: tasksLoading } = useGetTasksQuery(undefined, {
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
  const [search, setSearch] = useState('')
  const [isNoteEditOpen, setIsNoteEditOpen] = useState(false)
  const [isFolderEditOpen, setIsFolderEditOpen] = useState(false)
  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false)
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editType, setEditType] = useState('')
  const taskModal = useTaskModalController({ deleteTask, updateTask })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (!over) return

    const noteId = Number(active.id)
    const targetId = over.id

    const currentNote = regularNotes.find((note) => note.id === noteId)
    if (!currentNote) return

    const newFolderId = targetId === 'root' ? null : Number(targetId)
    const targetFolderExists = newFolderId === null || notes.some(
      (note) => note.id === newFolderId && isFolderNote(note)
    )

    if (!targetFolderExists || noteId === newFolderId) {
      return
    }

    if (currentNote.folder === newFolderId) {
      return
    }

    try {
      await updateNote({
        id: noteId,
        body: { folder_id: newFolderId },
      }).unwrap()
    } catch (err) {
      console.error('Ошибка перемещения заметки:', err)
      alert('Не удалось переместить заметку.')
    }
  }

  const toggleNote = (noteId) => {
    const newOpenNotes = new Set(openNotes)

    if (newOpenNotes.has(noteId)) {
      newOpenNotes.delete(noteId)
    } else {
      newOpenNotes.add(noteId)
    }

    setOpenNotes(newOpenNotes)
  }

  const toggleFolder = (folderId) => {
    const newOpenFolders = new Set(openFolders)

    if (newOpenFolders.has(folderId)) {
      newOpenFolders.delete(folderId)
    } else {
      newOpenFolders.add(folderId)
    }

    setOpenFolders(newOpenFolders)
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

  if (notesLoading || foldersLoading || tasksLoading) return <p>Загрузка...</p>

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="page-container">
        <header>
          <div className="Hcontainer">
            <div className="hTextContainer">
              <h1>POMNI</h1>
              <h2>{user ? user.username : 'None'} BASE</h2>
            </div>
          </div>
        </header>

        <main>
          <FolderBrowser
            folders={folders}
            notes={regularNotes}
            tasks={tasks}
            openFolders={openFolders}
            openNotes={openNotes}
            search={search}
            onSearchChange={setSearch}
            onToggleFolder={toggleFolder}
            onToggleNote={toggleNote}
            onOpenEdit={openEdit}
            onAddNote={openCreateNote}
            onDeleteFolder={handleDeleteFolder}
            onDeleteNote={handleDeleteNote}
            onDeleteTask={handleDeleteTask}
            onEditTask={taskModal.openTaskModal}
            onOpenTaskWeek={handleOpenTaskWeek}
            onToggleTaskDone={handleToggleTaskDone}
            formatDate={formatDateTime}
          />
        </main>

        <EditNoteModal
          note={editType === 'note' ? editItem : null}
          isOpen={isNoteEditOpen}
          onClose={closeNoteEdit}
          onUpdated={handleItemUpdated}
        />

        <EditFolderModal
          folder={editType === 'folder' ? editItem : null}
          isOpen={isFolderEditOpen}
          onClose={closeFolderEdit}
          onUpdated={handleItemUpdated}
        />

        <CreateNoteForm
          isOpen={isCreateNoteModalOpen}
          onClose={() => setIsCreateNoteModalOpen(false)}
          onSwitchToFolder={switchToFolderCreate}
        />

        <CreateNoteForm
          isOpen={isCreateFolderModalOpen}
          onClose={() => setIsCreateFolderModalOpen(false)}
          isFolder={true}
          onSwitchToNote={switchToNoteCreate}
        />

        {taskModal.isTaskModalOpen && (
          <TaskModal
            taskForm={taskModal.taskForm}
            isEditing={true}
            error={taskModal.taskFormError}
            minDate={taskModal.minDate}
            minTime={taskModal.minTime}
            minDeadlineTime={taskModal.minDeadlineTime}
            noteOptions={regularNotes}
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

        <Footer />
      </div>
    </DndContext>
  )
}

export default FoldersPage
