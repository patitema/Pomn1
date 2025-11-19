import React, { createContext, useContext, useEffect, useState } from 'react'

const ApiContext = createContext()

export const ApiProvider = ({ children }) => {
  const [notes, setNotes] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotes = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('http://127.0.0.1:8000/api/notes/', {
        headers: {
          Authorization: token ? `Token ${token}` : '',
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      setNotes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Ошибка загрузки заметок:', error)
      setNotes([])
    }
  }

  const fetchFolders = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('http://127.0.0.1:8000/api/folders/', {
        headers: {
          Authorization: token ? `Token ${token}` : '',
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      setFolders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Ошибка загрузки папок:', error)
      setFolders([])
    }
  }

  const deleteNote = async (noteId) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Token ${token}` : '',
        },
      })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      await fetchNotes()
    } catch (error) {
      console.error('Ошибка удаления заметки:', error)
    }
  }

  const deleteFolder = async (folderId) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/folders/${folderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Token ${token}` : '',
        },
      })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      await fetchFolders()
    } catch (error) {
      console.error('Ошибка удаления папки:', error)
    }
  }

  const updateNote = async (noteId, data) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          Authorization: token ? `Token ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      await fetchNotes()
    } catch (error) {
      console.error('Ошибка обновления заметки:', error)
    }
  }

  const updateFolder = async (folderId, data) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/folders/${folderId}`, {
        method: 'PUT',
        headers: {
          Authorization: token ? `Token ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      await fetchFolders()
    } catch (error) {
      console.error('Ошибка обновления папки:', error)
    }
  }

  useEffect(() => {
    Promise.all([fetchNotes(), fetchFolders()]).finally(() => setLoading(false))
  }, [])

  return (
    <ApiContext.Provider
      value={{
        notes,
        setNotes,
        folders,
        setFolders,
        loading,
        fetchNotes,
        fetchFolders,
        deleteNote,
        deleteFolder,
        updateNote,
        updateFolder,
      }}
    >
      {children}
    </ApiContext.Provider>
  )
}

export const useApi = () => useContext(ApiContext)
