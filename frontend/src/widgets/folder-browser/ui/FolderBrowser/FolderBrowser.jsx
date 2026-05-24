import {
  DraggableNote,
  DroppableFolder,
  RootDropZone,
} from '@widgets/folder-tree'
import { isRegularNote, noteMatchesSearch } from '@entities/note'

const FolderBrowser = ({
  folders,
  notes,
  tasks = [],
  openFolders,
  openNotes,
  search,
  onSearchChange,
  onToggleFolder,
  onToggleNote,
  onOpenEdit,
  onAddNote,
  onDeleteFolder,
  onDeleteNote,
  formatDate,
}) => {
  const regularNotes = notes.filter(isRegularNote)
  const unfolderNotes = regularNotes.filter(
    (note) => note.folder === null && noteMatchesSearch(note, search)
  )

  return (
    <div className="FolderContainer">
      <div className="navFolderView">
        <input
          className="SearchInput"
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <ul className="FileList">
        {folders.map((folder) => (
          <DroppableFolder
            key={folder.id}
            folder={folder}
            level={0}
            notes={regularNotes}
            tasks={tasks}
            openFolders={openFolders}
            openNotes={openNotes}
            toggleFolder={onToggleFolder}
            toggleNote={onToggleNote}
            openEdit={onOpenEdit}
            deleteFolder={onDeleteFolder}
            deleteNote={onDeleteNote}
            formatDate={formatDate}
            search={search}
          />
        ))}

        <RootDropZone>
          {unfolderNotes.map((note) => {
            const isNoteOpen = openNotes.has(note.id)
            return (
              <DraggableNote
                key={`unfolder-note-${note.id}`}
                note={note}
                tasks={tasks}
                isNoteOpen={isNoteOpen}
                toggleNote={onToggleNote}
                openEdit={onOpenEdit}
                deleteNote={onDeleteNote}
                formatDate={formatDate}
                className="unfolder-stroke"
              />
            )
          })}
        </RootDropZone>
      </ul>

      <button
        className="FolderCreateButton"
        type="button"
        onClick={onAddNote}
        aria-label="Создать заметку"
      />
    </div>
  )
}

export default FolderBrowser
