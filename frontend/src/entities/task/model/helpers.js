import { routes } from '@shared/config'

const padDatePart = (value) => String(value).padStart(2, '0')

const parseDate = (rawDate) => {
  if (!rawDate) return null

  const parsedDate = new Date(rawDate)

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

const getDisplayDate = (task) => parseDate(task?.due_date || task?.deadline)

const getSortDate = (task) => getDisplayDate(task) || parseDate(task?.created_at)

const formatDateTime = (date) => {
  if (!date) return 'Без даты'

  return `${padDatePart(date.getDate())}.${padDatePart(date.getMonth() + 1)}.${date.getFullYear()}, ${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`
}

export const getTasksLinkedToNote = (tasks = [], noteId) => {
  const numericNoteId = Number(noteId)

  if (!numericNoteId) return []

  return tasks.filter((task) => Number(task?.note) === numericNoteId)
}

export const getTaskPreviewDate = (task) => getDisplayDate(task)

export const getTaskPreviewLabel = (task) => {
  const title = task?.title || `Задача ${task?.id ?? ''}`.trim()

  return `${title} - ${formatDateTime(getDisplayDate(task))}`
}

export const getNearestTaskPreviews = (tasks = [], noteId, limit = 3) => {
  const now = Date.now()

  return getTasksLinkedToNote(tasks, noteId)
    .sort((firstTask, secondTask) => {
      const firstDate = getSortDate(firstTask)
      const secondDate = getSortDate(secondTask)
      const firstTime = firstDate?.getTime()
      const secondTime = secondDate?.getTime()
      const firstUpcoming = firstTime >= now
      const secondUpcoming = secondTime >= now

      if (firstUpcoming !== secondUpcoming) {
        return firstUpcoming ? -1 : 1
      }

      if (firstTime && secondTime && firstTime !== secondTime) {
        return firstTime - secondTime
      }

      if (firstTime && !secondTime) return -1
      if (!firstTime && secondTime) return 1

      return String(firstTask?.created_at || '').localeCompare(String(secondTask?.created_at || ''))
    })
    .slice(0, limit)
}

export const getTaskWeekQuery = (task) => {
  const taskDate = getDisplayDate(task)
  const date = taskDate
    ? `${taskDate.getFullYear()}-${padDatePart(taskDate.getMonth() + 1)}-${padDatePart(taskDate.getDate())}`
    : ''
  const params = new URLSearchParams({
    view: 'week',
    task: String(task?.id ?? ''),
  })

  if (date) {
    params.set('date', date)
  }

  return `${routes.tasks}?${params.toString()}`
}
