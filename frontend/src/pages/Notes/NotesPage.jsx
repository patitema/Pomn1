import React, { useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from '@entities/user'
import { Footer } from '@widgets/footer'
import { NoteGraph } from '@widgets/note-graph'
import { CreateNoteForm } from '@features/create-note'
import { useDeleteNoteMutation } from '@shared/api'
import './NotesPage.css'

const NotesPage = () => {
  document.title = 'POMNI - NOTES'
  const user = useSelector(selectUser)
  const [selectedNote, setSelectedNote] = useState(null)
  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false)
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)
  const [deleteNote] = useDeleteNoteMutation()

  const handleAddNote = () => {
    setIsCreateNoteModalOpen(true)
  }

  const handleAddFolder = () => {
    setIsCreateFolderModalOpen(true)
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
      `Вы уверены, что хотите удалить "${selectedNote.title}"?`
    )

    if (confirmDelete) {
      try {
        await deleteNote(selectedNote.id).unwrap()
        setSelectedNote(null) // Закрываем панель после удаления
      } catch (err) {
        console.error('Failed to delete note:', err)
        alert('Ошибка при удалении')
      }
    }
  }

  const handleColorChange = () => {
    if (!selectedNote) return
    // TODO: Реализовать модальное окно выбора цвета
    alert('Функция изменения цвета в разработке')
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
          />
        </div>
        <div className={`ReadFile ${selectedNote && !selectedNote.is_folder ? 'active' : ''}`}>
          <div className={`FileName ${selectedNote && !selectedNote.is_folder ? 'active' : ''}`}>
            <h3>{selectedNote ? selectedNote.title : 'Имя файла'}</h3>
          </div>
          <div className="Info">
            <div className="openInfo">
              <button className={`openInfoBtn ${selectedNote && !selectedNote.is_folder ? 'active' : ''}`}>
                <svg
                  className={`openInfoSvg ${selectedNote && !selectedNote.is_folder ? 'active' : ''}`}
                  onClick={handleClosePanel}
                >
                  <use href="/images/icons.svg#Arrow"></use>
                </svg>
              </button>
            </div>
            <div className={`FileInfo ${selectedNote && !selectedNote.is_folder ? 'active' : ''}`}>
              <textarea
                name="FileInfo"
                id="FileInfo"
                placeholder="Здесь пока пусто"
                value={selectedNote?.text || ''}
                readOnly
              ></textarea>
            </div>
          </div>
        </div>
        <div className="EditToolsContainer">
          <ul className="ToolsList">
            <button
              className={`toolButton ${!selectedNote ? 'available' : ''}`}
              onClick={handleAddNote}
              title="Добавить заметку"
              disabled={!!selectedNote}
            >
              <svg className={`toolIcon ${!selectedNote ? 'available' : ''}`}>
                <use href="/images/icons.svg#ToolAdd"></use>
              </svg>
            </button>
            <button
              className={`toolButton ${selectedNote ? 'available' : ''}`}
              title="Изменить цвет"
              disabled={!selectedNote}
              onClick={handleColorChange}
            >
              <svg className={`toolIcon ${selectedNote ? 'available' : ''}`}>
                <use href="/images/icons.svg#ToolColor"></use>
              </svg>
            </button>
            <button
              className={`toolButton ${!selectedNote ? 'available' : ''}`}
              onClick={handleAddFolder}
              title="Добавить папку"
              disabled={!!selectedNote}
            >
              <svg className={`toolIcon ${!selectedNote ? 'available' : ''}`}>
                <use href="/images/icons.svg#ToolFolder"></use>
              </svg>
            </button>
            <button
              className={`toolButton ${selectedNote ? 'available' : ''}`}
              title="Удалить"
              disabled={!selectedNote}
              onClick={handleDelete}
            >
              <svg className={`toolIcon ${selectedNote ? 'available' : ''}`}>
                <use href="/images/icons.svg#ToolDelete"></use>
              </svg>
            </button>
          </ul>
        </div>
      </main>
      <Footer />

      {/* Модальные окна */}
      <CreateNoteForm
        isOpen={isCreateNoteModalOpen}
        onClose={() => setIsCreateNoteModalOpen(false)}
      />

      <CreateNoteForm
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        isFolder={true}
      />
    </div>
  )
}

export default NotesPage
