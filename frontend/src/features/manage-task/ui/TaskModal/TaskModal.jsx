import CloseIcon from '@mui/icons-material/Close'
import './TaskModal.css'

export const TaskModal = ({
  taskForm,
  isEditing,
  error,
  minDate,
  minDeadlineTime,
  minTime,
  noteOptions,
  priorities,
  statuses,
  onAddChecklistItem,
  onChange,
  onChecklistItemChange,
  onClose,
  onDelete,
  onRemoveChecklistItem,
  onSubmit,
}) => (
  <div className="tasks-modal-overlay" role="presentation">
    <section className="tasks-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
      <button className="tasks-modal__close" type="button" onClick={onClose} aria-label="Закрыть">
        <CloseIcon fontSize="small" />
      </button>

      <h2 id="task-modal-title">{isEditing ? 'Редактировать задачу' : 'Создать задачу'}</h2>

      <form className="tasks-modal__form" onSubmit={onSubmit}>
        <label className="tasks-modal-field">
          <span>Название</span>
          <input
            type="text"
            placeholder="Введите название задачи"
            value={taskForm.title}
            onChange={(event) => onChange('title', event.target.value)}
          />
        </label>

        <label className="tasks-modal-field">
          <span>Описание</span>
          <textarea
            placeholder="Введите описание задачи"
            value={taskForm.description}
            onChange={(event) => onChange('description', event.target.value)}
          />
        </label>

        <section className="tasks-modal-checklist" aria-label="Чек-лист задачи">
          <div className="tasks-modal-checklist__header">
            <span>Чек-лист</span>
            <button type="button" onClick={onAddChecklistItem}>
              Добавить
            </button>
          </div>

          {taskForm.checklistItems.length > 0 ? (
            <div className="tasks-modal-checklist__items">
              {taskForm.checklistItems.map((item) => (
                <div className="tasks-modal-checklist__item" key={item.clientId}>
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    onChange={(event) =>
                      onChecklistItemChange(item.clientId, 'isCompleted', event.target.checked)
                    }
                    aria-label="Отметить пункт чек-листа"
                  />
                  <input
                    type="text"
                    value={item.title}
                    placeholder="Пункт чек-листа"
                    onChange={(event) => onChecklistItemChange(item.clientId, 'title', event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveChecklistItem(item.clientId)}
                    aria-label="Удалить пункт чек-листа"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="tasks-modal-checklist__empty">Пунктов пока нет</p>
          )}
        </section>

        <div className="tasks-modal__row">
          <label className="tasks-modal-field">
            <span>Дата</span>
            <input
              type="date"
              min={minDate}
              value={taskForm.date}
              onChange={(event) => onChange('date', event.target.value)}
            />
          </label>

          <label className="tasks-modal-field">
            <span>Время</span>
            <input
              type="time"
              min={minTime}
              value={taskForm.time}
              onChange={(event) => onChange('time', event.target.value)}
            />
          </label>
        </div>

        <label className="tasks-modal-deadline-toggle">
          <input
            type="checkbox"
            checked={taskForm.hasDeadline}
            onChange={(event) => onChange('hasDeadline', event.target.checked)}
          />
          <span>С дедлайном</span>
        </label>

        <div className={`tasks-modal__row ${!taskForm.hasDeadline ? 'tasks-modal__row--disabled' : ''}`}>
          <label className="tasks-modal-field">
            <span>Дедлайн дата</span>
            <input
              type="date"
              min={minDate}
              value={taskForm.deadlineDate}
              disabled={!taskForm.hasDeadline}
              onChange={(event) => onChange('deadlineDate', event.target.value)}
            />
          </label>

          <label className="tasks-modal-field">
            <span>Дедлайн время</span>
            <input
              type="time"
              min={minDeadlineTime}
              value={taskForm.deadlineTime}
              disabled={!taskForm.hasDeadline}
              onChange={(event) => onChange('deadlineTime', event.target.value)}
            />
          </label>
        </div>

        <fieldset className="tasks-modal-field tasks-modal-priority">
          <legend>Приоритет</legend>
          {Object.entries(priorities).map(([priorityKey, priority]) => (
            <button
              className={taskForm.priority === priorityKey ? 'active' : ''}
              key={priorityKey}
              type="button"
              onClick={() => onChange('priority', priorityKey)}
            >
              {priority.label}
            </button>
          ))}
        </fieldset>

        <label className="tasks-modal-field tasks-modal-field--select">
          <span>Статус</span>
          <select value={taskForm.status} onChange={(event) => onChange('status', event.target.value)}>
            {Object.entries(statuses).map(([statusKey, status]) => (
              <option key={statusKey} value={statusKey}>
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <label className="tasks-modal-field tasks-modal-field--select">
          <span>Заметка</span>
          <select value={taskForm.note} onChange={(event) => onChange('note', event.target.value)}>
            <option value="">Выберите заметку (необязательно)</option>
            {noteOptions.map((note) => (
              <option key={note.id} value={note.id}>
                {note.title}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="tasks-modal__error">{error}</p>}

        <div className="tasks-modal__actions">
          {isEditing && (
            <button className="tasks-modal__delete" type="button" onClick={onDelete}>
              Удалить
            </button>
          )}
          <button type="button" onClick={onClose}>
            Отмена
          </button>
          <button type="submit">{isEditing ? 'Сохранить' : 'Создать'}</button>
        </div>
      </form>
    </section>
  </div>
)
