import { useState, useEffect } from 'react';
import { useUpdateFolderMutation } from '../../../../shared/api/index.js';
import { Input, Button, Modal } from '../../../../shared/ui/index.js';
import './EditFolderModal.css';

const EditFolderModal = ({ folder, isOpen, onClose }) => {
  const [updateFolder] = useUpdateFolderMutation();
  const [formData, setFormData] = useState({
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (folder) {
      setFormData({
        name: folder.name || '',
      });
    }
  }, [folder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateFolder({ id: folder.id, body: formData }).unwrap();
      onClose();
    } catch (err) {
      console.error('Failed to update folder:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ name: e.target.value });
  };

  if (!isOpen || !folder) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактировать папку">
      <form className="edit-folder-modal" onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Название папки"
          value={formData.name}
          onChange={handleChange}
          required
        />
        
        <div className="edit-folder-modal__actions">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
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
