import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { selectUser } from '@entities/user'
import { isFolderNote, isRegularNote } from '@entities/note'
import {
  useDeleteFolderMutation,
  useDeleteNoteMutation,
  useGetFoldersQuery,
  useGetNotesQuery,
  useUpdateNoteMutation,
} from '@shared/api'
import { formatDateTime } from '@shared/lib'
import { FolderBrowser } from '@widgets/folder-browser'
import { EditToggle } from '@features/edit-item'
import { CreateNoteForm } from '@features/create-note'
import { EditFolderModal } from '@features/update-folder'
import { Footer } from '@widgets/footer'
import './FoldersPage.css'

const FoldersPage = () => {
  document.title = 'POMNI - FOLDER'
  const user = useSelector(selectUser)

  const { data: notes = [], isLoading: notesLoading } = useGetNotesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const { data: folders = [], isLoading: foldersLoading } = useGetFoldersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const regularNotes = notes.filter(isRegularNote)

  const [updateNote] = useUpdateNoteMutation()
  const [deleteNoteMutation] = useDeleteNoteMutation()
  const [deleteFolderMutation] = useDeleteFolderMutation()

  const [openFolders, setOpenFolders] = useState(new Set())
  const [openNotes, setOpenNotes] = useState(new Set())
  const [search, setSearch] = useState('')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isFolderEditOpen, setIsFolderEditOpen] = useState(false)
  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false)
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)
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
    if (type === 'folder') {
      setEditItem(item)
      setEditType(type)
      setIsFolderEditOpen(true)
      return
    }

    setEditItem(item)
    setEditType(type)
    setIsEditOpen(true)
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

  const closeEdit = () => {
    setIsEditOpen(false)
    setEditItem(null)
    setEditType('')
  }

  const closeFolderEdit = () => {
    setIsFolderEditOpen(false)
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
          <FolderBrowser
            folders={folders}
            notes={regularNotes}
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
            formatDate={formatDateTime}
          />
        </main>

        <EditToggle
          isOpen={isEditOpen}
          onClose={closeEdit}
          item={editItem}
          type={editType}
        />

        <EditFolderModal
          folder={editType === 'folder' ? editItem : null}
          isOpen={isFolderEditOpen}
          onClose={closeFolderEdit}
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

        <Footer />
      </div>
    </DndContext>
  )
}

export default FoldersPage
