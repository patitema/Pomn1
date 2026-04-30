import { useDeleteNoteMutation } from '@shared/api';
import { Button } from '@shared/ui';
import './DeleteNoteButton.css';

const DeleteNoteButton = ({ noteId, onSuccess, variant = 'icon' }) => {
  const [deleteNote, { isLoading }] = useDeleteNoteMutation();

  const handleClick = async () => {
    if (window.confirm('Удалить эту заметку?')) {
      try {
        await deleteNote(noteId).unwrap();
        onSuccess?.();
      } catch (err) {
        console.error('Failed to delete note:', err);
        alert('Не удалось удалить заметку.');
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
        Delete
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
