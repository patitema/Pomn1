import { useEffect, useState } from 'react';
import { useUpdateFolderMutation } from '@shared/api';
import { Input, Button, Modal } from '@shared/ui';
import './EditFolderModal.css';

const EditFolderModal = ({ folder, isOpen, onClose, onUpdated }) => {
  const [updateFolder] = useUpdateFolderMutation();
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (folder) {
      setTitle(folder.title || '');
    }
  }, [folder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedFolder = await updateFolder({
        id: folder.id,
        body: { title: title.trim() },
      }).unwrap();
      onUpdated?.(updatedFolder);
      onClose();
    } catch (err) {
      console.error('Failed to update folder:', err);
      alert('Не удалось обновить папку.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !folder) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактировать папку">
      <form className="edit-folder-modal" onSubmit={handleSubmit}>
        <Input
          label="Название папки"
          type="text"
          placeholder="Название папки"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="edit-folder-modal__actions">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Применить'}
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditFolderModal;
