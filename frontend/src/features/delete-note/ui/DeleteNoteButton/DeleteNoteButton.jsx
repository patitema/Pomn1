import { useDeleteNoteMutation } from '../../../../shared/api/index.js';
import { Button } from '../../../../shared/ui/index.js';
import './DeleteNoteButton.css';

const DeleteNoteButton = ({ noteId, onSuccess, variant = 'icon' }) => {
  const [deleteNote, { isLoading }] = useDeleteNoteMutation();

  const handleClick = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту заметку?')) {
      try {
        await deleteNote(noteId).unwrap();
        onSuccess?.();
      } catch (err) {
        console.error('Failed to delete note:', err);
        alert('Ошибка при удалении заметки');
      }
    }
  };

  if (variant === 'icon') {
    return (
      <button 
        className="delete-note-button delete-note-button--icon"
        onClick={handleClick}
        disabled={isLoading}
      >
        🗑️
      </button>
    );
  }

  return (
    <Button 
      variant="danger" 
      onClick={handleClick} 
      disabled={isLoading}
    >
      {isLoading ? 'Удаление...' : 'Удалить'}
    </Button>
  );
};

export default DeleteNoteButton;
