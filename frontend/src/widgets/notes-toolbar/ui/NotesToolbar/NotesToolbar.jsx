const NotesToolbar = ({
  selectedNote,
  onAddNote,
  onEditNote,
  onColorChange,
  onDelete,
  onToggleConnectionMode,
  isConnectionModeActive = false,
}) => {
  const hasSelection = Boolean(selectedNote);
  const canEditNote = Boolean(selectedNote && !selectedNote.is_folder);

  return (
    <div className="EditToolsContainer">
      <ul className="ToolsList">
        <button
          className={`toolButton ${!hasSelection ? 'available' : ''}`}
          onClick={onAddNote}
          title="Добавить заметку"
          disabled={hasSelection}
        >
          <svg className={`toolIcon ${!hasSelection ? 'available' : ''}`}>
            <use href="/images/icons.svg#ToolAdd"></use>
          </svg>
        </button>
        <button
          className={`toolButton ${canEditNote ? 'available' : ''}`}
          title="Редактировать"
          disabled={!canEditNote}
          onClick={onEditNote}
        >
          <svg className={`toolIcon ${canEditNote ? 'available' : ''}`}>
            <use href="/images/icons.svg#ToolEdit"></use>
          </svg>
        </button>
        <button
          className={`toolButton ${hasSelection ? 'available' : ''}`}
          title="Изменить цвет"
          disabled={!hasSelection}
          onClick={onColorChange}
        >
          <svg className={`toolIcon ${hasSelection ? 'available' : ''}`}>
            <use href="/images/icons.svg#ToolColor"></use>
          </svg>
        </button>
        <button
          className={`toolButton available ${isConnectionModeActive ? 'active' : ''}`}
          title={isConnectionModeActive ? 'Отменить связь' : 'Создать связь'}
          onClick={onToggleConnectionMode}
        >
          <svg className={`toolIcon available ${isConnectionModeActive ? 'active' : ''}`}>
            <use href="/images/icons.svg#pointView"></use>
          </svg>
        </button>
        <button
          className={`toolButton ${hasSelection ? 'available' : ''}`}
          title="Удалить"
          disabled={!hasSelection}
          onClick={onDelete}
        >
          <svg className={`toolIcon ${hasSelection ? 'available' : ''}`}>
            <use href="/images/icons.svg#ToolDelete"></use>
          </svg>
        </button>
      </ul>
    </div>
  );
};

export default NotesToolbar;
