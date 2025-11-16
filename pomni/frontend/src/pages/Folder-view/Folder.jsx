// src/pages/Folder-view/Folder.jsx

import React, { useState, useEffect } from 'react'

import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'

import { useNavigate } from 'react-router-dom'

import './Folder.css'

import Nav from '../../components/nav/nav'
import Footer from '../../components/footer/footer'
import CreateNoteToggle from '../../components/createNoteBtn/CreateNoteToggle'
import EditToggle from '../../components/editToggle/EditToggle'
import { DraggableNote } from '../../components/draggableNote/DraggableNote'
import { DroppableFolder } from '../../components/DroppableFolder/DroppableFolder'

import { useApi } from '../../context/ApiContext'
import { useUsers } from '../../hooks/UseUsers'

function RootDropZone({ children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'root',
  })

  const style = {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    backgroundColor: isOver ? '#333' : 'transparent',
    minHeight: '100px',
    borderRadius: '5px',
    transition: 'background-color 0.2s ease',
    width: '60vw',
  }

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  )
}

export default function Folder() {
  document.title = 'POMNI - FOLDER'
  const navigate = useNavigate()
  const { token } = useUsers()
  const { user, fetchCurrentUser } = useUsers()

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  useEffect(() => {
    if (!token) {
      navigate('/Auth')
    }
  }, [token, navigate])

  const {
    folders,
    notes,
    setNotes,
    loading,
    deleteNote,
    deleteFolder,
    updateNote,
  } = useApi()

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

  const handleDragEnd = (event) => {
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

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId ? { ...note, folder: newFolderId } : note
      )
    )

    const updatedNoteData = {
      ...currentNote,
      folder: newFolderId,
    }

    updateNote(noteId, updatedNoteData).catch((err) => {
      console.error('Ошибка перемещения заметки:', err)
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId ? { ...currentNote } : note
        )
      )
      alert('Не удалось переместить заметку.')
    })
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

  if (loading) return <p>Загрузка...</p>

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

  const unfolderNotes = notes.filter(
    (note) =>
      note.folder === null &&
      note.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div>
        <Nav />
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
                  deleteFolder={deleteFolder}
                  deleteNote={deleteNote}
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
                      deleteNote={deleteNote}
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
