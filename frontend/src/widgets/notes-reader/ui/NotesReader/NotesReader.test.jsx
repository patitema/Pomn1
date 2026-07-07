import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import NotesReader from './NotesReader'

vi.mock('@shared/ui/LazyMarkdownViewer', () => ({
  LazyMarkdownViewer: ({ content }) => <div data-testid="markdown-viewer">{content}</div>,
}))

vi.mock('@features/linked-task-actions', () => ({
  LinkedTaskActions: ({ task }) => <div data-testid="linked-task">{task.title}</div>,
}))

const regularNote = { id: 1, title: 'Заяц', text: 'Текст заметки', is_folder: false }
const otherNote = { id: 2, title: 'Другая', text: 'Другая заметка', is_folder: false }
const folder = { id: 3, title: 'Папка', is_folder: true }
const tasks = [
  { id: 10, title: 'Первая задача', note: 1 },
  { id: 11, title: 'Вторая задача', note: 1 },
  { id: 12, title: 'Чужая задача', note: 2 },
]

describe('NotesReader', () => {
  it('shows content and task tabs for a regular note', () => {
    render(<NotesReader selectedNote={regularNote} tasks={tasks} />)

    expect(screen.getByRole('tab', { name: 'Содержание' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Задачи · 2' })).toBeTruthy()
    expect(screen.getByTestId('markdown-viewer').textContent).toBe('Текст заметки')
  })

  it('shows all tasks linked to the selected note in the tasks tab', async () => {
    render(<NotesReader selectedNote={regularNote} tasks={tasks} />)

    await userEvent.click(screen.getByRole('tab', { name: 'Задачи · 2' }))

    expect(screen.getByText('Первая задача')).toBeTruthy()
    expect(screen.getByText('Вторая задача')).toBeTruthy()
    expect(screen.queryByText('Чужая задача')).toBeNull()
  })

  it('does not show task tabs for folders', () => {
    render(<NotesReader selectedNote={folder} notes={[regularNote]} tasks={tasks} />)

    expect(screen.queryByRole('tab', { name: /Задачи/ })).toBeNull()
    expect(screen.getByText('Заметки в папке')).toBeTruthy()
  })

  it('resets to content when selected note changes', async () => {
    const { rerender } = render(<NotesReader selectedNote={regularNote} tasks={tasks} />)

    await userEvent.click(screen.getByRole('tab', { name: 'Задачи · 2' }))
    rerender(<NotesReader selectedNote={otherNote} tasks={tasks} />)

    expect(screen.getByTestId('markdown-viewer').textContent).toBe('Другая заметка')
  })
})
