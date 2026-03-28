import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../context/ApiContext'
import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api'

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
        await axios.post(`${API_URL}/notes/`, noteData, {
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
      await axios.delete(`${API_URL}/notes/${id}/`, {
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
