import { useMemo, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import './TaskBoard.css'

const PRIORITY_LABELS = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
}

const TaskBoardDialog = ({ children, title, onClose }) => (
  <div className="task-board-dialog__overlay" role="presentation">
    <section className="task-board-dialog" role="dialog" aria-modal="true" aria-label={title}>
      <button className="task-board-dialog__close" type="button" onClick={onClose} aria-label="Закрыть">
        <CloseIcon fontSize="small" />
      </button>
      <h3>{title}</h3>
      {children}
    </section>
  </div>
)

const BoardTaskCard = ({ task, onEdit }) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: `board-task-${task.id}`,
    data: { taskId: task.id, columnId: task.boardColumnId },
  })
  const completedChecklistItems = task.checklistItems.filter((item) => item.isCompleted).length

  return (
    <article
      className={`task-board-card ${isDragging ? 'is-dragging' : ''}`}
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
    >
      <div className="task-board-card__header">
        <button
          className="task-board-card__drag"
          type="button"
          aria-label={`Переместить задачу ${task.title}`}
          {...attributes}
          {...listeners}
        >
          <DragIndicatorIcon fontSize="small" />
        </button>
        <button className="task-board-card__edit" type="button" onClick={() => onEdit(task)} aria-label="Редактировать задачу">
          <EditOutlinedIcon fontSize="small" />
        </button>
      </div>
      <strong>{task.title}</strong>
      {task.description && <p>{task.description}</p>}
      <div className="task-board-card__meta">
        <span className={`task-board-card__priority task-board-card__priority--${task.priority}`}>
          {PRIORITY_LABELS[task.priority] || task.priority}
        </span>
        {task.note && <span>{task.note}</span>}
        {task.checklistItems.length > 0 && (
          <span>{completedChecklistItems}/{task.checklistItems.length} в чек-листе</span>
        )}
      </div>
    </article>
  )
}

const BoardColumn = ({ column, tasks, isCollapsed, onCreateTask, onDelete, onEditTask, onRename, onToggleCollapsed }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `board-column-${column.id}`,
    data: { columnId: column.id },
  })

  return (
    <article className={`task-board-column ${isOver ? 'is-over' : ''} ${isCollapsed ? 'is-collapsed' : ''}`} ref={setNodeRef}>
      <header className="task-board-column__header">
        <div>
          <h3>{column.title}</h3>
          <span>{tasks.length}</span>
        </div>
        <div className="task-board-column__actions">
          <button
            type="button"
            onClick={() => onToggleCollapsed(column.id)}
            aria-label={`${isCollapsed ? 'Развернуть' : 'Свернуть'} колонку ${column.title}`}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowUpIcon fontSize="small" />}
          </button>
          <button type="button" onClick={() => onRename(column)} aria-label={`Переименовать колонку ${column.title}`}>
            <EditOutlinedIcon fontSize="small" />
          </button>
          <button type="button" onClick={() => onDelete(column)} aria-label={`Удалить колонку ${column.title}`}>
            <DeleteOutlineIcon fontSize="small" />
          </button>
        </div>
      </header>

      {!isCollapsed && (
        <>
          <div className="task-board-column__cards">
            {tasks.map((task) => (
              <BoardTaskCard key={task.id} task={task} onEdit={onEditTask} />
            ))}
            {tasks.length === 0 && <p className="task-board-column__empty">Перетащите задачу сюда</p>}
          </div>

          <button className="task-board-column__add" type="button" onClick={() => onCreateTask(column.id)}>
            + Добавить задачу
          </button>
        </>
      )}
    </article>
  )
}

export const TaskBoard = ({
  columns,
  tasks,
  regularTasks,
  isLoading,
  onCreateColumn,
  onRenameColumn,
  onDeleteColumn,
  onCreateTask,
  onEditTask,
  onImportTask,
  onMoveTask,
}) => {
  const [columnEditor, setColumnEditor] = useState(null)
  const [columnToDelete, setColumnToDelete] = useState(null)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importSearch, setImportSearch] = useState('')
  const [importTaskId, setImportTaskId] = useState('')
  const [importColumnId, setImportColumnId] = useState('')
  const [dialogError, setDialogError] = useState('')
  const [collapsedColumnIds, setCollapsedColumnIds] = useState(() => new Set())
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } })
  )

  const tasksByColumn = useMemo(() => {
    const grouped = columns.reduce((acc, column) => ({ ...acc, [column.id]: [] }), {})
    tasks.forEach((task) => {
      if (grouped[task.boardColumnId]) grouped[task.boardColumnId].push(task)
    })
    Object.values(grouped).forEach((columnTasks) => {
      columnTasks.sort((firstTask, secondTask) => {
        const positionDifference = (firstTask.boardPosition ?? 0) - (secondTask.boardPosition ?? 0)
        return positionDifference || String(firstTask.createdAt).localeCompare(String(secondTask.createdAt))
      })
    })
    return grouped
  }, [columns, tasks])

  const filteredRegularTasks = useMemo(() => {
    const query = importSearch.trim().toLowerCase()
    if (!query) return regularTasks
    return regularTasks.filter((task) => task.title.toLowerCase().includes(query))
  }, [importSearch, regularTasks])

  const toggleColumnCollapsed = (columnId) => {
    setCollapsedColumnIds((currentIds) => {
      const nextIds = new Set(currentIds)
      if (nextIds.has(columnId)) nextIds.delete(columnId)
      else nextIds.add(columnId)
      return nextIds
    })
  }
  const closeColumnEditor = () => {
    setColumnEditor(null)
    setDialogError('')
  }

  const submitColumn = async (event) => {
    event.preventDefault()
    const title = columnEditor.title.trim()
    if (!title) {
      setDialogError('Введите название колонки')
      return
    }
    try {
      if (columnEditor.id) {
        await onRenameColumn(columnEditor.id, title)
      } else {
        await onCreateColumn(title)
      }
      closeColumnEditor()
    } catch (error) {
      setDialogError(error?.data?.title?.[0] || 'Не удалось сохранить колонку')
    }
  }

  const deleteColumn = async (taskAction) => {
    try {
      await onDeleteColumn(columnToDelete.id, taskAction)
      setColumnToDelete(null)
      setDialogError('')
    } catch (error) {
      setDialogError(error?.data?.detail || 'Не удалось удалить колонку')
    }
  }

  const openImport = () => {
    setImportColumnId(columns[0] ? String(columns[0].id) : '')
    setImportTaskId('')
    setImportSearch('')
    setDialogError('')
    setIsImportOpen(true)
  }

  const submitImport = async (event) => {
    event.preventDefault()
    if (!importTaskId || !importColumnId) {
      setDialogError('Выберите задачу и колонку')
      return
    }
    try {
      await onImportTask(Number(importTaskId), Number(importColumnId))
      setImportTaskId('')
      setDialogError('')
      setIsImportOpen(false)
    } catch (error) {
      setDialogError(error?.data?.detail || 'Не удалось импортировать задачу')
    }
  }

  const handleDragEnd = async ({ active, over }) => {
    if (!over) return
    const taskId = active.data.current?.taskId
    const sourceColumnId = active.data.current?.columnId
    const targetColumnId = over.data.current?.columnId
    if (!taskId || !targetColumnId || sourceColumnId === targetColumnId) return
    try {
      await onMoveTask(taskId, targetColumnId)
    } catch (error) {
      setDialogError(error?.data?.detail || 'Не удалось переместить задачу')
    }
  }

  if (isLoading) {
    return <p className="task-board__loading">Загрузка доски...</p>
  }

  return (
    <section className="task-board" aria-label="Канбан-доска">
      {columns.length > 0 && (
        <div className="task-board__toolbar">
          <button type="button" onClick={() => setColumnEditor({ id: null, title: '' })}>
            Создать колонку
          </button>
          <button type="button" onClick={openImport}>
            Импортировать задачу
          </button>
        </div>
      )}

      {dialogError && !columnEditor && !columnToDelete && !isImportOpen && (
        <p className="task-board__error">{dialogError}</p>
      )}

      {columns.length === 0 ? (
        <div className="task-board__empty">
          <h3>Доска пока пустая</h3>
          <p>Создайте первую колонку и добавьте в неё задачи.</p>
          <button type="button" onClick={() => setColumnEditor({ id: null, title: '' })}>
            Создать колонку
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="task-board__columns">
            {columns.map((column) => (
              <BoardColumn
                column={column}
                isCollapsed={collapsedColumnIds.has(column.id)}
                key={column.id}
                tasks={tasksByColumn[column.id] || []}
                onCreateTask={onCreateTask}
                onDelete={setColumnToDelete}
                onEditTask={onEditTask}
                onRename={(targetColumn) => setColumnEditor({ id: targetColumn.id, title: targetColumn.title })}
                onToggleCollapsed={toggleColumnCollapsed}
              />
            ))}
          </div>
        </DndContext>
      )}

      {columnEditor && (
        <TaskBoardDialog title={columnEditor.id ? 'Переименовать колонку' : 'Новая колонка'} onClose={closeColumnEditor}>
          <form className="task-board-dialog__form" onSubmit={submitColumn}>
            <label>
              <span>Название</span>
              <input
                autoFocus
                maxLength={120}
                value={columnEditor.title}
                onChange={(event) => setColumnEditor((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            {dialogError && <p className="task-board-dialog__error">{dialogError}</p>}
            <div className="task-board-dialog__actions">
              <button type="button" onClick={closeColumnEditor}>Отмена</button>
              <button type="submit">Сохранить</button>
            </div>
          </form>
        </TaskBoardDialog>
      )}

      {columnToDelete && (
        <TaskBoardDialog title="Удалить колонку" onClose={() => setColumnToDelete(null)}>
          <p className="task-board-dialog__text">
            Колонка «{columnToDelete.title}» содержит {(tasksByColumn[columnToDelete.id] || []).length} задач.
          </p>
          <p className="task-board-dialog__text">Что сделать с задачами?</p>
          {dialogError && <p className="task-board-dialog__error">{dialogError}</p>}
          <div className="task-board-dialog__actions task-board-dialog__actions--stacked">
            {(tasksByColumn[columnToDelete.id] || []).length > 0 && (
              <button type="button" onClick={() => deleteColumn('detach')}>Удалить только колонку</button>
            )}
            <button className="is-danger" type="button" onClick={() => deleteColumn('delete')}>
              {(tasksByColumn[columnToDelete.id] || []).length > 0 ? 'Удалить колонку и задачи' : 'Удалить колонку'}
            </button>
            <button type="button" onClick={() => setColumnToDelete(null)}>Отмена</button>
          </div>
        </TaskBoardDialog>
      )}

      {isImportOpen && (
        <TaskBoardDialog title="Импортировать задачу" onClose={() => setIsImportOpen(false)}>
          <form className="task-board-dialog__form" onSubmit={submitImport}>
            <label>
              <span>Поиск</span>
              <input
                type="search"
                placeholder="Название задачи"
                value={importSearch}
                onChange={(event) => setImportSearch(event.target.value)}
              />
            </label>
            <label>
              <span>Задача</span>
              <select value={importTaskId} onChange={(event) => setImportTaskId(event.target.value)}>
                <option value="">Выберите задачу</option>
                {filteredRegularTasks.map((task) => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Колонка</span>
              <select value={importColumnId} onChange={(event) => setImportColumnId(event.target.value)}>
                {columns.map((column) => (
                  <option key={column.id} value={column.id}>{column.title}</option>
                ))}
              </select>
            </label>
            {filteredRegularTasks.length === 0 && <p className="task-board-dialog__text">Подходящих обычных задач нет.</p>}
            {dialogError && <p className="task-board-dialog__error">{dialogError}</p>}
            <div className="task-board-dialog__actions">
              <button type="button" onClick={() => setIsImportOpen(false)}>Отмена</button>
              <button type="submit" disabled={filteredRegularTasks.length === 0}>Импортировать</button>
            </div>
          </form>
        </TaskBoardDialog>
      )}
    </section>
  )
}