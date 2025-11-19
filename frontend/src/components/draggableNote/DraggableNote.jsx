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
    id: note.id, // ID заметки (должен быть числом)
  })

  // Стили для перемещения
  const style = {
    marginLeft: `${marginLeft}px`,
    // Применяем transform для визуального перемещения
    transform: CSS.Translate.toString(transform),
    // Визуальный фидбек при перетаскивании
    opacity: transform ? 0.8 : 1,
    zIndex: transform ? 1000 : 'auto',
  }

  return (
    <li
      // ref и style остаются на <li> для правильной структуры и позиционирования
      ref={setNodeRef}
      style={style}
      key={`note-${note.id}`}
      className={`stroke note-item ${className}`}
    >
      <div
        className="note-main"
        // 💡 СЛУШАТЕЛИ D&D ПЕРЕНЕСЕНЫ СЮДА (Это "ручка" для перетаскивания)
        {...listeners}
        {...attributes}
        // onClick остается на "ручке" для открытия/закрытия
        onClick={() => toggleNote(note.id)}
        style={{ cursor: 'grab' }} // Визуальный индикатор, что можно перетаскивать
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
