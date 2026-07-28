import { describe, expect, it } from 'vitest'
import {
  addMonthsClamped,
  buildCalendarDays,
  buildNoteTitlesById,
  buildTaskFilterParams,
  buildTasksSummary,
  buildWeekDays,
  createTaskFromForm,
  emptyTaskFilters,
  emptyTaskForm,
  formatMonthLabel,
  formatWeekLabel,
  groupTasksByDate,
  mapApiTasksToDisplay,
  parseInputDate,
  selectAllViewTasks,
  sortTasksChronologically,
  toInputDate,
} from './tasksPageModel'

describe('tasks page model', () => {
  it('builds a Monday-start week for a focused Sunday', () => {
    const days = buildWeekDays(new Date(2026, 6, 12))

    expect(days.map((day) => day.key)).toEqual([
      '2026-07-06',
      '2026-07-07',
      '2026-07-08',
      '2026-07-09',
      '2026-07-10',
      '2026-07-11',
      '2026-07-12',
    ])
  })

  it('builds a full calendar grid with leading and trailing days', () => {
    const days = buildCalendarDays(new Date(2026, 1, 1))

    expect(days).toHaveLength(35)
    expect(days[0]).toMatchObject({ day: 26, date: '26.01.2026', muted: true })
    expect(days[6]).toMatchObject({ day: 1, date: '01.02.2026', muted: false })
    expect(days[34]).toMatchObject({ day: 1, date: '01.03.2026', muted: true })
  })

  it('parses only valid input dates', () => {
    expect(parseInputDate('2026-07-28')).toEqual(new Date(2026, 6, 28))
    expect(parseInputDate('2026-02-31')).toBeNull()
    expect(parseInputDate('28.07.2026')).toBeNull()
  })

  it('formats month and week period labels', () => {
    const days = buildWeekDays(new Date(2026, 6, 28))

    expect(formatMonthLabel(new Date(2026, 6, 1))).toBe('июль 2026')
    expect(formatWeekLabel(days)).toBe('27 июля - 2 августа 2026')
  })

  it('clamps month navigation to the last target month day', () => {
    expect(addMonthsClamped(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 28))
  })

  it('converts display dates to input dates without changing input dates', () => {
    expect(toInputDate('28.07.2026')).toBe('2026-07-28')
    expect(toInputDate('2026-07-28')).toBe('2026-07-28')
    expect(toInputDate('')).toBe('')
  })

  it('omits empty task filter params', () => {
    expect(buildTaskFilterParams({
      ...emptyTaskFilters,
      search: '  проект ',
      status: 'done',
      note: '12',
    })).toEqual({
      search: 'проект',
      status: 'done',
      note_id: '12',
    })
  })

  it('maps API tasks to display tasks including board fields and unscheduled dates', () => {
    const tasks = mapApiTasksToDisplay([
      {
        id: 7,
        title: 'Board task',
        description: null,
        checklist_items: [{ id: 3, title: 'Step', is_completed: true, position: 0 }],
        is_all_day: false,
        due_date: null,
        deadline: null,
        priority: 'medium',
        status: 'planned',
        note: 5,
        board_column: { id: 2 },
        board_position: 4,
        created_at: '2026-07-28T09:00:00Z',
        updated_at: '2026-07-28T10:00:00Z',
      },
    ], { 5: 'Note title' })

    expect(tasks[0]).toMatchObject({
      id: 7,
      description: '',
      date: '',
      deadlineLabel: 'Без дедлайна',
      note: 'Note title',
      noteId: 5,
      boardColumnId: 2,
      boardPosition: 4,
    })
    expect(tasks[0].checklistItems[0]).toMatchObject({ clientId: '3', isCompleted: true })
  })

  it('sorts scheduled tasks chronologically with all-day first', () => {
    const sorted = sortTasksChronologically([
      { id: 1, date: '28.07.2026', time: '13:00', isAllDay: false, createdAt: 'b' },
      { id: 2, date: '27.07.2026', time: '18:00', isAllDay: false, createdAt: 'a' },
      { id: 3, date: '28.07.2026', time: '09:00', isAllDay: true, createdAt: 'c' },
      { id: 4, date: '28.07.2026', time: '09:00', isAllDay: false, createdAt: 'd' },
    ])

    expect(sorted.map((task) => task.id)).toEqual([2, 3, 4, 1])
  })

  it('keeps board column id in task payloads', () => {
    expect(createTaskFromForm({
      ...emptyTaskForm,
      title: 'Board only',
      boardColumnId: '9',
    })).toMatchObject({
      due_date: null,
      is_all_day: false,
      board_column_id: 9,
    })
  })

  it('builds note title maps for display task mapping', () => {
    expect(buildNoteTitlesById([
      { id: 1, title: 'First' },
      { id: 2, title: 'Second' },
    ])).toEqual({ 1: 'First', 2: 'Second' })
  })

  it('groups dated tasks and sorts all-day tasks first inside a day', () => {
    const grouped = groupTasksByDate([
      { id: 1, date: '28.07.2026', time: '14:00', isAllDay: false },
      { id: 2, date: '', time: '09:00', isAllDay: false },
      { id: 3, date: '28.07.2026', time: '09:00', isAllDay: true },
      { id: 4, date: '28.07.2026', time: '10:00', isAllDay: false },
    ])

    expect(Object.keys(grouped)).toEqual(['28.07.2026'])
    expect(grouped['28.07.2026'].map((task) => task.id)).toEqual([3, 4, 1])
  })

  it('builds task summary counters', () => {
    expect(buildTasksSummary([
      { status: 'planned' },
      { status: 'in-progress' },
      { status: 'done' },
      { status: 'done' },
    ])).toEqual({ total: 4, inProgress: 1, done: 2 })
  })

  it('selects filtered tasks only when filters are active', () => {
    const sortedTasks = [{ id: 1 }]
    const sortedFilteredTasks = [{ id: 2 }]

    expect(selectAllViewTasks({ hasTaskFilters: false, sortedFilteredTasks, sortedTasks })).toBe(sortedTasks)
    expect(selectAllViewTasks({ hasTaskFilters: true, sortedFilteredTasks, sortedTasks })).toBe(sortedFilteredTasks)
  })
})
