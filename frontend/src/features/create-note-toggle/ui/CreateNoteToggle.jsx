import React, { useState } from 'react'
import { useCreateNoteMutation, useCreateFolderMutation, useGetFoldersQuery } from '@shared/api'
import './CreateNoteToggle.css'

export default function CreateNoteToggle({ folderId }) {
  const [isActive, setIsActive] = useState(false)
  const [isFolderMode, setIsFolderMode] = useState(false)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [selectedFolder, setSelectedFolder] = useState(folderId || 'no-folder')
  const [createNote] = useCreateNoteMutation()
  const [createFolder] = useCreateFolderMutation()
  const { data: folders = [] } = useGetFoldersQuery()

  const toggleFolderMode = () => {
    setIsFolderMode(true)
    setIsActive(true)
  }

  const toggleNoteMode = () => {
    setIsFolderMode(false)
    setIsActive(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isFolder = isFolderMode
    const data = isFolder
      ? {
          title: title.trim(),
          parent: folderId ? Number(folderId) : null,
        }
      : {
          title: title.trim(),
          text: text.trim(),
          folder:
            selectedFolder === 'no-folder' ? null : Number(selectedFolder),
        }

    try {
      if (isFolder) {
        await createFolder(data).unwrap()
      } else {
        await createNote(data).unwrap()
      }

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
