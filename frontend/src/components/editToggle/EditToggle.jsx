import React, { useState, useEffect } from 'react'
import { useApi } from '../../context/ApiContext'
import './EditToggle.css'

export default function EditToggle({ isOpen, onClose, item, type }) {
  const { updateNote, updateFolder, folders } = useApi()
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('no-folder')
  const [parent, setParent] = useState(null)

  useEffect(() => {
    if (item) {
      setTitle(item.title || '')
      setText(item.text || '')
      setSelectedFolder(item.folder || 'no-folder')
      setParent(item.parent)
    }
  }, [item])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isFolder = type === 'folder'
    const data = isFolder
      ? { title: title.trim(), parent: parent }
      : {
          title: title.trim(),
          text: text.trim(),
          folder: selectedFolder === 'no-folder' ? null : selectedFolder,
        }
    try {
      if (isFolder) {
        await updateFolder(item.id, data)
      } else {
        await updateNote(item.id, data)
      }
      onClose()
    } catch (err) {
      console.error('Error updating item:', err)
      alert('Ошибка при обновлении: ' + (err.message || err))
    }
  }

  const handleCancel = () => {
    onClose()
  }

  if (!isOpen || !item) return null

  return (
    <div className="edit-overlay">
      <div className="edit-form-container">
        <h3>
          {type === 'folder' ? 'Редактировать папку' : 'Редактировать заметку'}
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          {type === 'note' && (
            <textarea
              placeholder="Текст заметки"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          )}
          {type === 'note' && (
            <select
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
          <div className="buttons">
            <button type="submit">Сохранить</button>
            <button type="button" onClick={handleCancel}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
