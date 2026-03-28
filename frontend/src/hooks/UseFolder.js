import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../context/ApiContext'
import axios from 'axios'

// Базовый URL для API (может быть относительным для nginx)
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api'
// Убираем trailing slash для консистентности
const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL

export function useAddFolder() {
  const [folders, setFolders] = useState([])
  const { fetchFolders } = useApi()

  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  const addFolder = useCallback(
    async (folderData) => {
      const token = localStorage.getItem('token')

      try {
        const response = await axios.post(
          `${baseUrl}/folders/`,
          folderData,
          {
            headers: {
              Authorization: token ? `Token ${token}` : '',
            },
          }
        )

        const created = response.data

        setFolders((prev) => [created, ...prev])
        await fetchFolders()
        return created
      } catch (error) {
        const errorText = error.response
          ? JSON.stringify(error.response.data)
          : error.message

        throw new Error(`Ошибка создания папки: ${errorText}`)
      }
    },
    [fetchFolders]
  )

  return { folders, addFolder, fetchFolders }
}
