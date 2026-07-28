import { Footer } from '@widgets/footer'
import { NoteGraph } from '@widgets/note-graph'
import { NotesReader } from '@widgets/notes-reader'
import { NotesToolbar } from '@widgets/notes-toolbar'
import { TaskModal } from '@features/manage-task'
import { CreateNoteForm } from '@features/create-note'
import { EditNoteModal } from '@features/update-note'
import { EditFolderModal } from '@features/update-folder'
import { useNotesPageModel } from './model/useNotesPageModel'
import './NotesPage.css'

const NotesPage = () => {
  document.title = 'POMNI - NOTES'
  const {
    closeCreateFolder,
    closeCreateNote,
    closeEditFolder,
    closeEditNote,
    connectionMode,
    connectionSourceId,
    folderOptions,
    footerBoundaryRef,
    handleAddNote,
    handleClosePanel,
    handleColorChange,
    handleConnectionEdgeClick,
    handleConnectionNodeClick,
    handleDelete,
    handleDeleteTask,
    handleEditNote,
    handleGraphNoteEdit,
    handleNoteSelect,
    handleNoteUpdated,
    handleOpenTaskWeek,
    handleSwitchToFolderCreate,
    handleSwitchToNoteCreate,
    handleToggleConnectionMode,
    handleToggleTaskDone,
    isConnectionModeActive,
    isCreateFolderModalOpen,
    isCreateNoteModalOpen,
    isEditFolderModalOpen,
    isEditNoteModalOpen,
    isReaderOpen,
    links,
    noteOptions,
    notes,
    notesMainClassName,
    selectedNote,
    selectedNoteId,
    taskModal,
    tasks,
    taskPriorities,
    taskStatuses,
    user,
  } = useNotesPageModel()

  return (
    <div className="page-container">
      <header>
        <div className="Hcontainer">
          <div className="hTextContainer">
            <h1>POMNI</h1>
            <h2>{user ? user.username : 'BASE NAME'} BASE</h2>
          </div>
        </div>
      </header>
      <main className={notesMainClassName}>
        <div className="NotesContainer">
          <NoteGraph
            selectedNoteId={selectedNoteId}
            isReaderOpen={isReaderOpen}
            connectionMode={connectionMode}
            connectionSourceId={connectionSourceId}
            onNoteSelect={handleNoteSelect}
            onNoteEdit={handleGraphNoteEdit}
            onConnectionNodeClick={handleConnectionNodeClick}
            onConnectionEdgeClick={handleConnectionEdgeClick}
          />
        </div>

        <NotesReader
          selectedNote={selectedNote}
          notes={notes}
          tasks={tasks}
          onClose={handleClosePanel}
          onDeleteTask={handleDeleteTask}
          onEditTask={taskModal.openTaskModal}
          onOpenTaskWeek={handleOpenTaskWeek}
          onSelectNote={handleNoteSelect}
          onToggleTaskDone={handleToggleTaskDone}
        />

        <NotesToolbar
          selectedNote={selectedNote}
          onAddNote={handleAddNote}
          onEditNote={handleEditNote}
          onColorChange={handleColorChange}
          onDelete={handleDelete}
          onToggleConnectionMode={handleToggleConnectionMode}
          isConnectionModeActive={isConnectionModeActive}
        />
      </main>
      <div className="notes-page__footer-boundary" ref={footerBoundaryRef}>
        <Footer />
      </div>

      <CreateNoteForm
        isOpen={isCreateNoteModalOpen}
        onClose={closeCreateNote}
        onSwitchToFolder={handleSwitchToFolderCreate}
      />

      <CreateNoteForm
        isOpen={isCreateFolderModalOpen}
        onClose={closeCreateFolder}
        isFolder={true}
        onSwitchToNote={handleSwitchToNoteCreate}
      />

      <EditNoteModal
        note={selectedNote}
        folderOptions={folderOptions}
        isOpen={isEditNoteModalOpen}
        links={links}
        onClose={closeEditNote}
        onUpdated={handleNoteUpdated}
      />

      <EditFolderModal
        folder={selectedNote?.is_folder ? selectedNote : null}
        isOpen={isEditFolderModalOpen}
        onClose={closeEditFolder}
        onUpdated={handleNoteUpdated}
      />

      {taskModal.isTaskModalOpen && (
        <TaskModal
          taskForm={taskModal.taskForm}
          isEditing={true}
          error={taskModal.taskFormError}
          minDate={taskModal.minDate}
          minTime={taskModal.minTime}
          minDeadlineTime={taskModal.minDeadlineTime}
          noteOptions={noteOptions}
          priorities={taskPriorities}
          statuses={taskStatuses}
          onAddChecklistItem={taskModal.handleAddChecklistItem}
          onChange={taskModal.handleTaskFormChange}
          onChecklistItemChange={taskModal.handleChecklistItemChange}
          onClose={taskModal.closeTaskModal}
          onDelete={taskModal.handleDeleteTask}
          onRemoveChecklistItem={taskModal.handleRemoveChecklistItem}
          onSubmit={taskModal.handleSaveTask}
        />
      )}
    </div>
  )
}

export default NotesPage
