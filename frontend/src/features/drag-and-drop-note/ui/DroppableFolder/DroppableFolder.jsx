import { useDroppable } from '@dnd-kit/core';
import { FolderCard } from '../../../entities/folder/index.js';
import './DroppableFolder.css';

const DroppableFolder = ({ folder, onEdit, onDelete }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `folder-${folder.id}`,
    data: { type: 'folder', folder },
  });

  return (
    <div 
      ref={setNodeRef}
      className={`droppable-folder ${isOver ? 'droppable-folder--over' : ''}`}
    >
      <FolderCard 
        folder={folder} 
        onEdit={onEdit} 
        onDelete={onDelete}
      />
    </div>
  );
};

export default DroppableFolder;
