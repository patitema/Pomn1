import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { selectUser } from '@entities/user'
import {
  useCreateTaskMutation,
  useCreateTaskBoardColumnMutation,
  useDeleteTaskMutation,
  useDeleteTaskBoardColumnMutation,
  useGetNotesQuery,
  useGetTaskBoardColumnsQuery,
  useGetTasksQuery,
  useMoveTaskToBoardColumnMutation,
  useUpdateTaskMutation,
  useUpdateTaskBoardColumnMutation,
} from '@shared/api'
import {
  addDays,
  addMonthsClamped,
  buildCalendarDays,
  buildDueDate,
  buildNoteTitlesById,
  buildTaskFilterParams,
  buildWeekDays,
  createChecklistClientId,
  createTaskFromForm,
  buildTasksSummary,
  emptyTaskFilters,
  emptyTaskForm,
  formatMonthLabel,
  formatWeekLabel,
  getCurrentInputTime,
  getTodayInputDate,
  groupTasksByDate,
  isSameDate,
  mapApiTasksToDisplay,
  normalizeDate,
  parseInputDate,
  selectAllViewTasks,
  sortTasksChronologically,
  taskDateToDate,
  toInputDate,
} from './tasksPageModel'

export const useTasksPageModel = () => {
  const user = useSelector(selectUser)
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState('week')
  const { data: apiTasks = [], isLoading: tasksLoading } = useGetTasksQuery({ scope: 'regular' })
  const { data: boardApiTasks = [], isLoading: boardTasksLoading } = useGetTasksQuery(
    { scope: 'board' },
    { skip: view !== 'board' }
  )
  const { data: boardColumns = [], isLoading: boardColumnsLoading } = useGetTaskBoardColumnsQuery(undefined, {
    skip: view !== 'board',
  })
  const { data: notes = [], isLoading: notesLoading } = useGetNotesQuery({ is_folder: false })
  const [createTask] = useCreateTaskMutation()
  const [updateTask] = useUpdateTaskMutation()
  const [deleteTask] = useDeleteTaskMutation()
  const [createTaskBoardColumn] = useCreateTaskBoardColumnMutation()
  const [updateTaskBoardColumn] = useUpdateTaskBoardColumnMutation()
  const [deleteTaskBoardColumn] = useDeleteTaskBoardColumnMutation()
  const [moveTaskToBoardColumn] = useMoveTaskToBoardColumnMutation()
  const [focusedDate, setFocusedDate] = useState(() => normalizeDate(new Date()))
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [taskForm, setTaskForm] = useState(emptyTaskForm)
  const [taskFilters, setTaskFilters] = useState(emptyTaskFilters)
  const [formError, setFormError] = useState('')
  const taskFilterParams = useMemo(() => buildTaskFilterParams(taskFilters), [taskFilters])
  const hasTaskFilters = Object.keys(taskFilterParams).length > 0
  const { data: filteredApiTasks = [], isFetching: filteredTasksFetching } = useGetTasksQuery({ ...taskFilterParams, scope: 'regular' }, {
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
  const minTime = !taskForm.isAllDay && taskForm.date === minDate ? getCurrentInputTime() : undefined
  const minDeadlineTime =
    taskForm.hasDeadline && taskForm.deadlineDate === minDate ? getCurrentInputTime() : undefined

  const weekDays = useMemo(() => buildWeekDays(focusedDate), [focusedDate])
  const calendarDays = useMemo(() => buildCalendarDays(focusedDate), [focusedDate])
  const weekPeriodLabel = useMemo(() => formatWeekLabel(weekDays), [weekDays])
  const calendarPeriodLabel = useMemo(() => formatMonthLabel(focusedDate), [focusedDate])
  const noteOptions = useMemo(() => notes.filter((note) => !note.is_folder), [notes])
  const noteTitlesById = useMemo(() => buildNoteTitlesById(noteOptions), [noteOptions])
  const tasks = useMemo(() => mapApiTasksToDisplay(apiTasks, noteTitlesById), [apiTasks, noteTitlesById])
  const boardTasks = useMemo(
    () => mapApiTasksToDisplay(boardApiTasks, noteTitlesById),
    [boardApiTasks, noteTitlesById]
  )
  const filteredTasks = useMemo(
    () => mapApiTasksToDisplay(filteredApiTasks, noteTitlesById),
    [filteredApiTasks, noteTitlesById]
  )

  const tasksByDate = useMemo(() => groupTasksByDate(tasks), [tasks])
  const summary = useMemo(() => buildTasksSummary(tasks), [tasks])
  const sortedTasks = useMemo(() => sortTasksChronologically(tasks), [tasks])
  const sortedFilteredTasks = useMemo(() => sortTasksChronologically(filteredTasks), [filteredTasks])
  const allViewTasks = selectAllViewTasks({ hasTaskFilters, sortedFilteredTasks, sortedTasks })

  const handleViewChange = (nextView) => {
    setView(nextView)
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('view', nextView)
    setSearchParams(nextSearchParams, { replace: true })
  }

  useEffect(() => {
    const targetView = searchParams.get('view')
    const targetDate = parseInputDate(searchParams.get('date'))

    if (['week', 'all', 'calendar', 'board'].includes(targetView)) {
      setView(targetView)
    }

    if (targetDate) {
      setFocusedDate((currentDate) => (isSameDate(currentDate, targetDate) ? currentDate : targetDate))
    }
  }, [searchParams])

  const openCreateModal = (date = '', boardColumnId = null) => {
    const selectedDate = toInputDate(date)

    setEditingTaskId(null)
    setTaskForm({
      ...emptyTaskForm,
      date: selectedDate,
      time: selectedDate === minDate ? getCurrentInputTime() : emptyTaskForm.time,
      boardColumnId,
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
      isAllDay: task.isAllDay,
      hasDeadline: task.hasDeadline,
      date: toInputDate(task.date),
      time: task.time,
      deadlineDate: task.hasDeadline ? toInputDate(task.deadlineDate) : '',
      deadlineTime: task.hasDeadline ? task.deadlineTime : emptyTaskForm.deadlineTime,
      priority: task.priority,
      status: task.status,
      note: task.noteId ? String(task.noteId) : '',
      boardColumnId: task.boardColumnId,
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
      ...(field === 'date' && !value ? { isAllDay: false } : {}),
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

    if (taskForm.date && taskForm.date < minDate) {
      setFormError('Нельзя выбрать дату раньше текущей')
      return
    }

    if (taskForm.date && !taskForm.isAllDay && taskForm.date === minDate && taskForm.time < getCurrentInputTime()) {
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

  const handleCreateBoardColumn = (title) => createTaskBoardColumn({ title }).unwrap()

  const handleRenameBoardColumn = (id, title) =>
    updateTaskBoardColumn({ id, body: { title } }).unwrap()

  const handleDeleteBoardColumn = (id, taskAction) =>
    deleteTaskBoardColumn({ id, taskAction }).unwrap()

  const handleMoveTaskToBoardColumn = (taskId, columnId) =>
    moveTaskToBoardColumn({ taskId, columnId }).unwrap()

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

    if (
      !draggedTask ||
      (!draggedTask.isAllDay && targetInputDate === minDate && draggedTask.time < getCurrentInputTime())
    ) {
      return
    }

    if (draggedTask.date === targetDate) return

    try {
      await updateTask({
        id: taskId,
        body: {
          due_date: buildDueDate(targetInputDate, draggedTask.time, draggedTask.isAllDay),
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
    handleViewChange('week')
  }


  return {
    allViewTasks,
    boardColumns,
    boardColumnsLoading,
    boardTasks,
    boardTasksLoading,
    calendarDays,
    calendarPeriodLabel,
    closeTaskModal,
    editingTaskId,
    filteredTasksFetching,
    formError,
    handleAddChecklistItem,
    handleCalendarDateSelect,
    handleChecklistItemChange,
    handleCompleteTask,
    handleCreateBoardColumn,
    handleDeleteBoardColumn,
    handleDeleteTask,
    handleDragEnd,
    handleFilterChange,
    handleFormChange,
    handleMoveTaskToBoardColumn,
    handleNextMonth,
    handleNextWeek,
    handlePreviousMonth,
    handlePreviousWeek,
    handleRemoveChecklistItem,
    handleRemoveTask,
    handleRenameBoardColumn,
    handleRestoreTask,
    handleSaveTask,
    handleViewChange,
    hasTaskFilters,
    isModalOpen,
    minDate,
    minDeadlineTime,
    minTime,
    noteOptions,
    notesLoading,
    openCreateModal,
    openEditModal,
    resetTaskFilters,
    sensors,
    summary,
    taskFilters,
    taskForm,
    tasks,
    tasksByDate,
    tasksLoading,
    user,
    view,
    weekDays,
    weekPeriodLabel,
  }
}
