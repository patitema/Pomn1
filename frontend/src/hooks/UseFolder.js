import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../context/ApiContext'

export function useAddFolder() {
  const [folders, setFolders] = useState([])
  const { fetchFolders } = useApi()

  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  const addFolder = useCallback(async (folderData) => {
    const token = localStorage.getItem('token')
    const response = await fetch('http://127.0.0.1:8000/api/folders/', {
      method: 'POST',
      headers: {
        Authorization: token ? `Token ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(folderData),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Ошибка создания папки: ${text}`)
    }

    const created = await response.json()
    setFolders((prev) => [created, ...prev])
    return created
  }, [])

  return { folders, addFolder, fetchFolders }
}
