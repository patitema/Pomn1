import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { formatDateTime } from '@shared/lib'
import { CreateNoteForm } from '@features/create-note'
import { TASK_PRIORITIES, TASK_STATUSES, TaskModal } from '@features/manage-task'
import { EditNoteModal } from '@features/update-note'
import { EditFolderModal } from '@features/update-folder'
import { FolderBrowser } from '@widgets/folder-browser'
import { Footer } from '@widgets/footer'
import {
  FOLDER_MOUSE_SENSOR_OPTIONS,
  FOLDER_TOUCH_SENSOR_OPTIONS,
} from './model/dndSensors'
import { useFoldersPageModel } from './model/useFoldersPageModel'
import './FoldersPage.css'

const FoldersPage = () => {
  document.title = 'POMNI - FOLDER'
  const {
    editItem,
    editType,
    folderFilters,
    folders,
    handleDeleteFolder,
    handleDeleteNote,
    handleDeleteTask,
    handleDragEnd,
    handleFolderFilterChange,
    handleItemUpdated,
    handleOpenTaskWeek,
    handleToggleTaskDone,
    isCreateFolderModalOpen,
    isCreateNoteModalOpen,
    isFolderEditOpen,
    isLoading,
    isNoteEditOpen,
    openCreateNote,
    openFolders,
    openNotes,
    regularNotes,
    resetFolderFilters,
    taskModal,
    tasks,
    toggleFolder,
    toggleNote,
    user,
    closeCreateFolder,
    closeCreateNote,
    closeFolderEdit,
    closeNoteEdit,
    openEdit,
    switchToFolderCreate,
    switchToNoteCreate,
  } = useFoldersPageModel()

  const sensors = useSensors(
    useSensor(MouseSensor, FOLDER_MOUSE_SENSOR_OPTIONS),
    useSensor(TouchSensor, FOLDER_TOUCH_SENSOR_OPTIONS)
  )

  if (isLoading) return <p>Загрузка...</p>

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="page-container">
        <header>
          <div className="Hcontainer">
            <div className="hTextContainer">
              <h1>POMNI</h1>
              <h2>{user ? user.username : 'None'} BASE</h2>
            </div>
          </div>
        </header>

        <main>
          <FolderBrowser
            folders={folders}
            notes={regularNotes}
            tasks={tasks}
            openFolders={openFolders}
            openNotes={openNotes}
            filters={folderFilters}
            onFilterChange={handleFolderFilterChange}
            onResetFilters={resetFolderFilters}
            onToggleFolder={toggleFolder}
            onToggleNote={toggleNote}
            onOpenEdit={openEdit}
            onAddNote={openCreateNote}
            onDeleteFolder={handleDeleteFolder}
            onDeleteNote={handleDeleteNote}
            onDeleteTask={handleDeleteTask}
            onEditTask={taskModal.openTaskModal}
            onOpenTaskWeek={handleOpenTaskWeek}
            onToggleTaskDone={handleToggleTaskDone}
            formatDate={formatDateTime}
          />
        </main>

        <EditNoteModal
          note={editType === 'note' ? editItem : null}
          isOpen={isNoteEditOpen}
          onClose={closeNoteEdit}
          onUpdated={handleItemUpdated}
        />

        <EditFolderModal
          folder={editType === 'folder' ? editItem : null}
          isOpen={isFolderEditOpen}
          onClose={closeFolderEdit}
          onUpdated={handleItemUpdated}
        />

        <CreateNoteForm
          isOpen={isCreateNoteModalOpen}
          onClose={closeCreateNote}
          onSwitchToFolder={switchToFolderCreate}
        />

        <CreateNoteForm
          isOpen={isCreateFolderModalOpen}
          onClose={closeCreateFolder}
          isFolder={true}
          onSwitchToNote={switchToNoteCreate}
        />

        {taskModal.isTaskModalOpen && (
          <TaskModal
            taskForm={taskModal.taskForm}
            isEditing={true}
            error={taskModal.taskFormError}
            minDate={taskModal.minDate}
            minTime={taskModal.minTime}
            minDeadlineTime={taskModal.minDeadlineTime}
            noteOptions={regularNotes}
            priorities={TASK_PRIORITIES}
            statuses={TASK_STATUSES}
            onAddChecklistItem={taskModal.handleAddChecklistItem}
            onChange={taskModal.handleTaskFormChange}
            onChecklistItemChange={taskModal.handleChecklistItemChange}
            onClose={taskModal.closeTaskModal}
            onDelete={taskModal.handleDeleteTask}
            onRemoveChecklistItem={taskModal.handleRemoveChecklistItem}
            onSubmit={taskModal.handleSaveTask}
          />
        )}

        <Footer />
      </div>
    </DndContext>
  )
}

export default FoldersPage
