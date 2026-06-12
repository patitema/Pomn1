export const emptyTaskForm = {
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

const padDatePart = (value) => String(value).padStart(2, '0')

export const createChecklistClientId = () => `checklist-${Date.now()}-${Math.random().toString(36).slice(2)}`

export const formatInputDate = (date) =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`

export const getTodayInputDate = () => formatInputDate(new Date())

export const getCurrentInputTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

export const buildDueDate = (date, time) => new Date(`${date}T${time || '00:00'}:00`).toISOString()

export const apiDateToInputDate = (date) => {
  if (!date) return ''

  return formatInputDate(new Date(date))
}

export const apiDateToInputTime = (date) => {
  if (!date) return emptyTaskForm.time

  const parsedDate = new Date(date)
  const hours = String(parsedDate.getHours()).padStart(2, '0')
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

export const mapApiTaskToForm = (task) => {
  const hasDeadline = Boolean(task?.deadline)

  return {
    title: task?.title || '',
    description: task?.description || '',
    checklistItems: (task?.checklist_items || []).map((item) => ({
      id: item.id,
      clientId: String(item.id),
      title: item.title || '',
      isCompleted: Boolean(item.is_completed),
      position: item.position,
    })),
    hasDeadline,
    date: apiDateToInputDate(task?.due_date),
    time: apiDateToInputTime(task?.due_date),
    deadlineDate: hasDeadline ? apiDateToInputDate(task.deadline) : '',
    deadlineTime: hasDeadline ? apiDateToInputTime(task.deadline) : emptyTaskForm.deadlineTime,
    priority: task?.priority || emptyTaskForm.priority,
    status: task?.status || emptyTaskForm.status,
    note: task?.note ? String(task.note) : '',
  }
}

export const createTaskPayloadFromForm = (form) => ({
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
