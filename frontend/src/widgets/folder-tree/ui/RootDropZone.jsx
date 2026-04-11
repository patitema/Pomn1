import React from 'react'
import { useDroppable } from '@dnd-kit/core'

export function RootDropZone({ children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'root',
  })

  const style = {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    backgroundColor: isOver ? '#333' : 'transparent',
    minHeight: '100px',
    borderRadius: '5px',
    transition: 'background-color 0.2s ease',
    width: '60vw',
  }

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  )
}

export default RootDropZone
