import { useState, useEffect } from 'react';
import { useUpdateNoteMutation } from '../../../shared/api';
import { Input, Button, Modal } from '../../../shared/ui';
import './EditNoteModal.css';

const EditNoteModal = ({ note, isOpen, onClose }) => {
  const [updateNote] = useUpdateNoteMutation();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
      });
    }
  }, [note]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateNote({ id: note.id, body: formData }).unwrap();
      onClose();
    } catch (err) {
      console.error('Failed to update note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  if (!isOpen || !note) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактировать заметку">
      <form className="edit-note-modal" onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Заголовок"
          value={formData.title}
          onChange={handleChange('title')}
          required
        />
        
        <textarea
          className="edit-note-modal__textarea"
          placeholder="Содержимое заметки..."
          value={formData.content}
          onChange={handleChange('content')}
          rows={6}
          required
        />
        
        <div className="edit-note-modal__actions">
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

export default EditNoteModal;
