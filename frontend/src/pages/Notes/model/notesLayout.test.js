import { describe, expect, it } from 'vitest'
import { getNotesMainClassName } from './notesLayout'

describe('notes layout classes', () => {
  it('does not apply footer-visible class while reader is open', () => {
    expect(getNotesMainClassName({
      isFooterVisible: true,
      isReaderOpen: true,
    })).toBe('notes-page__main notes-page__main--reader-open')
  })

  it('applies footer-visible class when reader is closed', () => {
    expect(getNotesMainClassName({
      isFooterVisible: true,
      isReaderOpen: false,
    })).toBe('notes-page__main notes-page__main--footer-visible')
  })
})
