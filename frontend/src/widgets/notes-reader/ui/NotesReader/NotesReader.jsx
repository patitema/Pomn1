import { MarkdownViewer } from '@shared/ui';
import {
  getNearestTaskPreviews,
  getTaskPreviewLabel,
  getTaskWeekQuery,
} from '@entities/task';
import { useNavigate } from 'react-router-dom';

const NotesReader = ({ selectedNote, tasks = [], onClose }) => {
  const navigate = useNavigate();
  const isActive = Boolean(selectedNote && !selectedNote.is_folder);
  const activeClass = isActive ? 'active' : '';
  const linkedTasks = isActive ? getNearestTaskPreviews(tasks, selectedNote.id) : [];

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
            <MarkdownViewer
              content={selectedNote?.text || ''}
              className="notes-page__viewer"
            />

            {linkedTasks.length > 0 && (
              <div className="linked-tasks linked-tasks--reader" aria-label="Связанные задачи">
                {linkedTasks.map((task) => (
                  <button
                    className="linked-tasks__item"
                    key={task.id}
                    type="button"
                    onClick={() => navigate(getTaskWeekQuery(task))}
                  >
                    {getTaskPreviewLabel(task)}
                  </button>
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
