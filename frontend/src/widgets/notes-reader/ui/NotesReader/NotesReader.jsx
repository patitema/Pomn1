import { MarkdownViewer } from '@shared/ui';

const NotesReader = ({ selectedNote, onClose }) => {
  const isActive = Boolean(selectedNote && !selectedNote.is_folder);
  const activeClass = isActive ? 'active' : '';

  return (
    <div className={`ReadFile ${activeClass}`}>
      <div className={`FileName ${activeClass}`}>
        <h3>{selectedNote ? selectedNote.title : 'Имя заметки'}</h3>
      </div>
      <div className="Info">
        <div className="openInfo">
          <button className={`openInfoBtn ${activeClass}`}>
            <svg className={`openInfoSvg ${activeClass}`} onClick={onClose}>
              <use href="/images/icons.svg#Arrow"></use>
            </svg>
          </button>
        </div>
        <div className={`FileInfo ${activeClass}`}>
          <MarkdownViewer
            content={selectedNote?.text || ''}
            className="notes-page__viewer"
          />
        </div>
      </div>
    </div>
  );
};

export default NotesReader;
