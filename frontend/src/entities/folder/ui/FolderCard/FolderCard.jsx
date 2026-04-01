import { formatFolderDate } from '../../model/helpers';
import './FolderCard.css';

const FolderCard = ({ 
  folder, 
  onOpen, 
  onEdit, 
  onDelete,
  notesCount = 0 
}) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Удалить папку?')) {
      onDelete?.(folder.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(folder);
  };

  return (
    <div className="folder-card" onClick={() => onOpen?.(folder.id)}>
      <div className="folder-card__icon">📁</div>
      
      <div className="folder-card__content">
        <h3 className="folder-card__title">{folder.name || 'Без названия'}</h3>
        <span className="folder-card__date">
          {formatFolderDate(folder.created_at)}
        </span>
        {notesCount > 0 && (
          <span className="folder-card__count">{notesCount} заметок</span>
        )}
      </div>
      
      <div className="folder-card__actions">
        <button 
          className="folder-card__button folder-card__button--edit"
          onClick={handleEdit}
        >
          ✏️
        </button>
        <button 
          className="folder-card__button folder-card__button--delete"
          onClick={handleDelete}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default FolderCard;
