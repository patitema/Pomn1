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
import { Footer } from '@widgets/footer'
import './FoldersPage.css'

const FoldersPage = () => {
  document.title = 'POMNI - FOLDER'
  const user = useSelector(selectUser)

  const { data: notes = [], isLoading: notesLoading } = useGetNotesQuery()
  const { data: folders = [], isLoading: foldersLoading } = useGetFoldersQuery()
  const regularNotes = notes.filter(isRegularNote)

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
      console.error('РћС€РёР±РєР° РїРµСЂРµРјРµС‰РµРЅРёСЏ Р·Р°РјРµС‚РєРё:', err)
      alert('РќРµ СѓРґР°Р»РѕСЃСЊ РїРµСЂРµРјРµСЃС‚РёС‚СЊ Р·Р°РјРµС‚РєСѓ.')
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
      console.error('РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ Р·Р°РјРµС‚РєРё:', err)
      alert('РќРµ СѓРґР°Р»РѕСЃСЊ СѓРґР°Р»РёС‚СЊ Р·Р°РјРµС‚РєСѓ.')
    }
  }

  const handleDeleteFolder = async (folderId) => {
    try {
      await deleteFolderMutation(folderId).unwrap()
    } catch (err) {
      console.error('РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ РїР°РїРєРё:', err)
      alert('РќРµ СѓРґР°Р»РѕСЃСЊ СѓРґР°Р»РёС‚СЊ РїР°РїРєСѓ.')
    }
  }

  if (notesLoading || foldersLoading) return <p>Р—Р°РіСЂСѓР·РєР°...</p>

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

        <Footer />
      </div>
    </DndContext>
  )
}

export default FoldersPage
