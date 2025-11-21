import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  timeout: 5000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    config.headers['Content-Type'] = 'application/json'
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

const ApiContext = createContext()

export const ApiProvider = ({ children }) => {
  const [notes, setNotes] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotes = useCallback(async () => {
    try {
      const res = await api.get('notes/')
      setNotes(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error('Ошибка загрузки заметок:', error)
      setNotes([])
    }
  }, [])

  const fetchFolders = useCallback(async () => {
    try {
      const res = await api.get('folders/')
      setFolders(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error('Ошибка загрузки папок:', error)
      setFolders([])
    }
  }, [])

  const deleteNote = async (noteId) => {
    try {
      await api.delete(`notes/${noteId}`)
      await fetchNotes()
    } catch (error) {
      console.error('Ошибка удаления заметки:', error)
    }
  }

  const deleteFolder = async (folderId) => {
    try {
      await api.delete(`folders/${folderId}`)
      await fetchFolders()
    } catch (error) {
      console.error('Ошибка удаления папки:', error)
    }
  }

  const updateNote = async (noteId, data) => {
    try {
      await api.put(`notes/${noteId}`, data)
      await fetchNotes()
    } catch (error) {
      console.error('Ошибка обновления заметки:', error)
    }
  }

  const updateFolder = async (folderId, data) => {
    try {
      await api.put(`folders/${folderId}`, data)
      await fetchFolders()
    } catch (error) {
      console.error('Ошибка обновления папки:', error)
    }
  }

  useEffect(() => {
    Promise.all([fetchNotes(), fetchFolders()]).finally(() => setLoading(false))
  }, [fetchNotes, fetchFolders])

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
