import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Folder.css";
import Nav from "../../components/nav/nav";
import Footer from "../../components/footer/footer";
import { useApi } from "../../context/ApiContext";
import { useUsers } from "../../hooks/UseUsers";
import CreateNoteToggle from "../../components/createNoteBtn/CreateNoteToggle";

export default function Folder() {
  document.title = "POMNI - FOLDER";
  const navigate = useNavigate();
  const { token } = useUsers();
  const { user, fetchCurrentUser } = useUsers();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (!token) {
      navigate("/Auth");
    }
  }, [token, navigate]);

  const { folders, notes, loading, deleteNote, deleteFolder } = useApi();
  console.log("FOLDERS:", folders);
  console.log("NOTES:", notes);
  const [openFolders, setOpenFolders] = useState(new Set());
  const [openNotes, setOpenNotes] = useState(new Set());
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
            <p>📁 {folder.title || `Папка ${folder.id}`}</p>
            <div className="Tool-btns">
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFolder(folder.id);
                }}>
                <svg className="delete-icon" viewBox="0 0 30 30">
                  <use href="/images/icons.svg#ToolDelete"></use>
                </svg>
              </button>
            </div>
          </div>
          <div className="folder-info">
            {folder.created_at && formatDate(folder.created_at)}
          </div>
        </div>

        <div className={`folder-content ${isOpen ? "open" : "closed"}`}>
          {isOpen && (
            <ul style={{ marginLeft: "0px", marginTop: "5px" }}>
              {folder.children &&
                folder.children.map((childFolder) =>
                  renderFolder(childFolder, level + 1)
                )}

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
                          <p>{note.title || `Заметка ${note.id}`}</p>
                          <button
                            className="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}>
                            <svg className="delete-icon" viewBox="0 0 30 30">
                              <use href="/images/icons.svg#ToolDelete"></use>
                            </svg>
                          </button>
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
            <h2>{user ? user.username : "None"} BASE</h2>
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

          <ul className="FileList">
            {folders.map((folder) => renderFolder(folder))}

            {unfolderNotes.map((note, idx) => {
              const isNoteOpen = openNotes.has(note.id);
              return (
                <li
                  key={`unfolder-note-${note.id}`}
                  className="unfolder-stroke note-item"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleNote(note.id)}>
                  <div className="note-main">
                    <p>{note.title || `Заметка ${note.id}`}</p>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}>
                      <svg className="delete-icon" viewBox="0 0 30 30">
                        <use href="/images/icons.svg#ToolDelete"></use>
                      </svg>
                    </button>
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
