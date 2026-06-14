import {
  DraggableNote,
  DroppableFolder,
  DEFAULT_FOLDER_VIEW_FILTERS,
  folderBranchMatchesFilters,
  hasActiveFolderViewFilters,
  noteMatchesFolderViewFilters,
  RootDropZone,
} from '@widgets/folder-tree'
import { isRegularNote } from '@entities/note'

const FolderBrowser = ({
  folders,
  notes,
  tasks = [],
  openFolders,
  openNotes,
  filters = DEFAULT_FOLDER_VIEW_FILTERS,
  onFilterChange,
  onResetFilters,
  onToggleFolder,
  onToggleNote,
  onOpenEdit,
  onAddNote,
  onDeleteFolder,
  onDeleteNote,
  onDeleteTask,
  onEditTask,
  onOpenTaskWeek,
  onToggleTaskDone,
  formatDate,
}) => {
  const regularNotes = notes.filter(isRegularNote)
  const hasActiveFilters = hasActiveFolderViewFilters(filters)
  const visibleFolders = folders.filter((folder) =>
    folderBranchMatchesFilters({ folder, filters, notes: regularNotes, tasks })
  )
  const unfolderNotes = regularNotes.filter(
    (note) => note.folder === null && noteMatchesFolderViewFilters(note, filters, tasks)
  )
  const hasVisibleResults = visibleFolders.length > 0 || unfolderNotes.length > 0

  return (
    <div className="FolderContainer">
      <div className="navFolderView">
        <input
          className="SearchInput"
          type="search"
          placeholder="Поиск"
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
        <div className="FolderFilters" aria-label="Фильтры файлового вида">
          <label className="FolderFilter">
            <span>Тип</span>
            <select
              className="FolderFilterSelect"
              value={filters.itemType}
              onChange={(event) => onFilterChange('itemType', event.target.value)}
            >
              <option value="all">Все</option>
              <option value="notes">Заметки</option>
              <option value="folders">Папки</option>
            </select>
          </label>
          <label className="FolderFilter">
            <span>Задачи</span>
            <select
              className="FolderFilterSelect"
              value={filters.taskState}
              onChange={(event) => onFilterChange('taskState', event.target.value)}
            >
              <option value="all">Все</option>
              <option value="hasTasks">Есть задачи</option>
              <option value="withoutTasks">Без задач</option>
            </select>
          </label>
          <button
            className="FolderFilterReset"
            type="button"
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
          >
            Сбросить
          </button>
        </div>
      </div>

      <ul className="FileList">
        {visibleFolders.map((folder) => (
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
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            onOpenTaskWeek={onOpenTaskWeek}
            onToggleTaskDone={onToggleTaskDone}
            formatDate={formatDate}
            filters={filters}
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
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
                onOpenTaskWeek={onOpenTaskWeek}
                onToggleTaskDone={onToggleTaskDone}
                formatDate={formatDate}
                className="unfolder-stroke"
              />
            )
          })}
        </RootDropZone>

        {!hasVisibleResults && (
          <li className="FolderSearchEmpty">
            {hasActiveFilters ? 'Ничего не найдено' : 'Здесь ещё ничего не было'}
          </li>
        )}
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
