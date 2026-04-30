const NotesToolbar = ({
  selectedNote,
  onAddNote,
  onEditNote,
  onColorChange,
  onAddFolder,
  onDelete,
}) => {
  const hasSelection = Boolean(selectedNote);
  const canEditNote = Boolean(selectedNote && !selectedNote.is_folder);

  return (
    <div className="EditToolsContainer">
      <ul className="ToolsList">
        <button
          className={`toolButton ${!hasSelection ? 'available' : ''}`}
          onClick={onAddNote}
          title="Р”РѕР±Р°РІРёС‚СЊ Р·Р°РјРµС‚РєСѓ"
          disabled={hasSelection}
        >
          <svg className={`toolIcon ${!hasSelection ? 'available' : ''}`}>
            <use href="/images/icons.svg#ToolAdd"></use>
          </svg>
        </button>
        <button
          className={`toolButton ${canEditNote ? 'available' : ''}`}
          title="Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ"
          disabled={!canEditNote}
          onClick={onEditNote}
        >
          <svg className={`toolIcon ${canEditNote ? 'available' : ''}`}>
            <use href="/images/icons.svg#ToolEdit"></use>
          </svg>
        </button>
        <button
          className={`toolButton ${hasSelection ? 'available' : ''}`}
          title="РР·РјРµРЅРёС‚СЊ С†РІРµС‚"
          disabled={!hasSelection}
          onClick={onColorChange}
        >
          <svg className={`toolIcon ${hasSelection ? 'available' : ''}`}>
            <use href="/images/icons.svg#ToolColor"></use>
          </svg>
        </button>
        <button
          className={`toolButton ${!hasSelection ? 'available' : ''}`}
          onClick={onAddFolder}
          title="Р”РѕР±Р°РІРёС‚СЊ РїР°РїРєСѓ"
          disabled={hasSelection}
        >
          <svg className={`toolIcon ${!hasSelection ? 'available' : ''}`}>
            <use href="/images/icons.svg#ToolFolder"></use>
          </svg>
        </button>
        <button
          className={`toolButton ${hasSelection ? 'available' : ''}`}
          title="РЈРґР°Р»РёС‚СЊ"
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
