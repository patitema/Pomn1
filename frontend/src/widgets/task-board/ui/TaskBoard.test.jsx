import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaskBoard } from './TaskBoard'

const baseProps = {
  columns: [],
  tasks: [],
  regularTasks: [],
  isLoading: false,
  onCreateColumn: vi.fn(),
  onRenameColumn: vi.fn(),
  onDeleteColumn: vi.fn(),
  onCreateTask: vi.fn(),
  onEditTask: vi.fn(),
  onImportTask: vi.fn(),
  onMoveTask: vi.fn(),
}

describe('TaskBoard', () => {
  it('starts empty and creates the first user column', async () => {
    const onCreateColumn = vi.fn().mockResolvedValue({})
    render(<TaskBoard {...baseProps} onCreateColumn={onCreateColumn} />)

    expect(screen.getByText('Доска пока пустая')).toBeTruthy()
    await userEvent.click(screen.getAllByRole('button', { name: 'Создать колонку' })[0])
    await userEvent.type(screen.getByLabelText('Название'), 'Идеи')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(onCreateColumn).toHaveBeenCalledWith('Идеи')
  })

  it('offers deleting tasks or detaching them from a non-empty column', async () => {
    render(
      <TaskBoard
        {...baseProps}
        columns={[{ id: 1, title: 'Идеи', position: 0 }]}
        tasks={[
          {
            id: 10,
            title: 'Карточка',
            description: '',
            priority: 'low',
            note: '',
            checklistItems: [],
            boardColumnId: 1,
            boardPosition: 0,
            createdAt: '2026-07-16T00:00:00Z',
          },
        ]}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Удалить колонку Идеи' }))

    expect(screen.getByRole('button', { name: 'Удалить только колонку' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Удалить колонку и задачи' })).toBeTruthy()
  })
  it('collapses and expands a column', async () => {
    render(
      <TaskBoard
        {...baseProps}
        columns={[{ id: 1, title: 'Идеи', position: 0 }]}
      />
    )

    expect(screen.getByText('Перетащите задачу сюда')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Свернуть колонку Идеи' }))
    expect(screen.queryByText('Перетащите задачу сюда')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Развернуть колонку Идеи' }))
    expect(screen.getByText('Перетащите задачу сюда')).toBeTruthy()
  })
})
