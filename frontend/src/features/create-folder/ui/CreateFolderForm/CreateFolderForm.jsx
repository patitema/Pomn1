import { useState } from 'react';
import { useCreateFolderMutation } from '../../../../shared/api/index.js';
import { Input, Button, Modal } from '../../../../shared/ui/index.js';
import './CreateFolderForm.css';

const CreateFolderForm = ({ isOpen, onClose, parentId = null }) => {
  const [createFolder] = useCreateFolderMutation();
  const [formData, setFormData] = useState({
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createFolder({ ...formData, parent: parentId }).unwrap();
      onClose();
      setFormData({ name: '' });
    } catch (err) {
      console.error('Failed to create folder:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ name: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Создать папку">
      <form className="create-folder-form" onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Название папки"
          value={formData.name}
          onChange={handleChange}
          required
        />
        
        <div className="create-folder-form__actions">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Создание...' : 'Создать'}
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

export default CreateFolderForm;
