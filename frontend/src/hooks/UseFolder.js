import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../context/ApiContext'
import axios from 'axios'

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
          'http://127.0.0.1:8000/api/folders/',
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
