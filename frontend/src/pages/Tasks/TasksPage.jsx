import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { selectUser } from '@entities/user'
import { Footer } from '@widgets/footer'
import './TasksPage.css'

const PRIORITIES = {
  high: { label: 'высокий', color: '#ff8787' },
  medium: { label: 'средний', color: '#fbff87' },
  low: { label: 'низкий', color: '#91ff87' },
}

const STATUSES = {
  planned: { label: 'Планирую' },
  'in-progress': { label: 'В процессе' },
  done: { label: 'Завершено' },
}

const WEEKDAY_LABELS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']

const MONTH_LABELS = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
]

const MONTH_LABELS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

const NOTE_OPTIONS = ['План зож', 'Учёба', 'Расписание']

const INITIAL_TASKS = []

const emptyTaskForm = {
  title: '',
  description: '',
  date: '',
  time: '00:00',
  priority: 'low',
  status: 'planned',
  note: '',
}

const padDatePart = (value) => String(value).padStart(2, '0')

const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const addDays = (date, days) => {
  const result = normalizeDate(date)
  result.setDate(result.getDate() + days)

  return result
}

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()

const addMonthsClamped = (date, months) => {
  const normalizedDate = normalizeDate(date)
  const targetYear = normalizedDate.getFullYear()
  const targetMonth = normalizedDate.getMonth() + months
  const targetDay = normalizedDate.getDate()
  const lastTargetDay = getDaysInMonth(targetYear, targetMonth)

  return new Date(targetYear, targetMonth, Math.min(targetDay, lastTargetDay))
}

const getMonday = (date) => {
  const normalizedDate = normalizeDate(date)
  const dayIndex = normalizedDate.getDay()
  const mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex

  return addDays(normalizedDate, mondayOffset)
}

const isSameDate = (firstDate, secondDate) =>
  firstDate.getFullYear() === secondDate.getFullYear() &&
  firstDate.getMonth() === secondDate.getMonth() &&
  firstDate.getDate() === secondDate.getDate()

const formatInputDate = (date) =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`

const formatTaskDate = (date) =>
  `${padDatePart(date.getDate())}.${padDatePart(date.getMonth() + 1)}.${date.getFullYear()}`

const formatDisplayDate = (date) => `${date.getDate()} ${MONTH_LABELS_GENITIVE[date.getMonth()]}`

const formatMonthLabel = (date) => `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`

const formatWeekLabel = (days) => {
  const firstDate = days[0].sourceDate
  const lastDate = days[days.length - 1].sourceDate

  if (firstDate.getMonth() === lastDate.getMonth() && firstDate.getFullYear() === lastDate.getFullYear()) {
    return `${firstDate.getDate()} - ${lastDate.getDate()} ${MONTH_LABELS_GENITIVE[lastDate.getMonth()]} ${lastDate.getFullYear()}`
  }

  if (firstDate.getFullYear() === lastDate.getFullYear()) {
    return `${firstDate.getDate()} ${MONTH_LABELS_GENITIVE[firstDate.getMonth()]} - ${lastDate.getDate()} ${MONTH_LABELS_GENITIVE[lastDate.getMonth()]} ${lastDate.getFullYear()}`
  }

  return `${firstDate.getDate()} ${MONTH_LABELS_GENITIVE[firstDate.getMonth()]} ${firstDate.getFullYear()} - ${lastDate.getDate()} ${MONTH_LABELS_GENITIVE[lastDate.getMonth()]} ${lastDate.getFullYear()}`
}

const buildWeekDays = (focusedDate) => {
  const monday = getMonday(focusedDate)
  const today = normalizeDate(new Date())

  return WEEKDAY_LABELS.map((weekday, index) => {
    const date = addDays(monday, index)

    return {
      key: formatInputDate(date),
      day: weekday,
      date: formatDisplayDate(date),
      modalDate: formatTaskDate(date),
      current: isSameDate(date, today),
      sourceDate: date,
    }
  })
}

const buildCalendarDays = (focusedDate) => {
  const today = normalizeDate(new Date())
  const monthStart = new Date(focusedDate.getFullYear(), focusedDate.getMonth(), 1)
  const leadingDaysCount = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1
  const monthDaysCount = getDaysInMonth(focusedDate.getFullYear(), focusedDate.getMonth())
  const gridDaysCount = Math.ceil((leadingDaysCount + monthDaysCount) / 7) * 7
  const gridStart = addDays(monthStart, -leadingDaysCount)

  return Array.from({ length: gridDaysCount }, (_, index) => {
    const date = addDays(gridStart, index)

    return {
      day: date.getDate(),
      date: formatTaskDate(date),
      muted: date.getMonth() !== focusedDate.getMonth(),
      current: isSameDate(date, today),
    }
  })
}

const toInputDate = (date) => {
  if (!date || date.includes('-')) return date

  const [day, month, year] = date.split('.')
  return `${year}-${month}-${day}`
}

const toTaskDate = (date) => {
  if (!date || date.includes('.')) return date

  const [year, month, day] = date.split('-')
  return `${day}.${month}.${year}`
}

const taskDateToDate = (date) => {
  const [day, month, year] = date.split('.').map(Number)

  return new Date(year, month - 1, day)
}

const getTodayInputDate = () => formatInputDate(new Date())

const getCurrentInputTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

const createTaskFromForm = (form) => ({
  id: Date.now(),
  title: form.title.trim(),
  description: form.description.trim(),
  date: toTaskDate(form.date),
  time: form.time || '00:00',
  priority: form.priority,
  status: form.status,
  note: form.note,
  createdAt: new Date().toISOString(),
})

const TasksPage = () => {
  document.title = 'POMNI - TASKS'

  const user = useSelector(selectUser)
  const [view, setView] = useState('week')
  const [focusedDate, setFocusedDate] = useState(() => normalizeDate(new Date()))
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [taskForm, setTaskForm] = useState(emptyTaskForm)
  const [formError, setFormError] = useState('')
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )
  const minDate = getTodayInputDate()
  const minTime = taskForm.date === minDate ? getCurrentInputTime() : undefined

  const weekDays = useMemo(() => buildWeekDays(focusedDate), [focusedDate])
  const calendarDays = useMemo(() => buildCalendarDays(focusedDate), [focusedDate])
  const weekPeriodLabel = useMemo(() => formatWeekLabel(weekDays), [weekDays])
  const calendarPeriodLabel = useMemo(() => formatMonthLabel(focusedDate), [focusedDate])

  const tasksByDate = useMemo(() => {
    const groupedTasks = tasks.reduce((acc, task) => {
      acc[task.date] = acc[task.date] ? [...acc[task.date], task] : [task]
      return acc
    }, {})

    Object.keys(groupedTasks).forEach((date) => {
      groupedTasks[date].sort((firstTask, secondTask) => firstTask.time.localeCompare(secondTask.time))
    })

    return groupedTasks
  }, [tasks])

  const summary = useMemo(() => {
    return {
      total: tasks.length,
      inProgress: tasks.filter((task) => task.status === 'in-progress').length,
      done: tasks.filter((task) => task.status === 'done').length,
    }
  }, [tasks])

  const openCreateModal = (date = '') => {
    setEditingTaskId(null)
    setTaskForm({
      ...emptyTaskForm,
      date: toInputDate(date),
    })
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (task) => {
    setEditingTaskId(task.id)
    setTaskForm({
      title: task.title,
      description: task.description,
      date: toInputDate(task.date),
      time: task.time,
      priority: task.priority,
      status: task.status,
      note: task.note,
    })
    setFormError('')
    setIsModalOpen(true)
  }

  const closeTaskModal = () => {
    setIsModalOpen(false)
    setEditingTaskId(null)
    setFormError('')
  }

  const handleFormChange = (field, value) => {
    setTaskForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
    setFormError('')
  }

  const handleSaveTask = (event) => {
    event.preventDefault()

    if (!taskForm.title.trim()) {
      setFormError('Введите название задачи')
      return
    }

    if (!taskForm.date) {
      setFormError('Выберите дату задачи')
      return
    }

    if (taskForm.date < minDate) {
      setFormError('Нельзя выбрать дату раньше текущей')
      return
    }

    if (taskForm.date === minDate && taskForm.time < getCurrentInputTime()) {
      setFormError('Для текущего дня выберите время не раньше текущего')
      return
    }

    if (editingTaskId) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                ...createTaskFromForm(taskForm),
                id: task.id,
                createdAt: task.createdAt,
              }
            : task
        )
      )
    } else {
      setTasks((currentTasks) => [...currentTasks, createTaskFromForm(taskForm)])
    }

    closeTaskModal()
  }

  const handleDeleteTask = () => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== editingTaskId))
    closeTaskModal()
  }

  const handleCompleteTask = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status: 'done' } : task
      )
    )
  }

  const handleRestoreTask = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status: 'planned' } : task
      )
    )
  }

  const handleRemoveTask = (taskId) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
  }

  const handleDragEnd = ({ active, over }) => {
    if (!over) return

    const taskId = active.data.current?.taskId
    const targetDate = over.data.current?.date
    const isDropDisabled = over.data.current?.disabled

    if (!taskId || !targetDate || isDropDisabled || toInputDate(targetDate) < minDate) {
      return
    }

    const targetInputDate = toInputDate(targetDate)
    const draggedTask = tasks.find((task) => task.id === taskId)

    if (!draggedTask || (targetInputDate === minDate && draggedTask.time < getCurrentInputTime())) {
      return
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId && task.date !== targetDate ? { ...task, date: targetDate } : task
      )
    )
  }

  const handlePreviousWeek = () => {
    setFocusedDate((currentDate) => addDays(currentDate, -7))
  }

  const handleNextWeek = () => {
    setFocusedDate((currentDate) => addDays(currentDate, 7))
  }

  const handlePreviousMonth = () => {
    setFocusedDate((currentDate) => addMonthsClamped(currentDate, -1))
  }

  const handleNextMonth = () => {
    setFocusedDate((currentDate) => addMonthsClamped(currentDate, 1))
  }

  const handleCalendarDateSelect = (date) => {
    setFocusedDate(taskDateToDate(date))
    setView('week')
  }

  return (
    <div className="page-container tasks-page">
      <div className="tasks-page__inner">
        <header className="tasks-page__brand">
          <h1>POMNI</h1>
          <p>{user ? `${user.username} BASE` : 'BASE NAME'}</p>
        </header>

        <main className="tasks-page__content">
          <section className="tasks-page__topbar">
            <div className="tasks-page__heading">
              <h2>Задачи</h2>
              <div className="tasks-view-toggle" aria-label="Переключение вида задач">
                <button
                  className={`tasks-view-toggle__button ${view === 'week' ? 'active' : ''}`}
                  type="button"
                  onClick={() => setView('week')}
                >
                  Неделя
                </button>
                <button
                  className={`tasks-view-toggle__button ${view === 'calendar' ? 'active' : ''}`}
                  type="button"
                  onClick={() => setView('calendar')}
                >
                  Календарь
                </button>
              </div>
            </div>

            <button className="tasks-create-button" type="button" onClick={() => openCreateModal()}>
              Новая задача
            </button>
          </section>

          {view === 'week' ? (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <WeekView
                days={weekDays}
                minDate={minDate}
                periodLabel={weekPeriodLabel}
                summary={summary}
                tasksByDate={tasksByDate}
                onAddTask={openCreateModal}
                onEditTask={openEditModal}
                onCompleteTask={handleCompleteTask}
                onNextPeriod={handleNextWeek}
                onPreviousPeriod={handlePreviousWeek}
                onRemoveTask={handleRemoveTask}
                onRestoreTask={handleRestoreTask}
              />
            </DndContext>
          ) : (
            <CalendarView
              days={calendarDays}
              periodLabel={calendarPeriodLabel}
              tasksByDate={tasksByDate}
              onAddTask={openCreateModal}
              onEditTask={openEditModal}
              onCompleteTask={handleCompleteTask}
              onDateSelect={handleCalendarDateSelect}
              onNextPeriod={handleNextMonth}
              onPreviousPeriod={handlePreviousMonth}
              onRemoveTask={handleRemoveTask}
              onRestoreTask={handleRestoreTask}
            />
          )}
        </main>
      </div>

      {isModalOpen && (
        <TaskModal
          taskForm={taskForm}
          isEditing={Boolean(editingTaskId)}
          error={formError}
          minDate={minDate}
          minTime={minTime}
          onChange={handleFormChange}
          onClose={closeTaskModal}
          onDelete={handleDeleteTask}
          onSubmit={handleSaveTask}
        />
      )}

      <Footer />
    </div>
  )
}

const WeekView = ({
  days,
  minDate,
  periodLabel,
  summary,
  tasksByDate,
  onAddTask,
  onEditTask,
  onCompleteTask,
  onNextPeriod,
  onPreviousPeriod,
  onRemoveTask,
  onRestoreTask,
}) => (
  <>
    <section className="tasks-summary" aria-label="Сводка задач">
      <SummaryCard icon="list" value={summary.total} label="Всего задач" />
      <SummaryCard icon="clock" value={summary.inProgress} label="В процессе" />
      <SummaryCard icon="check" value={summary.done} label="Завершено" />
    </section>

    <section className="tasks-period">
      <PeriodControls label={periodLabel} onNext={onNextPeriod} onPrevious={onPreviousPeriod} />
    </section>

    <section className="tasks-week-grid">
      {days.map((day) => {
        const isPastDay = toInputDate(day.modalDate) < minDate

        return (
          <DroppableWeekDay day={day} isPastDay={isPastDay} key={day.key}>
            <div className="tasks-week-day__header">
              <h3>{day.day}</h3>
              <span>{day.date}</span>
            </div>

            <div className="tasks-week-day__body">
              {(tasksByDate[day.modalDate] || []).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  mode="week"
                  onEdit={onEditTask}
                  onComplete={onCompleteTask}
                  onRemove={onRemoveTask}
                  onRestore={onRestoreTask}
                />
              ))}

              {!isPastDay && <AddTaskSlot onClick={() => onAddTask(day.modalDate)} />}
            </div>
          </DroppableWeekDay>
        )
      })}
    </section>
  </>
)

const CalendarView = ({
  days,
  periodLabel,
  tasksByDate,
  onAddTask,
  onEditTask,
  onCompleteTask,
  onDateSelect,
  onNextPeriod,
  onPreviousPeriod,
  onRemoveTask,
  onRestoreTask,
}) => (
  <>
    <section className="tasks-period tasks-period--calendar">
      <PeriodControls label={periodLabel} onNext={onNextPeriod} onPrevious={onPreviousPeriod} />
    </section>

    <section className="tasks-calendar">
      <div className="tasks-calendar__weekdays">
        {WEEKDAY_LABELS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="tasks-calendar__grid">
        {days.map((day, index) => {
          const dayTasks = tasksByDate[day.date] || []
          const visibleTasks = dayTasks.slice(0, 1)
          const hiddenTasksCount = dayTasks.length - visibleTasks.length

          return (
            <div
              className="tasks-calendar-cell"
              key={`${day.date}-${index}`}
              role="button"
              tabIndex={0}
              onClick={() => onAddTask(day.date)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  onAddTask(day.date)
                }
              }}
            >
              <span
                className={`tasks-calendar-cell__date ${day.muted ? 'muted' : ''} ${day.current ? 'current' : ''}`}
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation()
                  onDateSelect(day.date)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    event.stopPropagation()
                    onDateSelect(day.date)
                  }
                }}
              >
                {day.day}
              </span>

              {visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  mode="calendar"
                  onEdit={onEditTask}
                  onComplete={onCompleteTask}
                  onRemove={onRemoveTask}
                  onRestore={onRestoreTask}
                />
              ))}

              {hiddenTasksCount > 0 && (
                <span className="tasks-calendar-cell__more">+{hiddenTasksCount} задача</span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  </>
)

const DroppableWeekDay = ({
  children,
  day,
  isPastDay,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${day.modalDate}`,
    data: {
      date: day.modalDate,
      disabled: isPastDay,
    },
    disabled: isPastDay,
  })

  return (
    <article
      className={`tasks-week-day ${day.current ? 'tasks-week-day--current' : ''} ${isOver ? 'tasks-week-day--drop-target' : ''} ${isPastDay ? 'tasks-week-day--drop-blocked' : ''}`}
      key={day.key}
      ref={setNodeRef}
    >
      {children}
    </article>
  )
}

const SummaryCard = ({ icon, value, label }) => (
  <article className="tasks-summary-card">
    <TaskIcon type={icon} />
    <strong>{value}</strong>
    <span>{label}</span>
  </article>
)

const TaskCard = ({ task, mode, onEdit, onComplete, onRemove, onRestore }) => {
  const priority = PRIORITIES[task.priority]
  const isDone = task.status === 'done'
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: `task-${task.id}`,
    data: {
      taskId: task.id,
    },
    disabled: mode !== 'week',
  })

  const draggableProps = mode === 'week' ? { ...attributes, ...listeners } : {}

  return (
    <article
      className={`tasks-card tasks-card--${mode} ${isDone ? 'tasks-card--done' : ''} ${isDragging ? 'tasks-card--dragging' : ''}`}
      ref={setNodeRef}
      style={{
        '--priority-color': priority.color,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 20 : 'auto',
      }}
      {...draggableProps}
      role="button"
      tabIndex={0}
      onClick={(event) => {
        event.stopPropagation()
        onEdit(task)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.stopPropagation()
          onEdit(task)
        }
      }}
    >
      <span className="tasks-card__time">{task.time}</span>
      <strong>{task.title}</strong>
      {mode === 'week' && (
        <span className="tasks-card__meta">
          <span>{priority.label}</span>
          {task.note && <small>{task.note}</small>}
        </span>
      )}
      <span className="tasks-card__actions">
        {isDone ? (
          <>
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation()
                onRestore(task.id)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.stopPropagation()
                  onRestore(task.id)
                }
              }}
            >
              Вернуть
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation()
                onRemove(task.id)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.stopPropagation()
                  onRemove(task.id)
                }
              }}
            >
              Убрать
            </span>
          </>
        ) : (
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation()
              onComplete(task.id)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.stopPropagation()
                onComplete(task.id)
              }
            }}
          >
            Завершить
          </span>
        )}
      </span>
    </article>
  )
}

const AddTaskSlot = ({ onClick }) => (
  <button className="tasks-add-slot" type="button" onClick={onClick}>
    <span>+</span>
    <strong>Добавить</strong>
    <strong>задачу</strong>
  </button>
)

const PeriodControls = ({ label, onNext, onPrevious }) => (
  <div className="tasks-period-controls">
    <button type="button" aria-label="Предыдущий период" onClick={onPrevious}>
      ‹
    </button>
    <span>{label}</span>
    <button type="button" aria-label="Следующий период" onClick={onNext}>
      ›
    </button>
  </div>
)

const TaskModal = ({ taskForm, isEditing, error, minDate, minTime, onChange, onClose, onDelete, onSubmit }) => (
  <div className="tasks-modal-overlay" role="presentation">
    <section className="tasks-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
      <button className="tasks-modal__close" type="button" onClick={onClose} aria-label="Закрыть">
        ×
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

        <fieldset className="tasks-modal-field tasks-modal-priority">
          <legend>Приоритет</legend>
          {Object.entries(PRIORITIES).map(([priorityKey, priority]) => (
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
            {Object.entries(STATUSES).map(([statusKey, status]) => (
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
            {NOTE_OPTIONS.map((note) => (
              <option key={note} value={note}>
                {note}
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

const TaskIcon = ({ type }) => {
  if (type === 'clock') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l4 2" />
      </svg>
    )
  }

  if (type === 'check') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 4h14v16H5z" />
        <path d="m8 12 3 3 5-6" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h10v16H7z" />
      <path d="M10 8h4" />
      <path d="M10 12h4" />
      <path d="M10 16h4" />
    </svg>
  )
}

export default TasksPage
