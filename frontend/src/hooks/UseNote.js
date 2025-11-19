import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../context/ApiContext'

export function useNote() {
  const [notes, setNotes] = useState([])
  const { fetchNotes } = useApi()

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const addNote = useCallback(
    async (noteData) => {
      const token = localStorage.getItem('token')
      const response = await fetch('http://127.0.0.1:8000/api/notes/', {
        method: 'POST',
        headers: {
          Authorization: token ? `Token ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Ошибка создания заметки: ${text}`)
      }

      fetchNotes()
    },
    [fetchNotes]
  )

  const deleteNote = useCallback(async (id) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://127.0.0.1:8000/api/notes/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Token ${token}` : '',
      },
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Ошибка при удалении заметки: ${text}`)
    }

    setNotes((prev) => prev.filter((note) => note.id !== id))
  }, [])

  return { notes, addNote, deleteNote, fetchNotes }
}
