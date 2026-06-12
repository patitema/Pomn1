import { MarkdownViewer } from '@shared/ui';
import {
  getNearestTaskPreviews,
} from '@entities/task';
import { LinkedTaskActions } from '@features/linked-task-actions';

const NotesReader = ({
  selectedNote,
  notes = [],
  tasks = [],
  onClose,
  onDeleteTask,
  onEditTask,
  onOpenTaskWeek,
  onToggleTaskDone,
}) => {
  const isActive = Boolean(selectedNote);
  const isFolder = Boolean(selectedNote?.is_folder);
  const activeClass = isActive ? 'active' : '';
  const linkedTasks = isActive && !isFolder ? getNearestTaskPreviews(tasks, selectedNote.id) : [];
  const folderNotes = isFolder
    ? notes.filter((note) => note.folder === selectedNote.id && !note.is_folder)
    : [];

  return (
    <div className={`ReadFile ${activeClass}`}>
      <div className={`FileName ${activeClass}`}>
        <h3>{selectedNote ? selectedNote.title : 'Имя заметки'}</h3>
      </div>
      <div className="Info">
        <div className="openInfo">
          <button className={`openInfoBtn ${activeClass}`}>
            <svg className={`openInfoSvg ${activeClass}`} onClick={onClose}>
              <use href="/images/icons.svg#Arrow"></use>
            </svg>
          </button>
        </div>
        <div className={`FileInfo ${activeClass}`}>
          <div className="notes-page__reader-content">
            {isFolder ? (
              <div className="notes-page__folder-reader">
                <h4 className="notes-page__folder-reader-title">Заметки в папке</h4>
                {folderNotes.length > 0 ? (
                  <ul className="notes-page__folder-reader-list">
                    {folderNotes.map((note) => (
                      <li key={note.id} className="notes-page__folder-reader-item">
                        {note.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="notes-page__folder-reader-empty">В папке нет заметок.</p>
                )}
              </div>
            ) : (
              <MarkdownViewer
                content={selectedNote?.text || ''}
                className="notes-page__viewer"
              />
            )}

            {linkedTasks.length > 0 && (
              <div className="linked-tasks linked-tasks--reader" aria-label="Связанные задачи">
                {linkedTasks.map((task) => (
                  <LinkedTaskActions
                    key={task.id}
                    task={task}
                    onDelete={onDeleteTask}
                    onEdit={onEditTask}
                    onOpenWeek={onOpenTaskWeek}
                    onToggleDone={onToggleTaskDone}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesReader;
