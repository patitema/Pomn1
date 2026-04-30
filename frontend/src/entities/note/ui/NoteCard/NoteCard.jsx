import { getNotePreview } from '../../model/helpers';
import { formatDateTime } from '@shared/lib';
import './NoteCard.css';

const NoteCard = ({ note, onEdit, onDelete }) => {
  const handleDelete = () => {
    onDelete?.(note.id);
  };

  return (
    <div className="note-card">
      <div className="note-card__header">
        <h3 className="note-card__title">{note.title || 'Без названия'}</h3>
        <span className="note-card__date">
          {formatDateTime(note.created_at)}
        </span>
      </div>
      
      <p className="note-card__content">
        {getNotePreview(note.text)}
      </p>
      
      <div className="note-card__actions">
        <button 
          className="note-card__button note-card__button--edit"
          onClick={() => onEdit?.(note)}
        >
          Редактировать
        </button>
        <button
          className="note-card__button note-card__button--delete"
          onClick={handleDelete}
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

export default NoteCard;
