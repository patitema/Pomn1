import { useState } from 'react';
import { useCreateNoteMutation } from '../../../../shared/api/index.js';
import { Input, Button, Modal } from '../../../../shared/ui/index.js';
import './CreateNoteForm.css';

const CreateNoteForm = ({ isOpen, onClose, parentId = null }) => {
  const [createNote] = useCreateNoteMutation();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createNote({ ...formData, parent: parentId }).unwrap();
      onClose();
      setFormData({ title: '', content: '' });
    } catch (err) {
      console.error('Failed to create note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Создать заметку">
      <form className="create-note-form" onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Заголовок"
          value={formData.title}
          onChange={handleChange('title')}
          required
        />
        
        <textarea
          className="create-note-form__textarea"
          placeholder="Содержимое заметки..."
          value={formData.content}
          onChange={handleChange('content')}
          rows={6}
          required
        />
        
        <div className="create-note-form__actions">
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

export default CreateNoteForm;
