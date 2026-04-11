import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

export function DraggableNote({
  note,
  isNoteOpen,
  toggleNote,
  openEdit,
  deleteNote,
  formatDate,
  marginLeft = 0,
  className = '',
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: note.id,
  })

  const style = {
    marginLeft: `${marginLeft}px`,
    transform: CSS.Translate.toString(transform),
    opacity: transform ? 0.8 : 1,
    zIndex: transform ? 1000 : 'auto',
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      key={`note-${note.id}`}
      className={`stroke note-item ${className}`}
    >
      <div
        className="note-main"
        {...listeners}
        {...attributes}
        onClick={() => toggleNote(note.id)}
        style={{ cursor: 'grab' }}
      >
        <p>{note.title || `Заметка ${note.id}`}</p>
        <div className="Tool-btns">
          <button
            className="edit-btn"
            onClick={(e) => {
              e.stopPropagation()
              openEdit(note, 'note')
            }}
          >
            <svg className="edit-icon" viewBox="0 0 30 30">
              <use href="/images/icons.svg#ToolEdit"></use>
            </svg>
          </button>
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation()
              deleteNote(note.id)
            }}
          >
            <svg className="delete-icon" viewBox="0 0 30 30">
              <use href="/images/icons.svg#ToolDelete"></use>
            </svg>
          </button>
        </div>
      </div>
      {isNoteOpen && (
        <div className="note-content">
          <div className="note-text">
            {note.text || 'Содержимое отсутствует'}
          </div>
          <div className="note-info">
            {note.created_at && formatDate(note.created_at)}
          </div>
        </div>
      )}
    </li>
  )
}

export default DraggableNote
