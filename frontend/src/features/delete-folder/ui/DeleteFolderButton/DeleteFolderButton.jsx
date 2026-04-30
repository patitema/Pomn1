import { useDeleteFolderMutation } from '@shared/api';
import { Button } from '@shared/ui';
import './DeleteFolderButton.css';

const DeleteFolderButton = ({ folderId, onSuccess, variant = 'icon' }) => {
  const [deleteFolder, { isLoading }] = useDeleteFolderMutation();

  const handleClick = async () => {
    if (window.confirm('Удалить эту папку?')) {
      try {
        await deleteFolder(folderId).unwrap();
        onSuccess?.();
      } catch (err) {
        console.error('Failed to delete folder:', err);
        alert('Не удалось удалить папку.');
      }
    }
  };

  if (variant === 'icon') {
    return (
      <button
        className="delete-folder-button delete-folder-button--icon"
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

export default DeleteFolderButton;
