import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@mui/icons-material/Delete'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ReplayIcon from '@mui/icons-material/Replay'
import { getTaskPreviewLabel } from '@entities/task'
import './LinkedTaskActions.css'

export const LinkedTaskActions = ({
  task,
  onDelete,
  onEdit,
  onOpenWeek,
  onToggleDone,
}) => {
  const isDone = task.status === 'done'

  const handleActionClick = (event, action) => {
    event.stopPropagation()
    action(task)
  }

  return (
    <div
      className={`linked-task-actions ${isDone ? 'linked-task-actions--done' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onEdit(task)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onEdit(task)
        }
      }}
    >
      <span className="linked-task-actions__label">{getTaskPreviewLabel(task)}</span>
      <span className="linked-task-actions__buttons">
        <button
          type="button"
          onClick={(event) => handleActionClick(event, onToggleDone)}
          aria-label={isDone ? 'Вернуть задачу' : 'Выполнить задачу'}
          title={isDone ? 'Вернуть' : 'Выполнить'}
        >
          {isDone ? <ReplayIcon fontSize="small" /> : <CheckIcon fontSize="small" />}
        </button>
        <button
          type="button"
          onClick={(event) => handleActionClick(event, onDelete)}
          aria-label="Удалить задачу"
          title="Удалить"
        >
          <DeleteIcon fontSize="small" />
        </button>
        <button
          type="button"
          onClick={(event) => handleActionClick(event, onOpenWeek)}
          aria-label="Перейти к задаче"
          title="Перейти"
        >
          <OpenInNewIcon fontSize="small" />
        </button>
      </span>
    </div>
  )
}
