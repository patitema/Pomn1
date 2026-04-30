import { useState } from 'react';
import { useCreateNoteMutation } from '@shared/api';
import { Input, Button, Modal, MarkdownEditor } from '@shared/ui';
import './CreateNoteForm.css';

const CreateNoteForm = ({ isOpen, onClose, parentId = null, isFolder = false }) => {
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
      await createNote({
        title: formData.title,
        text: formData.content,
        folder_id: parentId,
        is_folder: isFolder,
      }).unwrap();
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isFolder ? "Создать папку" : "Создать заметку"}
    >
      <form className="create-note-form" onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder={isFolder ? "Название папки" : "Заголовок"}
          value={formData.title}
          onChange={handleChange('title')}
          required
        />

        {!isFolder && (
          <MarkdownEditor
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value || '' })}
            placeholder="Содержимое заметки (поддерживается Markdown)..."
            height={300}
            preview="edit"
          />
        )}

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
