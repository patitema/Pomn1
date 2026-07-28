import { describe, expect, it } from 'vitest'
import {
  CONNECTION_MODE,
  getConnectionEdgeDeleteRequest,
  getConnectionNodeAction,
  hasExistingConnection,
  isCurrentFolderPair,
  isValidConnectionTarget,
} from './notesConnection'

const sourceNote = { id: 1, is_folder: false, folder: null }
const linkedNote = { id: 2, is_folder: false, folder: null }
const folder = { id: 3, is_folder: true, folder: null }
const childNote = { id: 4, is_folder: false, folder: 3 }
const otherFolder = { id: 5, is_folder: true, folder: null }
const notes = [sourceNote, linkedNote, folder, childNote, otherFolder]

describe('notes connection model', () => {
  it('detects existing semantic connections in either direction', () => {
    const links = [{ id: 10, note_from: 1, note_to: 2 }]

    expect(hasExistingConnection(links, 1, 2)).toBe(true)
    expect(hasExistingConnection(links, 2, 1)).toBe(true)
    expect(hasExistingConnection(links, 1, 3)).toBe(false)
  })

  it('detects current note-folder relationships', () => {
    expect(isCurrentFolderPair(childNote, folder)).toBe(true)
    expect(isCurrentFolderPair(childNote, otherFolder)).toBe(false)
  })

  it('rejects invalid duplicate, self, and current-folder connection targets', () => {
    const links = [{ id: 10, note_from: 1, note_to: 2 }]

    expect(isValidConnectionTarget({ links, source: sourceNote, target: sourceNote })).toBe(false)
    expect(isValidConnectionTarget({ links, source: sourceNote, target: linkedNote })).toBe(false)
    expect(isValidConnectionTarget({ links, source: childNote, target: folder })).toBe(false)
  })

  it('accepts a new semantic connection target', () => {
    expect(isValidConnectionTarget({ links: [], source: sourceNote, target: linkedNote })).toBe(true)
  })

  it('picks a source node while choosing connection source', () => {
    expect(getConnectionNodeAction({
      connectionMode: CONNECTION_MODE.PICK_SOURCE,
      targetNote: sourceNote,
    })).toEqual({
      type: 'pick-source',
      sourceId: 1,
    })
  })

  it('assigns a note without a folder to the selected folder', () => {
    expect(getConnectionNodeAction({
      connectionMode: CONNECTION_MODE.PICK_TARGET,
      connectionSourceId: 1,
      notes,
      targetNote: folder,
    })).toEqual({
      type: 'assign-folder',
      noteId: 1,
      folderId: 3,
    })
  })

  it('cancels when selecting the current note-folder pair', () => {
    expect(getConnectionNodeAction({
      connectionMode: CONNECTION_MODE.PICK_TARGET,
      connectionSourceId: 4,
      notes,
      targetNote: folder,
    })).toEqual({ type: 'cancel' })
  })

  it('creates a semantic link for regular note targets', () => {
    expect(getConnectionNodeAction({
      connectionMode: CONNECTION_MODE.PICK_TARGET,
      connectionSourceId: 1,
      notes,
      targetNote: linkedNote,
    })).toEqual({
      type: 'create-link',
      noteFrom: 1,
      noteTo: 2,
    })
  })

  it('creates edge delete requests for folder and semantic edges', () => {
    expect(getConnectionEdgeDeleteRequest({ type: 'folder', noteId: 4 })).toEqual({
      type: 'clear-folder',
      noteId: 4,
    })
    expect(getConnectionEdgeDeleteRequest({ type: 'semantic', linkId: 10 })).toEqual({
      type: 'delete-link',
      linkId: 10,
    })
  })
})