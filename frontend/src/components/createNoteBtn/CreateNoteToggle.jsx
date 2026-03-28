import React, { useState } from 'react'
import { useNotes } from '../../context/NotesContext'
import { useAddFolder } from '../../hooks/UseFolder'
import { useApi } from '../../context/ApiContext'
import './CreateNoteToggle.css'
import axios from 'axios'

// Базовый URL для API (может быть относительным для nginx)
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api'
// Убираем trailing slash для консистентности
const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL

export default function CreateNoteToggle({ folderId }) {
  const [isActive, setIsActive] = useState(false)
  const [isFolderMode, setIsFolderMode] = useState(false)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [selectedFolder, setSelectedFolder] = useState(folderId || 'no-folder')
  const { addNote } = useNotes()
  const { addFolder } = useAddFolder()
  const { folders, fetchNotes, fetchFolders } = useApi()

  const toggleFolderMode = () => {
    setIsFolderMode(true)
    setIsActive(true)
  }

  const toggleNoteMode = () => {
    setIsFolderMode(false)
    setIsActive(true)
  }

  const validate = (data, isFolder) => {
    if (!data.title) throw new Error('Title is required')
    if (!isFolder && !data.text) throw new Error('Text is required for notes')
    return true
  }

  const fallbackCreateNote = async (noteData) => {
    const url = `${baseUrl}/notes/`
    console.info('Fallback: отправка через axios', url, noteData)

    try {
      const response = await axios.post(url, noteData, {
        headers: {},
        withCredentials: true,
      })

      return response.data
    } catch (error) {
      const status = error.response ? error.response.status : 'N/A'
      const text = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message

      throw new Error(`Server responded ${status}: ${text}`)
    }
  }

  const fallbackCreateFolder = async (folderData) => {
    const url = `${baseUrl}/folders/`
    console.info('Fallback: отправка через axios', url, folderData)

    try {
      const response = await axios.post(url, folderData, {
        withCredentials: true,
      })

      return response.data
    } catch (error) {
      const status = error.response ? error.response.status : 'N/A'
      const text = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message

      throw new Error(`Server responded ${status}: ${text}`)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isFolder = isFolderMode
    const data = isFolder
      ? {
          title: title.trim(),
          parent_id: folderId ? Number(folderId) : null,
        }
      : {
          title: title.trim(),
          text: text.trim(),
          folder_id:
            selectedFolder === 'no-folder' ? null : Number(selectedFolder),
          created_at: new Date().toISOString(),
        }

    try {
      validate(data, isFolder)

      let result
      if (isFolder) {
        console.info('Creating folder...')
        if (typeof addFolder === 'function') {
          result = await addFolder(data)
        } else {
          console.warn('addFolder not found, using fallback fetch')

          result = await fallbackCreateFolder(data)
          await fetchFolders()
        }
      } else {
        if (typeof addNote === 'function') {
          console.info('Calling context addNote...')
          result = addNote(data)
          if (result && typeof result.then === 'function') {
            result = await result
          } else {
            console.warn(
              'addNote did not return a promise — treating as sync value:',
              result
            )
          }
        } else {
          console.warn('addNote not found in context, using fallback fetch')
          result = await fallbackCreateNote(data)
          await fetchNotes()
        }
      }

      console.log(`${isFolder ? 'Folder' : 'Note'} created result:`, result)
      setTitle('')
      setText('')
      setIsActive(false)
      setIsFolderMode(false)
    } catch (err) {
      console.error(
        `Ошибка при создании ${isFolder ? 'папки' : 'заметки'}:`,
        err
      )
      alert(
        `Ошибка при создании ${isFolder ? 'папки' : 'заметки'}: ` +
          (err.message || err)
      )
    }
  }

  return (
    <div>
      <div className={`CreateNoteContainer ${isActive ? 'active' : ''}`}>
        <form className="CreateNote" onSubmit={handleSubmit} noValidate>
          <div className="CreateNoteHeader">
            <h3>{isFolderMode ? 'Создайте папку' : 'Создайте заметку'}</h3>
          </div>
          <input
            id="HeadName"
            type="text"
            placeholder="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          {!isFolderMode && (
            <textarea
              id="NoteInfo"
              placeholder="Текст заметки"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          )}
          {!isFolderMode && (
            <select
              className="parent-folder"
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
            >
              <option value="no-folder">Без папки</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.title || `Папка ${folder.id}`}
                </option>
              ))}
            </select>
          )}

          <button className="MakeNote" type="submit">
            Создать
          </button>
          {isFolderMode ? (
            <button
              className="MakeFolder"
              type="button"
              onClick={toggleNoteMode}
            >
              Создать заметку
            </button>
          ) : (
            <button
              className="MakeFolder"
              type="button"
              onClick={toggleFolderMode}
            >
              Создать папку
            </button>
          )}
        </form>
      </div>

      <div className={`CreateNoteBtnContainer ${isActive ? 'active' : ''}`}>
        <button
          className={`CreateNoteBtn ${isActive ? 'active' : ''}`}
          onClick={() => setIsActive(!isActive)}
          type="button"
        >
          <p>+</p>
        </button>
      </div>
    </div>
  )
}
