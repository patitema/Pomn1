import {
  DraggableNote,
  DroppableFolder,
  RootDropZone,
} from '@widgets/folder-tree'
import { CreateNoteToggle } from '@features/create-note-toggle'
import { isRegularNote, noteMatchesSearch } from '@entities/note'

const FolderBrowser = ({
  folders,
  notes,
  openFolders,
  openNotes,
  search,
  onSearchChange,
  onToggleFolder,
  onToggleNote,
  onOpenEdit,
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

      <CreateNoteToggle />
    </div>
  )
}

export default FolderBrowser
