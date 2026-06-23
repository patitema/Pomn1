import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { selectUser } from '@entities/user'
import { TaskModal } from '@features/manage-task'
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetNotesQuery,
  useGetTasksQuery,
  useUpdateTaskMutation,
} from '@shared/api'
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

const emptyTaskForm = {
  title: '',
  description: '',
  checklistItems: [],
  hasDeadline: false,
  date: '',
  time: '00:00',
  deadlineDate: '',
  deadlineTime: '00:00',
  priority: 'low',
  status: 'planned',
  note: '',
}

const emptyTaskFilters = {
  search: '',
  status: '',
  priority: '',
  dateFrom: '',
  dateTo: '',
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

const parseInputDate = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const [year, month, day] = value.split('-').map(Number)
  const parsedDate = new Date(year, month - 1, day)

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null
  }

  return parsedDate
}

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

const taskDateToDate = (date) => {
  const [day, month, year] = date.split('.').map(Number)

  return new Date(year, month - 1, day)
}

const apiDateToTaskDate = (date) => formatTaskDate(new Date(date))

const apiDateToTaskTime = (date) => {
  const parsedDate = new Date(date)
  const hours = String(parsedDate.getHours()).padStart(2, '0')
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

const buildDueDate = (date, time) => new Date(`${date}T${time || '00:00'}:00`).toISOString()

const createChecklistClientId = () => `checklist-${Date.now()}-${Math.random().toString(36).slice(2)}`

const getTodayInputDate = () => formatInputDate(new Date())

const getCurrentInputTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

const createTaskFromForm = (form) => ({
  title: form.title.trim(),
  description: form.description.trim(),
  checklist_items: form.checklistItems.map((item, index) => ({
    ...(item.id ? { id: item.id } : {}),
    title: item.title.trim(),
    is_completed: item.isCompleted,
    position: index,
  })),
  due_date: buildDueDate(form.date, form.time),
  deadline: form.hasDeadline ? buildDueDate(form.deadlineDate, form.deadlineTime) : null,
  priority: form.priority,
  status: form.status,
  note_id: form.note ? Number(form.note) : null,
})

const buildTaskFilterParams = (filters) => {
  const params = {}

  if (filters.search.trim()) params.search = filters.search.trim()
  if (filters.status) params.status = filters.status
  if (filters.priority) params.priority = filters.priority
  if (filters.dateFrom) params.date_from = filters.dateFrom
  if (filters.dateTo) params.date_to = filters.dateTo
  if (filters.note) params.note_id = filters.note

  return params
}

const mapApiTasksToDisplay = (apiTasks, noteTitlesById) =>
  apiTasks.map((task) => {
    const hasDeadline = Boolean(task.deadline)

    return {
      id: task.id,
      title: task.title,
      description: task.description || '',
      checklistItems: (task.checklist_items || []).map((item) => ({
        id: item.id,
        clientId: String(item.id),
        title: item.title || '',
        isCompleted: Boolean(item.is_completed),
        position: item.position,
      })),
      hasDeadline,
      date: apiDateToTaskDate(task.due_date),
      time: apiDateToTaskTime(task.due_date),
      deadlineDate: hasDeadline ? apiDateToTaskDate(task.deadline) : '',
      deadlineTime: hasDeadline ? apiDateToTaskTime(task.deadline) : '',
      deadlineLabel: hasDeadline ? `${apiDateToTaskDate(task.deadline)} ${apiDateToTaskTime(task.deadline)}` : 'Без дедлайна',
      priority: task.priority,
      status: task.status,
      note: task.note ? noteTitlesById[task.note] || '' : '',
      noteId: task.note,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    }
  })

const sortTasksChronologically = (tasks) =>
  [...tasks].sort((firstTask, secondTask) => {
    const firstDate = taskDateToDate(firstTask.date).getTime()
    const secondDate = taskDateToDate(secondTask.date).getTime()

    if (firstDate !== secondDate) {
      return firstDate - secondDate
    }

    const timeCompare = firstTask.time.localeCompare(secondTask.time)
    if (timeCompare !== 0) {
      return timeCompare
    }

    return String(firstTask.createdAt || '').localeCompare(String(secondTask.createdAt || ''))
  })

const TasksPage = () => {
  document.title = 'POMNI - TASKS'

  const user = useSelector(selectUser)
  const [searchParams] = useSearchParams()
  const { data: apiTasks = [], isLoading: tasksLoading } = useGetTasksQuery()
  const { data: notes = [], isLoading: notesLoading } = useGetNotesQuery({ is_folder: false })
  const [createTask] = useCreateTaskMutation()
  const [updateTask] = useUpdateTaskMutation()
  const [deleteTask] = useDeleteTaskMutation()
  const [view, setView] = useState('week')
  const [focusedDate, setFocusedDate] = useState(() => normalizeDate(new Date()))
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [taskForm, setTaskForm] = useState(emptyTaskForm)
  const [taskFilters, setTaskFilters] = useState(emptyTaskFilters)
  const [formError, setFormError] = useState('')
  const taskFilterParams = useMemo(() => buildTaskFilterParams(taskFilters), [taskFilters])
  const hasTaskFilters = Object.keys(taskFilterParams).length > 0
  const { data: filteredApiTasks = [], isFetching: filteredTasksFetching } = useGetTasksQuery(taskFilterParams, {
    skip: view !== 'all' || !hasTaskFilters,
  })
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )
  const minDate = getTodayInputDate()
  const minTime = taskForm.date === minDate ? getCurrentInputTime() : undefined
  const minDeadlineTime =
    taskForm.hasDeadline && taskForm.deadlineDate === minDate ? getCurrentInputTime() : undefined

  const weekDays = useMemo(() => buildWeekDays(focusedDate), [focusedDate])
  const calendarDays = useMemo(() => buildCalendarDays(focusedDate), [focusedDate])
  const weekPeriodLabel = useMemo(() => formatWeekLabel(weekDays), [weekDays])
  const calendarPeriodLabel = useMemo(() => formatMonthLabel(focusedDate), [focusedDate])
  const noteOptions = useMemo(() => notes.filter((note) => !note.is_folder), [notes])
  const noteTitlesById = useMemo(() => {
    return noteOptions.reduce((acc, note) => {
      acc[note.id] = note.title
      return acc
    }, {})
  }, [noteOptions])
  const tasks = useMemo(() => mapApiTasksToDisplay(apiTasks, noteTitlesById), [apiTasks, noteTitlesById])
  const filteredTasks = useMemo(
    () => mapApiTasksToDisplay(filteredApiTasks, noteTitlesById),
    [filteredApiTasks, noteTitlesById]
  )

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
  const sortedTasks = useMemo(() => sortTasksChronologically(tasks), [tasks])
  const sortedFilteredTasks = useMemo(() => sortTasksChronologically(filteredTasks), [filteredTasks])
  const allViewTasks = hasTaskFilters ? sortedFilteredTasks : sortedTasks

  useEffect(() => {
    const targetView = searchParams.get('view')
    const targetDate = parseInputDate(searchParams.get('date'))

    if (targetView === 'week') {
      setView('week')
    }

    if (targetDate) {
      setFocusedDate((currentDate) => (isSameDate(currentDate, targetDate) ? currentDate : targetDate))
    }
  }, [searchParams])

  const openCreateModal = (date = '') => {
    const selectedDate = toInputDate(date)

    setEditingTaskId(null)
    setTaskForm({
      ...emptyTaskForm,
      date: selectedDate,
      time: selectedDate === minDate ? getCurrentInputTime() : emptyTaskForm.time,
    })
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (task) => {
    setEditingTaskId(task.id)
    setTaskForm({
      title: task.title,
      description: task.description,
      checklistItems: task.checklistItems,
      hasDeadline: task.hasDeadline,
      date: toInputDate(task.date),
      time: task.time,
      deadlineDate: task.hasDeadline ? toInputDate(task.deadlineDate) : '',
      deadlineTime: task.hasDeadline ? task.deadlineTime : emptyTaskForm.deadlineTime,
      priority: task.priority,
      status: task.status,
      note: task.noteId ? String(task.noteId) : '',
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
      ...(field === 'hasDeadline' && value
        ? {
            deadlineDate: currentForm.deadlineDate || currentForm.date || minDate,
            deadlineTime:
              currentForm.deadlineDate === minDate || (!currentForm.deadlineDate && currentForm.date === minDate)
                ? getCurrentInputTime()
                : currentForm.deadlineTime,
          }
        : {}),
      ...(field === 'hasDeadline' && !value
        ? {
            deadlineDate: '',
            deadlineTime: emptyTaskForm.deadlineTime,
          }
        : {}),
      [field]: value,
    }))
    setFormError('')
  }

  const handleAddChecklistItem = () => {
    setTaskForm((currentForm) => ({
      ...currentForm,
      checklistItems: [
        ...currentForm.checklistItems,
        {
          clientId: createChecklistClientId(),
          title: '',
          isCompleted: false,
        },
      ],
    }))
    setFormError('')
  }

  const handleChecklistItemChange = (clientId, field, value) => {
    setTaskForm((currentForm) => ({
      ...currentForm,
      checklistItems: currentForm.checklistItems.map((item) =>
        item.clientId === clientId ? { ...item, [field]: value } : item
      ),
    }))
    setFormError('')
  }

  const handleRemoveChecklistItem = (clientId) => {
    setTaskForm((currentForm) => ({
      ...currentForm,
      checklistItems: currentForm.checklistItems.filter((item) => item.clientId !== clientId),
    }))
    setFormError('')
  }

  const handleFilterChange = (field, value) => {
    setTaskFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }))
  }

  const resetTaskFilters = () => {
    setTaskFilters(emptyTaskFilters)
  }

  const handleSaveTask = async (event) => {
    event.preventDefault()

    if (taskForm.checklistItems.some((item) => !item.title.trim())) {
      setFormError('Заполните все пункты чек-листа или удалите пустые')
      return
    }

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

    if (taskForm.hasDeadline && !taskForm.deadlineDate) {
      setFormError('Выберите дату дедлайна')
      return
    }

    if (taskForm.hasDeadline && taskForm.deadlineDate < minDate) {
      setFormError('Нельзя выбрать дедлайн раньше текущей даты')
      return
    }

    if (taskForm.hasDeadline && taskForm.deadlineDate === minDate && taskForm.deadlineTime < getCurrentInputTime()) {
      setFormError('Для текущего дня выберите дедлайн не раньше текущего времени')
      return
    }

    try {
      if (editingTaskId) {
        await updateTask({
          id: editingTaskId,
          body: createTaskFromForm(taskForm),
        }).unwrap()
      } else {
        await createTask(createTaskFromForm(taskForm)).unwrap()
      }

      closeTaskModal()
    } catch (err) {
      setFormError(
        err.data?.deadline?.[0] ||
          err.data?.due_date?.[0] ||
          err.data?.title?.[0] ||
          'Не удалось сохранить задачу'
      )
    }
  }

  const handleDeleteTask = async () => {
    try {
      await deleteTask(editingTaskId).unwrap()
      closeTaskModal()
    } catch (err) {
      setFormError(err.data?.detail || 'Не удалось удалить задачу')
    }
  }

  const handleCompleteTask = async (taskId) => {
    try {
      await updateTask({ id: taskId, body: { status: 'done' } }).unwrap()
    } catch (err) {
      setFormError(err.data?.detail || 'Не удалось завершить задачу')
    }
  }

  const handleRestoreTask = async (taskId) => {
    try {
      await updateTask({ id: taskId, body: { status: 'planned' } }).unwrap()
    } catch (err) {
      setFormError(err.data?.detail || 'Не удалось вернуть задачу')
    }
  }

  const handleRemoveTask = async (taskId) => {
    try {
      await deleteTask(taskId).unwrap()
    } catch (err) {
      setFormError(err.data?.detail || 'Не удалось убрать задачу')
    }
  }

  const handleDragEnd = async ({ active, over }) => {
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

    if (draggedTask.date === targetDate) return

    try {
      await updateTask({
        id: taskId,
        body: {
          due_date: buildDueDate(targetInputDate, draggedTask.time),
        },
      }).unwrap()
    } catch (err) {
      setFormError(err.data?.detail || 'Не удалось переместить задачу')
    }
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
                  className={`tasks-view-toggle__button ${view === 'all' ? 'active' : ''}`}
                  type="button"
                  onClick={() => setView('all')}
                >
                  Все задачи
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

          {tasksLoading || notesLoading ? (
            <p className="tasks-page__loading">Загрузка задач...</p>
          ) : view === 'week' ? (
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
          ) : view === 'all' ? (
            <>
              <TasksFilterBar
                filters={taskFilters}
                noteOptions={noteOptions}
                onChange={handleFilterChange}
                onReset={resetTaskFilters}
              />
              <AllTasksView
                hasFilters={hasTaskFilters}
                isLoading={filteredTasksFetching}
                tasks={allViewTasks}
                totalTasksCount={tasks.length}
                onEditTask={openEditModal}
                onCompleteTask={handleCompleteTask}
                onRemoveTask={handleRemoveTask}
                onRestoreTask={handleRestoreTask}
              />
            </>
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
          noteOptions={noteOptions}
          priorities={PRIORITIES}
          statuses={STATUSES}
          onChange={handleFormChange}
          onAddChecklistItem={handleAddChecklistItem}
          onChecklistItemChange={handleChecklistItemChange}
          onRemoveChecklistItem={handleRemoveChecklistItem}
          onClose={closeTaskModal}
          onDelete={handleDeleteTask}
          onSubmit={handleSaveTask}
          minDeadlineTime={minDeadlineTime}
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

const TasksFilterBar = ({ filters, noteOptions, onChange, onReset }) => {
  const [areFiltersOpen, setAreFiltersOpen] = useState(false)
  const hasActiveFilters = Object.values(filters).some(Boolean)

  useEffect(() => {
    if (hasActiveFilters) {
      setAreFiltersOpen(true)
    }
  }, [hasActiveFilters])

  return (
    <section className="tasks-filter-panel" aria-label="Фильтры задач">
      <button
        className={[
          'tasks-filter-toggle',
          areFiltersOpen ? 'is-open' : '',
          hasActiveFilters ? 'has-active' : '',
        ].filter(Boolean).join(' ')}
        type="button"
        aria-expanded={areFiltersOpen}
        aria-controls="tasks-filter-bar"
        onClick={() => setAreFiltersOpen((current) => !current)}
      >
        <span>{hasActiveFilters ? 'Фильтры активны' : 'Фильтры'}</span>
      </button>

      <div id="tasks-filter-bar" className={`tasks-filter-bar ${areFiltersOpen ? 'is-open' : ''}`}>
    <label className="tasks-filter-field tasks-filter-field--search">
      <span>Поиск</span>
      <input
        type="search"
        placeholder="Название или описание"
        value={filters.search}
        onChange={(event) => onChange('search', event.target.value)}
      />
    </label>

    <label className="tasks-filter-field">
      <span>Статус</span>
      <select value={filters.status} onChange={(event) => onChange('status', event.target.value)}>
        <option value="">Все</option>
        {Object.entries(STATUSES).map(([statusKey, status]) => (
          <option key={statusKey} value={statusKey}>
            {status.label}
          </option>
        ))}
      </select>
    </label>

    <label className="tasks-filter-field">
      <span>Приоритет</span>
      <select value={filters.priority} onChange={(event) => onChange('priority', event.target.value)}>
        <option value="">Все</option>
        {Object.entries(PRIORITIES).map(([priorityKey, priority]) => (
          <option key={priorityKey} value={priorityKey}>
            {priority.label}
          </option>
        ))}
      </select>
    </label>

    <label className="tasks-filter-field">
      <span>От</span>
      <input type="date" value={filters.dateFrom} onChange={(event) => onChange('dateFrom', event.target.value)} />
    </label>

    <label className="tasks-filter-field">
      <span>До</span>
      <input type="date" value={filters.dateTo} onChange={(event) => onChange('dateTo', event.target.value)} />
    </label>

    <label className="tasks-filter-field tasks-filter-field--note">
      <span>Заметка</span>
      <select value={filters.note} onChange={(event) => onChange('note', event.target.value)}>
        <option value="">Все</option>
        {noteOptions.map((note) => (
          <option key={note.id} value={note.id}>
            {note.title}
          </option>
        ))}
      </select>
    </label>

    <button className="tasks-filter-reset" type="button" onClick={onReset}>
      Сбросить
    </button>
      </div>
    </section>
  )
}

const AllTasksView = ({
  hasFilters,
  isLoading,
  tasks,
  totalTasksCount,
  onEditTask,
  onCompleteTask,
  onRemoveTask,
  onRestoreTask,
}) => (
  <section className="tasks-all-list" aria-label="Все задачи">
    {isLoading ? (
      <p className="tasks-all-list__empty">Загрузка...</p>
    ) : tasks.length === 0 ? (
      <p className="tasks-all-list__empty">
        {hasFilters && totalTasksCount > 0 ? 'Ничего не найдено' : 'Пока задач нет'}
      </p>
    ) : (
      tasks.map((task) => {
        const priority = PRIORITIES[task.priority]
        const taskStatus = STATUSES[task.status]
        const isDone = task.status === 'done'

        return (
          <article
            className={`tasks-all-row ${isDone ? 'tasks-all-row--done' : ''}`}
            key={task.id}
            role="button"
            tabIndex={0}
            style={{ '--priority-color': priority.color }}
            onClick={() => onEditTask(task)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onEditTask(task)
              }
            }}
          >
            <div className="tasks-all-row__date">
              <span>{task.date}</span>
              <strong>{task.time}</strong>
            </div>

            <div className="tasks-all-row__main">
              <strong>{task.title}</strong>
              {task.description && <p>{task.description}</p>}
            </div>

            <div className="tasks-all-row__meta">
              <span>{priority.label}</span>
              <span>{taskStatus.label}</span>
              <span>{task.deadlineLabel}</span>
              {task.note && <span>{task.note}</span>}
            </div>

            <div className="tasks-all-row__actions">
              {isDone ? (
                <>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onRestoreTask(task.id)
                    }}
                  >
                    Вернуть
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onRemoveTask(task.id)
                    }}
                  >
                    Убрать
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onCompleteTask(task.id)
                  }}
                >
                  Завершить
                </button>
              )}
            </div>
          </article>
        )
      })
    )}
  </section>
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
          {task.hasDeadline && <small>Дедлайн: {task.deadlineLabel}</small>}
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
