import React, { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'

const handleDragEnd = (event) => {
  const { active, over } = event

  // ... (Проверка, куда бросили) ...

  const currentNote = notes.find((n) => n.id === noteId)
  // ... (Определение нового ID папки) ...

  // 1. Сначала обновляем локальный стейт (UI) для мгновенного отклика
  setNotes((prevNotes) =>
    prevNotes.map((note) =>
      note.id === noteId ? { ...note, folder: newFolderId } : note
    )
  )

  // 2. БЛОК ОТПРАВКИ ЗАПРОСА НА СЕРВЕР:
  const updatedNoteData = {
    ...currentNote,
    folder: newFolderId, // Это ключевое изменение
  }

  // Вызываем ваш updateNote из ApiContext для отправки PUT/PATCH запроса
  updateNote(noteId, updatedNoteData).catch((err) => {
    console.error('Ошибка перемещения заметки:', err)
    // Откат UI в случае ошибки
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === noteId ? { ...currentNote } : note))
    )
    alert('Не удалось переместить заметку.')
  })
}
return (
  <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
    {/* ... ваш код ... */}
  </DndContext>
)
