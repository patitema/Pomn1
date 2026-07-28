export const PRIORITIES = {
  high: { label: 'высокий', color: '#ff8787' },
  medium: { label: 'средний', color: '#fbff87' },
  low: { label: 'низкий', color: '#91ff87' },
}

export const STATUSES = {
  planned: { label: 'Планирую' },
  'in-progress': { label: 'В процессе' },
  done: { label: 'Завершено' },
}

export const WEEKDAY_LABELS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']

export const MONTH_LABELS = [
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

export const MONTH_LABELS_GENITIVE = [
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

export const emptyTaskForm = {
  title: '',
  description: '',
  checklistItems: [],
  isAllDay: false,
  hasDeadline: false,
  date: '',
  time: '00:00',
  deadlineDate: '',
  deadlineTime: '00:00',
  priority: 'low',
  status: 'planned',
  note: '',
  boardColumnId: null,
}

export const emptyTaskFilters = {
  search: '',
  status: '',
  priority: '',
  dateFrom: '',
  dateTo: '',
  note: '',
}

export const padDatePart = (value) => String(value).padStart(2, '0')

export const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const addDays = (date, days) => {
  const result = normalizeDate(date)
  result.setDate(result.getDate() + days)

  return result
}

export const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()

export const addMonthsClamped = (date, months) => {
  const normalizedDate = normalizeDate(date)
  const targetYear = normalizedDate.getFullYear()
  const targetMonth = normalizedDate.getMonth() + months
  const targetDay = normalizedDate.getDate()
  const lastTargetDay = getDaysInMonth(targetYear, targetMonth)

  return new Date(targetYear, targetMonth, Math.min(targetDay, lastTargetDay))
}

export const getMonday = (date) => {
  const normalizedDate = normalizeDate(date)
  const dayIndex = normalizedDate.getDay()
  const mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex

  return addDays(normalizedDate, mondayOffset)
}

export const isSameDate = (firstDate, secondDate) =>
  firstDate.getFullYear() === secondDate.getFullYear() &&
  firstDate.getMonth() === secondDate.getMonth() &&
  firstDate.getDate() === secondDate.getDate()

export const formatInputDate = (date) =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`

export const parseInputDate = (value) => {
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

export const formatTaskDate = (date) =>
  `${padDatePart(date.getDate())}.${padDatePart(date.getMonth() + 1)}.${date.getFullYear()}`

export const formatDisplayDate = (date) => `${date.getDate()} ${MONTH_LABELS_GENITIVE[date.getMonth()]}`

export const formatMonthLabel = (date) => `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`

export const formatWeekLabel = (days) => {
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

export const buildWeekDays = (focusedDate) => {
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

export const buildCalendarDays = (focusedDate) => {
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

export const toInputDate = (date) => {
  if (!date || date.includes('-')) return date

  const [day, month, year] = date.split('.')
  return `${year}-${month}-${day}`
}

export const taskDateToDate = (date) => {
  const [day, month, year] = date.split('.').map(Number)

  return new Date(year, month - 1, day)
}

export const apiDateToTaskDate = (date) => (date ? formatTaskDate(new Date(date)) : '')

export const apiDateToTaskTime = (date) => {
  if (!date) return ''

  const parsedDate = new Date(date)
  const hours = String(parsedDate.getHours()).padStart(2, '0')
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

export const buildDueDate = (date, time, isAllDay = false) =>
  new Date(`${date}T${isAllDay ? '00:00' : time || '00:00'}:00`).toISOString()

export const createChecklistClientId = () => `checklist-${Date.now()}-${Math.random().toString(36).slice(2)}`

export const getTodayInputDate = () => formatInputDate(new Date())

export const getCurrentInputTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

export const createTaskFromForm = (form) => ({
  title: form.title.trim(),
  description: form.description.trim(),
  checklist_items: form.checklistItems.map((item, index) => ({
    ...(item.id ? { id: item.id } : {}),
    title: item.title.trim(),
    is_completed: item.isCompleted,
    position: index,
  })),
  due_date: form.date ? buildDueDate(form.date, form.time, form.isAllDay) : null,
  is_all_day: Boolean(form.date && form.isAllDay),
  deadline: form.hasDeadline ? buildDueDate(form.deadlineDate, form.deadlineTime) : null,
  priority: form.priority,
  status: form.status,
  note_id: form.note ? Number(form.note) : null,
  board_column_id: form.boardColumnId ? Number(form.boardColumnId) : null,
})

export const buildTaskFilterParams = (filters) => {
  const params = {}

  if (filters.search.trim()) params.search = filters.search.trim()
  if (filters.status) params.status = filters.status
  if (filters.priority) params.priority = filters.priority
  if (filters.dateFrom) params.date_from = filters.dateFrom
  if (filters.dateTo) params.date_to = filters.dateTo
  if (filters.note) params.note_id = filters.note

  return params
}

export const mapApiTasksToDisplay = (apiTasks, noteTitlesById) =>
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
      isAllDay: Boolean(task.is_all_day),
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
      boardColumnId: task.board_column?.id || null,
      boardPosition: task.board_position,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    }
  })

export const sortTasksChronologically = (tasks) =>
  [...tasks].sort((firstTask, secondTask) => {
    const firstDate = taskDateToDate(firstTask.date).getTime()
    const secondDate = taskDateToDate(secondTask.date).getTime()

    if (firstDate !== secondDate) {
      return firstDate - secondDate
    }

    if (firstTask.isAllDay !== secondTask.isAllDay) {
      return firstTask.isAllDay ? -1 : 1
    }

    const timeCompare = firstTask.time.localeCompare(secondTask.time)
    if (timeCompare !== 0) {
      return timeCompare
    }

    return String(firstTask.createdAt || '').localeCompare(String(secondTask.createdAt || ''))
  })

export const buildNoteTitlesById = (notes) =>
  notes.reduce((acc, note) => {
    acc[note.id] = note.title
    return acc
  }, {})

export const groupTasksByDate = (tasks) => {
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!task.date) return acc
    acc[task.date] = acc[task.date] ? [...acc[task.date], task] : [task]
    return acc
  }, {})

  Object.keys(groupedTasks).forEach((date) => {
    groupedTasks[date].sort((firstTask, secondTask) => {
      if (firstTask.isAllDay !== secondTask.isAllDay) {
        return firstTask.isAllDay ? -1 : 1
      }

      return firstTask.time.localeCompare(secondTask.time)
    })
  })

  return groupedTasks
}

export const buildTasksSummary = (tasks) => ({
  total: tasks.length,
  inProgress: tasks.filter((task) => task.status === 'in-progress').length,
  done: tasks.filter((task) => task.status === 'done').length,
})

export const selectAllViewTasks = ({ hasTaskFilters, sortedFilteredTasks, sortedTasks }) =>
  hasTaskFilters ? sortedFilteredTasks : sortedTasks
