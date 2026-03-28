import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../context/ApiContext'
import axios from 'axios'

// Базовый URL для API (может быть относительным для nginx)
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api'
// Убираем trailing slash для консистентности
const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL

export function useNote() {
  const [notes, setNotes] = useState([])
  const { fetchNotes } = useApi()

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const addNote = useCallback(
    async (noteData) => {
      const token = localStorage.getItem('token')

      try {
        await axios.post(`${baseUrl}/notes/`, noteData, {
          headers: {
            Authorization: token ? `Token ${token}` : '',
          },
        })

        fetchNotes()
      } catch (error) {
        const errorMsg = error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message
        throw new Error(`Ошибка создания заметки: ${errorMsg}`)
      }
    },
    [fetchNotes]
  )

  const deleteNote = useCallback(async (id) => {
    const token = localStorage.getItem('token')

    try {
      await axios.delete(`${baseUrl}/notes/${id}/`, {
        headers: {
          Authorization: token ? `Token ${token}` : '',
        },
      })

      setNotes((prev) => prev.filter((note) => note.id !== id))
    } catch (error) {
      const errorMsg = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message
      throw new Error(`Ошибка при удалении заметки: ${errorMsg}`)
    }
  }, [])

  return { notes, addNote, deleteNote, fetchNotes }
}
