import { formatNoteDate, getNotePreview } from '../../model/helpers';
import { DeleteNoteButton } from '@features/delete-note';
import './NoteCard.css';

const NoteCard = ({ note, onEdit, onDelete }) => {
  return (
    <div className="note-card">
      <div className="note-card__header">
        <h3 className="note-card__title">{note.title || 'Без названия'}</h3>
        <span className="note-card__date">
          {formatNoteDate(note.created_at)}
        </span>
      </div>
      
      <p className="note-card__content">
        {getNotePreview(note.content)}
      </p>
      
      <div className="note-card__actions">
        <button 
          className="note-card__button note-card__button--edit"
          onClick={() => onEdit?.(note)}
        >
          Редактировать
        </button>
        <DeleteNoteButton noteId={note.id} onSuccess={onDelete} />
      </div>
    </div>
  );
};

export default NoteCard;
