import React, { useState } from "react";
import "./Folder.css";
import Nav from "../../components/nav/nav";
import Footer from "../../components/footer/footer";
import { useApi } from "../../context/ApiContext";
import CreateNoteToggle from "../../components/createNoteBtn/CreateNoteToggle";

export default function Folder() {
  document.title = "POMNI - FOLDER";

  const { folders, notes, loading } = useApi();
  console.log("FOLDERS:", folders);
  console.log("NOTES:", notes);
  const [openFolders, setOpenFolders] = useState(new Set()); // Множество открытых папок
  const [openNotes, setOpenNotes] = useState(new Set()); // Множество открытых заметок
  const [search, setSearch] = useState("");

  const toggleNote = (noteId) => {
    const newOpenNotes = new Set(openNotes);
    if (newOpenNotes.has(noteId)) {
      newOpenNotes.delete(noteId);
    } else {
      newOpenNotes.add(noteId);
    }
    setOpenNotes(newOpenNotes);
  };

  if (loading) return <p>Загрузка...</p>;

  const toggleFolder = (folderId) => {
    const newOpenFolders = new Set(openFolders);
    if (newOpenFolders.has(folderId)) {
      newOpenFolders.delete(folderId);
    } else {
      newOpenFolders.add(folderId);
    }
    setOpenFolders(newOpenFolders);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderFolder = (folder, level = 0) => {
    const folderNotes = notes.filter(
      (note) =>
        note.folder === folder.id &&
        note.title.toLowerCase().includes(search.toLowerCase())
    );

    const isOpen = openFolders.has(folder.id);
    const marginLeft = level * 20;

    return (
      <li key={folder.id} className="stroke-folder">
        <div
          onClick={() => toggleFolder(folder.id)}
          className="folder-header"
          style={{
            cursor: "pointer",
            fontWeight: "bold",
            marginLeft: `${marginLeft}px`,
          }}>
          <div className="folder-main">
            📁 {folder.title || `Папка ${folder.id}`}
          </div>
          <div className="folder-info">
            {folder.created_at && formatDate(folder.created_at)}
          </div>
        </div>

        <div className={`folder-content ${isOpen ? "open" : "closed"}`}>
          {isOpen && (
            <ul style={{ marginLeft: "0px", marginTop: "5px" }}>
              {/* Дочерние папки */}
              {folder.children &&
                folder.children.map((childFolder) =>
                  renderFolder(childFolder, level + 1)
                )}

              {/* Заметки в папке */}
              {folderNotes.length > 0
                ? folderNotes.map((note, idx) => {
                    const isNoteOpen = openNotes.has(note.id);
                    return (
                      <li
                        key={`note-${note.id}`}
                        className="stroke note-item"
                        style={{
                          marginLeft: `${marginLeft + 20}px`,
                          cursor: "pointer",
                        }}
                        onClick={() => toggleNote(note.id)}>
                        <div className="note-main">
                          {note.title || `Заметка ${note.id}`}
                        </div>
                        {isNoteOpen && (
                          <div className="note-content">
                            <div className="note-text">
                              {note.text || "Содержимое отсутствует"}
                            </div>
                            <div className="note-info">
                              {note.created_at && formatDate(note.created_at)}
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })
                : folder.children &&
                  folder.children.length === 0 && (
                    <li
                      style={{
                        fontStyle: "italic",
                        marginLeft: `${marginLeft + 20}px`,
                      }}>
                      Нет заметок
                    </li>
                  )}
            </ul>
          )}
        </div>
      </li>
    );
  };

  // Заметки без папки
  const unfolderNotes = notes.filter(
    (note) =>
      note.folder === null &&
      note.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Nav />
      <header>
        <div className="Hcontainer">
          <div className="hTextContainer">
            <h1>POMNI</h1>
            <h2>BASE NAME</h2>
          </div>
        </div>
      </header>

      <main>
        <div className="FolderContainer">
          <div className="navFolderView">
            <input
              className="SearchInput"
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Иерархический список папок */}
          <ul className="FileList">
            {folders.map((folder) => renderFolder(folder))}

            {/* Заметки без папки отображаются под папками */}
            {unfolderNotes.map((note, idx) => {
              const isNoteOpen = openNotes.has(note.id);
              return (
                <li
                  key={`unfolder-note-${note.id}`}
                  className="unfolder-stroke note-item"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleNote(note.id)}>
                  <div className="note-main">
                    {note.title || `Заметка ${note.id}`}
                  </div>
                  {isNoteOpen && (
                    <div className="note-content">
                      <div className="note-text">
                        {note.text || "Содержимое отсутствует"}
                      </div>
                      <div className="note-info">
                        {note.created_at && formatDate(note.created_at)}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <CreateNoteToggle
            onNoteCreated={(note) => console.log("Новая заметка:", note)}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
