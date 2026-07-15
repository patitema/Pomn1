import { describe, expect, it } from 'vitest'
import { getTaskPreviewLabel } from './helpers'

describe('getTaskPreviewLabel', () => {
  it('does not render midnight for an all-day task', () => {
    const label = getTaskPreviewLabel({
      title: 'All day task',
      due_date: '2026-07-12T00:00:00Z',
      is_all_day: true,
    })

    expect(label).toContain('Весь день')
    expect(label).not.toContain('00:00')
  })
})
