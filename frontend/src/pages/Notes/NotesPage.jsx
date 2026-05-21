import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from '@entities/user'
import { Footer } from '@widgets/footer'
import { NoteGraph } from '@widgets/note-graph'
import { NotesReader } from '@widgets/notes-reader'
import { NotesToolbar } from '@widgets/notes-toolbar'
import { CreateNoteForm } from '@features/create-note'
import { EditNoteModal } from '@features/update-note'
import { EditFolderModal } from '@features/update-folder'
import {
  useCreateLinkMutation,
  useDeleteNoteMutation,
  useGetNotesQuery,
} from '@shared/api'
import './NotesPage.css'

const CONNECTION_MODE = {
  IDLE: 'idle',
  PICK_SOURCE: 'pick-source',
  PICK_TARGET: 'pick-target',
}

const NotesPage = () => {
  document.title = 'POMNI - NOTES'
  const user = useSelector(selectUser)
  const { data: notes = [] } = useGetNotesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false)
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false)
  const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false)
  const [deleteNote] = useDeleteNoteMutation()
  const [createLink] = useCreateLinkMutation()
  const [connectionMode, setConnectionMode] = useState(CONNECTION_MODE.IDLE)
  const [connectionSourceId, setConnectionSourceId] = useState(null)

  const selectedNote = notes.find((note) => note.id === selectedNoteId) || null
  const isReaderOpen = Boolean(selectedNote)
  const isConnectionModeActive = connectionMode !== CONNECTION_MODE.IDLE

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

  const handleConnectionNodeClick = async (note) => {
    if (!note || connectionMode === CONNECTION_MODE.IDLE) return

    if (connectionMode === CONNECTION_MODE.PICK_SOURCE) {
      setConnectionSourceId(note.id)
      setConnectionMode(CONNECTION_MODE.PICK_TARGET)
      return
    }

    if (!connectionSourceId || note.id === connectionSourceId) return

    try {
      await createLink({
        note_from: connectionSourceId,
        note_to: note.id,
      }).unwrap()
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
      <main className={`notes-page__main ${isReaderOpen ? 'notes-page__main--reader-open' : ''}`}>
        <div className="NotesContainer">
          <NoteGraph
            selectedNoteId={selectedNoteId}
            isReaderOpen={isReaderOpen}
            connectionMode={connectionMode}
            connectionSourceId={connectionSourceId}
            onNoteSelect={handleNoteSelect}
            onNoteEdit={handleGraphNoteEdit}
            onConnectionNodeClick={handleConnectionNodeClick}
          />
        </div>

        <NotesReader selectedNote={selectedNote} onClose={handleClosePanel} />

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
      <Footer />

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
        isOpen={isEditNoteModalOpen}
        onClose={() => setIsEditNoteModalOpen(false)}
        onUpdated={handleNoteUpdated}
      />

      <EditFolderModal
        folder={selectedNote?.is_folder ? selectedNote : null}
        isOpen={isEditFolderModalOpen}
        onClose={() => setIsEditFolderModalOpen(false)}
        onUpdated={handleNoteUpdated}
      />
    </div>
  )
}

export default NotesPage
