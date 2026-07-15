import { useEffect, useState } from 'react';
import { LazyMarkdownViewer } from '@shared/ui/LazyMarkdownViewer';
import { normalizeReaderMarkdown } from '@shared/lib';
import {
  getTasksLinkedToNote,
} from '@entities/task';
import { LinkedTaskActions } from '@features/linked-task-actions';

const READER_TABS = {
  CONTENT: 'content',
  TASKS: 'tasks',
};

const NotesReader = ({
  selectedNote,
  notes = [],
  tasks = [],
  onClose,
  onDeleteTask,
  onEditTask,
  onOpenTaskWeek,
  onSelectNote,
  onToggleTaskDone,
}) => {
  const [activeTab, setActiveTab] = useState(READER_TABS.CONTENT);
  const isActive = Boolean(selectedNote);
  const isFolder = Boolean(selectedNote?.is_folder);
  const isRegularNote = isActive && !isFolder;
  const activeClass = isActive ? 'active' : '';
  const linkedTasks = isRegularNote ? getTasksLinkedToNote(tasks, selectedNote.id) : [];
  const folderNotes = isFolder
    ? notes.filter((note) => note.folder === selectedNote.id && !note.is_folder)
    : [];
  const isContentTabActive = activeTab === READER_TABS.CONTENT;
  const isTasksTabActive = activeTab === READER_TABS.TASKS;
  const readerMarkdown = normalizeReaderMarkdown(selectedNote?.text || '');

  useEffect(() => {
    setActiveTab(READER_TABS.CONTENT);
  }, [selectedNote?.id]);

  return (
    <div className={`ReadFile ${activeClass}`}>
      <div className={`FileName ${activeClass}`}>
        <h3>{selectedNote ? selectedNote.title : 'Имя заметки'}</h3>
      </div>
      <div className="Info">
        <div className="openInfo">
          <button
            className={`openInfoBtn ${activeClass}`}
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
          >
            <svg className={`openInfoSvg ${activeClass}`} aria-hidden="true">
              <use href="/images/icons.svg#Arrow"></use>
            </svg>
            <span className="openInfoCloseIcon" aria-hidden="true">X</span>
          </button>
        </div>
        <div className={`FileInfo ${activeClass}`}>
          <div className="notes-page__reader-content">
            {isRegularNote && (
              <div className="notes-page__reader-tabs" role="tablist" aria-label="Разделы заметки">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isContentTabActive}
                  className={`notes-page__reader-tab ${isContentTabActive ? 'notes-page__reader-tab--active' : ''}`}
                  onClick={() => setActiveTab(READER_TABS.CONTENT)}
                >
                  Содержание
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isTasksTabActive}
                  className={`notes-page__reader-tab ${isTasksTabActive ? 'notes-page__reader-tab--active' : ''}`}
                  onClick={() => setActiveTab(READER_TABS.TASKS)}
                >
                  {`Задачи · ${linkedTasks.length}`}
                </button>
              </div>
            )}
            <div className="notes-page__reader-main">
              {isFolder ? (
                <div className="notes-page__folder-reader">
                  <h4 className="notes-page__folder-reader-title">Заметки в папке</h4>
                  {folderNotes.length > 0 ? (
                    <ul className="notes-page__folder-reader-list">
                      {folderNotes.map((note) => (
                        <li key={note.id} className="notes-page__folder-reader-item">
                          <button
                            type="button"
                            className="notes-page__folder-reader-button"
                            onClick={() => onSelectNote?.(note)}
                          >
                            {note.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="notes-page__folder-reader-empty">В папке нет заметок.</p>
                  )}
                </div>
              ) : isTasksTabActive ? (
                <div className="linked-tasks notes-page__reader-tasks" aria-label="Связанные задачи">
                  {linkedTasks.length > 0 ? (
                    linkedTasks.map((task) => (
                      <LinkedTaskActions
                        key={task.id}
                        task={task}
                        onDelete={onDeleteTask}
                        onEdit={onEditTask}
                        onOpenWeek={onOpenTaskWeek}
                        onToggleDone={onToggleTaskDone}
                      />
                    ))
                  ) : (
                    <p className="notes-page__reader-empty">Нет прикреплённых задач.</p>
                  )}
                </div>
              ) : (
                <LazyMarkdownViewer
                  content={readerMarkdown}
                  className="notes-page__viewer"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesReader;
