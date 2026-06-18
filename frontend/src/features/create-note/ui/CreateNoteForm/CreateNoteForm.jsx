import { useState } from 'react';
import { useCreateNoteMutation, useGetNotesQuery } from '@shared/api';
import { Input, Button, Modal, MarkdownEditor } from '@shared/ui';
import './CreateNoteForm.css';

const NO_FOLDER = 'no-folder';

const CreateNoteForm = ({
  isOpen,
  onClose,
  parentId = null,
  isFolder = false,
  onSwitchToFolder,
  onSwitchToNote,
}) => {
  const [createNote] = useCreateNoteMutation();
  const { data: notes = [] } = useGetNotesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const folders = notes.filter((note) => note.is_folder);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    folderId: parentId ?? NO_FOLDER,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      folderId: parentId ?? NO_FOLDER,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createNote({
        title: formData.title,
        text: isFolder ? '' : formData.content,
        folder_id: isFolder || formData.folderId === NO_FOLDER
          ? parentId
          : Number(formData.folderId),
        is_folder: isFolder,
      }).unwrap();
      onClose();
      resetForm();
    } catch (err) {
      console.error('Failed to create note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSwitchToFolder = () => {
    resetForm();
    onSwitchToFolder?.();
  };

  const handleSwitchToNote = () => {
    resetForm();
    onSwitchToNote?.();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={`create-note-modal ${isFolder ? 'create-note-modal--folder' : ''}`}
      title={isFolder ? 'Создать папку' : 'Создать заметку'}
    >
      <form className="create-note-form" onSubmit={handleSubmit}>
        <Input
          label={isFolder ? 'Название папки' : 'Название'}
          type="text"
          placeholder={isFolder ? 'Название папки' : 'Заголовок'}
          value={formData.title}
          onChange={handleChange('title')}
          required
        />

        {!isFolder && (
          <label className="create-note-form__field">
            <span className="create-note-form__label">Папка</span>
            <select
              className="create-note-form__select"
              value={formData.folderId}
              onChange={handleChange('folderId')}
            >
              <option value={NO_FOLDER}>Без папки</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.title || `Папка ${folder.id}`}
                </option>
              ))}
            </select>
          </label>
        )}

        {!isFolder && (
          <label className="create-note-form__field">
            <span className="create-note-form__label">Содержимое</span>
            <MarkdownEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value || '' })}
              placeholder="Содержимое заметки (поддерживается Markdown)..."
              height={300}
              preview="live"
            />
          </label>
        )}

        <div className="create-note-form__actions">
          <Button
            type="submit"
            className={isFolder ? 'create-note-form__folder-button' : ''}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Создание...' : 'Создать'}
          </Button>
          {isFolder ? (
            <Button
              className="create-note-form__note-button"
              onClick={handleSwitchToNote}
              disabled={isSubmitting}
            >
              Создать заметку
            </Button>
          ) : (
            <Button
              className="create-note-form__folder-button"
              onClick={handleSwitchToFolder}
              disabled={isSubmitting}
            >
              Создать папку
            </Button>
          )}
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
