import { describe, expect, it } from 'vitest'
import { createTaskPayloadFromForm, emptyTaskForm, mapApiTaskToForm } from './taskForm'

describe('all-day task form mapping', () => {
  it('adds the all-day flag and ignores the selected time', () => {
    const payload = createTaskPayloadFromForm({
      ...emptyTaskForm,
      title: 'All day task',
      date: '2026-07-12',
      time: '18:30',
      isAllDay: true,
    })

    expect(payload.is_all_day).toBe(true)
    expect(payload.due_date).toBe(new Date('2026-07-12T00:00:00').toISOString())
  })

  it('restores the all-day flag while editing', () => {
    const form = mapApiTaskToForm({
      title: 'All day task',
      due_date: '2026-07-12T00:00:00Z',
      is_all_day: true,
      checklist_items: [],
    })

    expect(form.isAllDay).toBe(true)
  })
  it('creates an unscheduled task without an invalid date', () => {
    const payload = createTaskPayloadFromForm({
      ...emptyTaskForm,
      title: 'Unscheduled task',
      date: '',
      isAllDay: true,
    })

    expect(payload.due_date).toBeNull()
    expect(payload.is_all_day).toBe(false)
  })
})
