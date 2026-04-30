import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from '@entities/user'
import { Footer } from '@widgets/footer'
import { NoteGraph } from '@widgets/note-graph'
import { NotesReader } from '@widgets/notes-reader'
import { NotesToolbar } from '@widgets/notes-toolbar'
import { CreateNoteForm } from '@features/create-note'
import { EditNoteModal } from '@features/update-note'
import { useDeleteNoteMutation } from '@shared/api'
import './NotesPage.css'

const NotesPage = () => {
  document.title = 'POMNI - NOTES'
  const user = useSelector(selectUser)
  const [selectedNote, setSelectedNote] = useState(null)
  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false)
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false)
  const [deleteNote] = useDeleteNoteMutation()

  const handleAddNote = () => {
    setIsCreateNoteModalOpen(true)
  }

  const handleAddFolder = () => {
    setIsCreateFolderModalOpen(true)
  }

  const handleEditNote = () => {
    if (selectedNote && !selectedNote.is_folder) {
      setIsEditNoteModalOpen(true)
    }
  }

  const handleGraphNoteEdit = (note) => {
    if (note && !note.is_folder) {
      setSelectedNote(note)
      setIsEditNoteModalOpen(true)
    }
  }

  const handleNoteSelect = (note) => {
    setSelectedNote(note)
  }

  const handleClosePanel = () => {
    setSelectedNote(null)
  }

  const handleDelete = async () => {
    if (!selectedNote) return

    const confirmDelete = window.confirm(
      `Удалить заметку "${selectedNote.title}"?`
    )

    if (confirmDelete) {
      try {
        await deleteNote(selectedNote.id).unwrap()
        setSelectedNote(null)
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
      <main>
        <div className="NotesContainer">
          <NoteGraph
            selectedNoteId={selectedNote?.id}
            onNoteSelect={handleNoteSelect}
            onNoteEdit={handleGraphNoteEdit}
          />
        </div>

        <NotesReader selectedNote={selectedNote} onClose={handleClosePanel} />

        <NotesToolbar
          selectedNote={selectedNote}
          onAddNote={handleAddNote}
          onEditNote={handleEditNote}
          onColorChange={handleColorChange}
          onAddFolder={handleAddFolder}
          onDelete={handleDelete}
        />
      </main>
      <Footer />

      <CreateNoteForm
        isOpen={isCreateNoteModalOpen}
        onClose={() => setIsCreateNoteModalOpen(false)}
      />

      <CreateNoteForm
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        isFolder={true}
      />

      <EditNoteModal
        note={selectedNote}
        isOpen={isEditNoteModalOpen}
        onClose={() => setIsEditNoteModalOpen(false)}
      />
    </div>
  )
}

export default NotesPage
