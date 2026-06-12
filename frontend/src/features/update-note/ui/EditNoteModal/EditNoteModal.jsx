import { useState, useEffect } from 'react';
import { useCreateLinkMutation, useDeleteLinkMutation, useUpdateNoteMutation } from '@shared/api';
import { Input, Button, Modal, MarkdownEditor } from '@shared/ui';
import './EditNoteModal.css';

const getLinkedFolderLink = (links, noteId, folderId) =>
  links.find((link) =>
    (link.note_from === noteId && link.note_to === folderId) ||
    (link.note_from === folderId && link.note_to === noteId)
  );

const EditNoteModal = ({
  note,
  folderOptions = [],
  isOpen,
  links = [],
  onClose,
  onUpdated,
}) => {
  const [createLink] = useCreateLinkMutation();
  const [deleteLink] = useDeleteLinkMutation();
  const [updateNote] = useUpdateNoteMutation();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    folderId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.text || '',
        folderId: note.folder ? String(note.folder) : '',
      });
    }
  }, [note]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const nextFolderId = formData.folderId ? Number(formData.folderId) : null;
      const previousFolderId = note.folder || null;
      const updatedNote = await updateNote({
        id: note.id,
        body: {
          title: formData.title,
          text: formData.content,
          folder_id: nextFolderId,
        },
      }).unwrap();

      if (previousFolderId && nextFolderId && previousFolderId !== nextFolderId) {
        const linkToNextFolder = getLinkedFolderLink(links, note.id, nextFolderId);
        const linkToPreviousFolder = getLinkedFolderLink(links, note.id, previousFolderId);

        if (linkToNextFolder) {
          await deleteLink(linkToNextFolder.id).unwrap();
        }

        if (!linkToPreviousFolder) {
          await createLink({
            note_from: note.id,
            note_to: previousFolderId,
          }).unwrap();
        }
      }

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
          <span className="edit-note-modal__label">Папка</span>
          <select
            className="edit-note-modal__select"
            value={formData.folderId}
            onChange={handleChange('folderId')}
          >
            <option value="">Без папки</option>
            {folderOptions.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.title}
              </option>
            ))}
          </select>
        </label>

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
