import { useMemo, useState } from 'react'
import {
  createChecklistClientId,
  createTaskPayloadFromForm,
  emptyTaskForm,
  getCurrentInputTime,
  getTodayInputDate,
  mapApiTaskToForm,
} from './taskForm'

export const useTaskModalController = ({ deleteTask, updateTask }) => {
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [taskForm, setTaskForm] = useState(emptyTaskForm)
  const [taskFormError, setTaskFormError] = useState('')
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  const minDate = useMemo(() => getTodayInputDate(), [])
  const minTime = taskForm.date === minDate ? getCurrentInputTime() : undefined
  const minDeadlineTime =
    taskForm.hasDeadline && taskForm.deadlineDate === minDate ? getCurrentInputTime() : undefined

  const openTaskModal = (task) => {
    setEditingTaskId(task.id)
    setTaskForm(mapApiTaskToForm(task))
    setTaskFormError('')
    setIsTaskModalOpen(true)
  }

  const closeTaskModal = () => {
    setEditingTaskId(null)
    setTaskForm(emptyTaskForm)
    setTaskFormError('')
    setIsTaskModalOpen(false)
  }

  const handleTaskFormChange = (field, value) => {
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
    setTaskFormError('')
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
    setTaskFormError('')
  }

  const handleChecklistItemChange = (clientId, field, value) => {
    setTaskForm((currentForm) => ({
      ...currentForm,
      checklistItems: currentForm.checklistItems.map((item) =>
        item.clientId === clientId ? { ...item, [field]: value } : item
      ),
    }))
    setTaskFormError('')
  }

  const handleRemoveChecklistItem = (clientId) => {
    setTaskForm((currentForm) => ({
      ...currentForm,
      checklistItems: currentForm.checklistItems.filter((item) => item.clientId !== clientId),
    }))
    setTaskFormError('')
  }

  const handleSaveTask = async (event) => {
    event.preventDefault()

    if (taskForm.checklistItems.some((item) => !item.title.trim())) {
      setTaskFormError('Заполните все пункты чек-листа или удалите пустые')
      return
    }

    if (!taskForm.title.trim()) {
      setTaskFormError('Введите название задачи')
      return
    }

    if (!taskForm.date) {
      setTaskFormError('Выберите дату задачи')
      return
    }

    if (taskForm.date < minDate) {
      setTaskFormError('Нельзя выбрать дату раньше текущей')
      return
    }

    if (taskForm.date === minDate && taskForm.time < getCurrentInputTime()) {
      setTaskFormError('Для текущего дня выберите время не раньше текущего')
      return
    }

    if (taskForm.hasDeadline && !taskForm.deadlineDate) {
      setTaskFormError('Выберите дату дедлайна')
      return
    }

    if (taskForm.hasDeadline && taskForm.deadlineDate < minDate) {
      setTaskFormError('Нельзя выбрать дедлайн раньше текущей даты')
      return
    }

    if (taskForm.hasDeadline && taskForm.deadlineDate === minDate && taskForm.deadlineTime < getCurrentInputTime()) {
      setTaskFormError('Для текущего дня выберите дедлайн не раньше текущего времени')
      return
    }

    try {
      await updateTask({
        id: editingTaskId,
        body: createTaskPayloadFromForm(taskForm),
      }).unwrap()
      closeTaskModal()
    } catch (err) {
      setTaskFormError(
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
      setTaskFormError(err.data?.detail || 'Не удалось удалить задачу')
    }
  }

  return {
    closeTaskModal,
    handleAddChecklistItem,
    handleChecklistItemChange,
    handleDeleteTask,
    handleRemoveChecklistItem,
    handleSaveTask,
    handleTaskFormChange,
    isTaskModalOpen,
    minDate,
    minDeadlineTime,
    minTime,
    openTaskModal,
    taskForm,
    taskFormError,
  }
}
