import { useState, useEffect } from 'react';
import { useUpdateNoteMutation } from '@shared/api';
import { Input, Button, Modal, MarkdownEditor } from '@shared/ui';
import './EditNoteModal.css';

const EditNoteModal = ({ note, isOpen, onClose, onUpdated }) => {
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
        content: note.text || '',
      });
    }
  }, [note]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedNote = await updateNote({
        id: note.id,
        body: {
          title: formData.title,
          text: formData.content,
        },
      }).unwrap();

      onUpdated?.(updatedNote);
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Редактировать заметку"
      className="edit-note-modal__dialog"
    >
      <form className="edit-note-modal" onSubmit={handleSubmit}>
        <Input
          label="Название"
          type="text"
          placeholder="Заголовок"
          value={formData.title}
          onChange={handleChange('title')}
          required
        />

        <label className="edit-note-modal__field">
          <span className="edit-note-modal__label">Содержимое</span>
          <MarkdownEditor
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value || '' })}
            placeholder="Содержимое заметки (поддерживается Markdown)..."
            height={300}
            preview="live"
          />
        </label>

        <div className="edit-note-modal__actions">
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

export default EditNoteModal;
