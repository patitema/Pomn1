import { useEffect, useState } from 'react'
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { TaskModal } from '@features/manage-task'
import { Footer } from '@widgets/footer'
import { TaskBoard } from '@widgets/task-board'
import { PRIORITIES, STATUSES, WEEKDAY_LABELS, toInputDate } from './model/tasksPageModel'
import { useTasksPageModel } from './model/useTasksPageModel'
import './TasksPage.css'

const TasksPage = () => {
  document.title = 'POMNI - TASKS'

  const {
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
  } = useTasksPageModel()

  return (
    <div className="page-container tasks-page">
      <div className="tasks-page__inner">
        <header className="tasks-page__brand">
          <h1>POMNI</h1>
          <h2>{user ? user.username : 'BASE NAME'} BASE</h2>
        </header>

        <main className="tasks-page__content">
          <section className="tasks-page__topbar">
            <div className="tasks-page__heading">
              <h2>Задачи</h2>
              <div className="tasks-view-toggle" aria-label="Переключение вида задач">
                <button
                  className={`tasks-view-toggle__button ${view === 'week' ? 'active' : ''}`}
                  type="button"
                  onClick={() => handleViewChange('week')}
                >
                  Неделя
                </button>
                <button
                  className={`tasks-view-toggle__button ${view === 'all' ? 'active' : ''}`}
                  type="button"
                  onClick={() => handleViewChange('all')}
                >
                  Все задачи
                </button>
                <button
                  className={`tasks-view-toggle__button ${view === 'calendar' ? 'active' : ''}`}
                  type="button"
                  onClick={() => handleViewChange('calendar')}
                >
                  Календарь
                </button>
                <button
                  className={`tasks-view-toggle__button ${view === 'board' ? 'active' : ''}`}
                  type="button"
                  onClick={() => handleViewChange('board')}
                >
                  Доска
                </button>
              </div>
            </div>

            {view !== 'board' && (
              <button className="tasks-create-button" type="button" onClick={() => openCreateModal()}>
                Новая задача
              </button>
            )}
          </section>

          {notesLoading || (view === 'board' ? boardTasksLoading || boardColumnsLoading : tasksLoading) ? (
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
          ) : view === 'calendar' ? (
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
          ) : (
            <TaskBoard
              columns={boardColumns}
              tasks={boardTasks}
              regularTasks={tasks}
              isLoading={boardTasksLoading || boardColumnsLoading}
              onCreateColumn={handleCreateBoardColumn}
              onRenameColumn={handleRenameBoardColumn}
              onDeleteColumn={handleDeleteBoardColumn}
              onCreateTask={(columnId) => openCreateModal('', columnId)}
              onEditTask={openEditModal}
              onImportTask={handleMoveTaskToBoardColumn}
              onMoveTask={handleMoveTaskToBoardColumn}
            />
          )}
        </main>
      </div>

      {isModalOpen && (
        <TaskModal
          taskForm={taskForm}
          isEditing={Boolean(editingTaskId)}
          isBoardTask={Boolean(taskForm.boardColumnId)}
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
              <span>{task.date || 'Без даты'}</span>
              <strong>{task.date ? (task.isAllDay ? 'Весь день' : task.time) : 'Не запланировано'}</strong>
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
      <span className="tasks-card__time">{task.isAllDay ? 'Весь день' : task.time}</span>
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
