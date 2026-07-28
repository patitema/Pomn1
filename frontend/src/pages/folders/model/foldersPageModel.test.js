import { describe, expect, it } from 'vitest'
import {
  createNoteMoveRequest,
  getTargetFolderId,
  toggleSetValue,
  updateFolderFiltersField,
} from './foldersPageModel'

const notes = [
  { id: 1, is_folder: false, folder: null },
  { id: 2, is_folder: true, folder: null },
  { id: 3, is_folder: false, folder: 2 },
  { id: 4, is_folder: false, folder: null },
]

const regularNotes = notes.filter((note) => !note.is_folder)

describe('folders page model', () => {
  it('maps the root drop target to an empty folder id', () => {
    expect(getTargetFolderId('root')).toBeNull()
  })

  it('maps a folder drop target to a numeric folder id', () => {
    expect(getTargetFolderId('2')).toBe(2)
  })

  it('toggles a value into and out of a set without mutating the original set', () => {
    const currentSet = new Set([1])
    const withSecondValue = toggleSetValue(currentSet, 2)
    const withoutFirstValue = toggleSetValue(currentSet, 1)

    expect([...withSecondValue]).toEqual([1, 2])
    expect([...withoutFirstValue]).toEqual([])
    expect([...currentSet]).toEqual([1])
  })

  it('updates one folder filter field without mutating current filters', () => {
    const currentFilters = {
      search: '',
      itemType: 'all',
      taskState: 'all',
    }

    const nextFilters = updateFolderFiltersField(currentFilters, 'search', 'note')

    expect(nextFilters).toEqual({
      search: 'note',
      itemType: 'all',
      taskState: 'all',
    })
    expect(currentFilters.search).toBe('')
  })

  it('creates an update request when a regular note moves to a real folder', () => {
    expect(createNoteMoveRequest({
      activeId: '1',
      overId: '2',
      regularNotes,
      notes,
    })).toEqual({
      id: 1,
      body: { folder_id: 2 },
    })
  })

  it('creates an update request when a note moves to root', () => {
    expect(createNoteMoveRequest({
      activeId: '3',
      overId: 'root',
      regularNotes,
      notes,
    })).toEqual({
      id: 3,
      body: { folder_id: null },
    })
  })

  it('ignores drops without a target or without a movable note', () => {
    expect(createNoteMoveRequest({ activeId: '1', overId: null, regularNotes, notes })).toBeNull()
    expect(createNoteMoveRequest({ activeId: '2', overId: 'root', regularNotes, notes })).toBeNull()
  })

  it('ignores invalid folder targets, self targets, and unchanged folders', () => {
    expect(createNoteMoveRequest({ activeId: '1', overId: '404', regularNotes, notes })).toBeNull()
    expect(createNoteMoveRequest({ activeId: '2', overId: '2', regularNotes, notes })).toBeNull()
    expect(createNoteMoveRequest({ activeId: '3', overId: '2', regularNotes, notes })).toBeNull()
  })
})
