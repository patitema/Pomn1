import React, { useState, useEffect } from 'react'
import { useUpdateNoteMutation, useUpdateFolderMutation, useGetFoldersQuery } from '@shared/api'
import './EditToggle.css'

export default function EditToggle({ isOpen, onClose, item, type }) {
  const [updateNote] = useUpdateNoteMutation()
  const [updateFolder] = useUpdateFolderMutation()
  const { data: folders = [] } = useGetFoldersQuery()
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
      ? { title: title.trim(), parent }
      : {
          title: title.trim(),
          text: text.trim(),
          folder_id: selectedFolder === 'no-folder' ? null : selectedFolder,
        }

    try {
      if (isFolder) {
        await updateFolder({ id: item.id, body: data }).unwrap()
      } else {
        await updateNote({ id: item.id, body: data }).unwrap()
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
          <label className="edit-form-field" htmlFor="edit-item-title">
            <span>{type === 'folder' ? 'Название папки' : 'Название'}</span>
            <input
              id="edit-item-title"
              type="text"
              placeholder={type === 'folder' ? 'Название папки' : 'Заголовок'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          {type === 'note' && (
            <label className="edit-form-field" htmlFor="edit-item-text">
              <span>Содержимое</span>
              <textarea
                id="edit-item-text"
                placeholder="Текст заметки"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </label>
          )}

          {type === 'note' && (
            <label className="edit-form-field" htmlFor="edit-item-folder">
              <span>Папка</span>
              <select
                id="edit-item-folder"
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
            </label>
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
