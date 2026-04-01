import { useDroppable } from '@dnd-kit/core';
import { useUpdateNoteMutation } from '@shared/api';
import { FolderCard } from '@entities/folder';
import './DroppableFolder.css';

const DroppableFolder = ({ folder, onEdit, onDelete }) => {
  const [updateNote] = useUpdateNoteMutation();
  const { isOver, setNodeRef } = useDroppable({
    id: `folder-${folder.id}`,
    data: { type: 'folder', folder },
  });

  const handleDrop = async (note) => {
    try {
      await updateNote({ 
        id: note.id, 
        body: { parent: folder.id } 
      }).unwrap();
    } catch (err) {
      console.error('Failed to move note:', err);
    }
  };

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
