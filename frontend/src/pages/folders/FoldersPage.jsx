import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { selectIsAuthenticated, selectUser } from '@entities/user'
import { useGetNotesQuery, useGetFoldersQuery } from '@shared/api'
import {
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useDeleteFolderMutation,
} from '@shared/api'
import {
  DraggableNote,
  DroppableFolder,
  RootDropZone,
} from '@widgets/folder-tree'
import { CreateNoteToggle } from '@features/create-note-toggle'
import { EditToggle } from '@features/edit-item'
import { Footer } from '@widgets/footer'
import './FoldersPage.css'

const FoldersPage = () => {
  document.title = 'POMNI - FOLDER'
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)

  // Загружаем данные с сервера
  const { data: notes = [], isLoading: notesLoading } = useGetNotesQuery(undefined, { skip: !isAuthenticated })
  const { data: folders = [], isLoading: foldersLoading } = useGetFoldersQuery(undefined, { skip: !isAuthenticated })

  const [updateNote] = useUpdateNoteMutation()
  const [deleteNoteMutation] = useDeleteNoteMutation()
  const [deleteFolderMutation] = useDeleteFolderMutation()

  const [openFolders, setOpenFolders] = useState(new Set())
  const [openNotes, setOpenNotes] = useState(new Set())
  const [search, setSearch] = useState('')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editType, setEditType] = useState('')

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

    const currentNote = notes.find((n) => n.id === noteId)
    if (!currentNote) return

    const newFolderId = targetId === 'root' ? null : Number(targetId)

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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const openEdit = (item, type) => {
    setEditItem(item)
    setEditType(type)
    setIsEditOpen(true)
  }

  const closeEdit = () => {
    setIsEditOpen(false)
    setEditItem(null)
    setEditType('')
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

  const unfolderNotes = notes.filter(
    (note) =>
      note.folder === null &&
      note.title.toLowerCase().includes(search.toLowerCase())
  )

  if (!isAuthenticated) {
    return <Navigate to="/Auth" replace />
  }

  if (notesLoading || foldersLoading) return <p>Загрузка...</p>

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
          <div className="FolderContainer">
            <div className="navFolderView">
              <input
                className="SearchInput"
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <ul className="FileList">
              {folders.map((folder) => (
                <DroppableFolder
                  key={folder.id}
                  folder={folder}
                  level={0}
                  notes={notes}
                  openFolders={openFolders}
                  openNotes={openNotes}
                  toggleFolder={toggleFolder}
                  toggleNote={toggleNote}
                  openEdit={openEdit}
                  deleteFolder={handleDeleteFolder}
                  deleteNote={handleDeleteNote}
                  formatDate={formatDate}
                  search={search}
                />
              ))}

              <RootDropZone>
                {unfolderNotes.map((note) => {
                  const isNoteOpen = openNotes.has(note.id)
                  return (
                    <DraggableNote
                      key={`unfolder-note-${note.id}`}
                      note={note}
                      isNoteOpen={isNoteOpen}
                      toggleNote={toggleNote}
                      openEdit={openEdit}
                      deleteNote={handleDeleteNote}
                      formatDate={formatDate}
                      className="unfolder-stroke"
                    />
                  )
                })}
              </RootDropZone>
            </ul>

            <CreateNoteToggle
              onNoteCreated={(note) => console.log('Новая заметка:', note)}
            />
          </div>
        </main>

        <EditToggle
          isOpen={isEditOpen}
          onClose={closeEdit}
          item={editItem}
          type={editType}
        />

        <Footer />
      </div>
    </DndContext>
  )
}

export default FoldersPage
