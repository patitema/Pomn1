import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { DraggableNote } from './DraggableNote'

export const DroppableFolder = React.memo(
  ({
    folder,
    level,
    notes,
    openFolders,
    openNotes,
    toggleFolder,
    toggleNote,
    openEdit,
    deleteFolder,
    deleteNote,
    formatDate,
    search,
  }) => {
    const droppableId = Number(folder.id)

    const { setNodeRef, isOver } = useDroppable({
      id: droppableId,
    })

    const folderNotes = notes.filter(
      (note) =>
        note.folder === folder.id &&
        note.title.toLowerCase().includes(search.toLowerCase())
    )

    const isOpen = openFolders.has(folder.id)
    const marginLeft = level * 20

    return (
      <li
        ref={setNodeRef}
        key={folder.id}
        className="stroke-folder"
        style={{
          backgroundColor: isOver ? 'rgba(63, 63, 63, 1)' : 'transparent',
          transition: 'background-color 0.2s ease',
        }}
      >
        <div
          onClick={() => toggleFolder(folder.id)}
          className="folder-header"
          style={{
            cursor: 'pointer',
            fontWeight: 'bold',
            marginLeft: `${marginLeft}px`,
          }}
        >
          <div className="folder-main">
            <p>📁 {folder.title || `Папка ${folder.id}`}</p>
            <div className="Tool-btns">
              <button
                className="edit-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  openEdit(folder, 'folder')
                }}
              >
                <svg className="edit-icon" viewBox="0 0 30 30">
                  <use href="/images/icons.svg#ToolEdit"></use>
                </svg>
              </button>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteFolder(folder.id)
                }}
              >
                <svg className="delete-icon" viewBox="0 0 30 30">
                  <use href="/images/icons.svg#ToolDelete"></use>
                </svg>
              </button>
            </div>
          </div>
          <div className="folder-info">
            {folder.created_at && formatDate(folder.created_at)}
          </div>
        </div>

        <div className={`folder-content ${isOpen ? 'open' : 'closed'}`}>
          {isOpen && (
            <ul style={{ marginLeft: '0px', marginTop: '5px' }}>
              {folder.children &&
                folder.children.map((childFolder) => (
                  <DroppableFolder
                    key={childFolder.id}
                    folder={childFolder}
                    level={level + 1}
                    notes={notes}
                    openFolders={openFolders}
                    openNotes={openNotes}
                    toggleFolder={toggleFolder}
                    toggleNote={toggleNote}
                    openEdit={openEdit}
                    deleteFolder={deleteFolder}
                    deleteNote={deleteNote}
                    formatDate={formatDate}
                    search={search}
                  />
                ))}

              {folderNotes.length > 0
                ? folderNotes.map((note) => {
                    const isNoteOpen = openNotes.has(note.id)
                    return (
                      <DraggableNote
                        key={note.id}
                        note={note}
                        isNoteOpen={isNoteOpen}
                        toggleNote={toggleNote}
                        openEdit={openEdit}
                        deleteNote={deleteNote}
                        formatDate={formatDate}
                        marginLeft={marginLeft + 20}
                      />
                    )
                  })
                : folder.children &&
                  folder.children.length === 0 && (
                    <li
                      style={{
                        fontStyle: 'italic',
                        marginLeft: `${marginLeft + 20}px`,
                      }}
                    >
                      Нет заметок
                    </li>
                  )}
            </ul>
          )}
        </div>
      </li>
    )
  }
)

export default DroppableFolder
