import React, { useState } from "react";
import { useNotes } from "../../context/NotesContext";
import { useAddFolder } from "../../hooks/UseFolder";
import { useApi } from "../../context/ApiContext";
import "./CreateNoteToggle.css";

export default function CreateNoteToggle({ folderId }) {
  const [isActive, setIsActive] = useState(false);
  const [isFolderMode, setIsFolderMode] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(folderId || "no-folder");
  const { addNote } = useNotes();
  const { addFolder } = useAddFolder();
  const { folders } = useApi();

  const toggleFolderMode = () => {
    setIsFolderMode(true);
    setIsActive(true);
  };

  const toggleNoteMode = () => {
    setIsFolderMode(false);
    setIsActive(true);
  };

  const validate = (data, isFolder) => {
    if (!data.title) throw new Error("Title is required");
    if (!isFolder && !data.text) throw new Error("Text is required for notes");
    return true;
  };

  const fallbackCreateNote = async (noteData) => {
    const url = "http://127.0.0.1:8000/api/notes/";
    console.info("Fallback: отправка через fetch", url, noteData);
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(noteData),
      credentials: "include",
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Server responded ${resp.status}: ${text}`);
    }
    return resp.json();
  };

  const fallbackCreateFolder = async (folderData) => {
    const url = "http://127.0.0.1:8000/api/folders/";
    console.info("Fallback: отправка через fetch", url, folderData);
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(folderData),
      credentials: "include",
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Server responded ${resp.status}: ${text}`);
    }
    return resp.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isFolder = isFolderMode;
    const data = isFolder
      ? {
          title: title.trim(),
          parent_id: folderId ? Number(folderId) : null,
        }
      : {
          title: title.trim(),
          text: text.trim(),
          folder_id:
            selectedFolder === "no-folder" ? null : Number(selectedFolder),
          created_at: new Date().toISOString(),
        };

    try {
      validate(data, isFolder);

      let result;
      if (isFolder) {
        console.info("Creating folder...");
        if (typeof addFolder === "function") {
          result = await addFolder(data);
        } else {
          console.warn("addFolder not found, using fallback fetch");
          result = await fallbackCreateFolder(data);
        }
      } else {
        if (typeof addNote === "function") {
          console.info("Calling context addNote...");
          result = addNote(data);
          if (result && typeof result.then === "function") {
            result = await result;
          } else {
            console.warn(
              "addNote did not return a promise — treating as sync value:",
              result
            );
          }
        } else {
          console.warn("addNote not found in context, using fallback fetch");
          result = await fallbackCreateNote(data);
        }
      }

      console.log(`${isFolder ? "Folder" : "Note"} created result:`, result);
      setTitle("");
      setText("");
      setIsActive(false);
      setIsFolderMode(false);

      window.location.reload();
    } catch (err) {
      console.error(
        `Ошибка при создании ${isFolder ? "папки" : "заметки"}:`,
        err
      );
      alert(
        `Ошибка при создании ${isFolder ? "папки" : "заметки"}: ` +
          (err.message || err)
      );
    }
  };

  return (
    <div>
      <div className={`CreateNoteContainer ${isActive ? "active" : ""}`}>
        <div className="CreateNoteHeader">
          <h3>{isFolderMode ? "Создайте папку" : "Создайте заметку"}</h3>
        </div>
        <form className="CreateNote" onSubmit={handleSubmit} noValidate>
          <input
            id="HeadName"
            type="text"
            placeholder="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          {!isFolderMode && (
            <textarea
              id="NoteInfo"
              placeholder="Текст заметки"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          )}
          <select
            className="parent-folder"
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}>
            <option value="no-folder">Без папки</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.title || `Папка ${folder.id}`}
              </option>
            ))}
          </select>
          <button className="MakeNote" type="submit">
            Создать
          </button>
          {isFolderMode ? (
            <button
              className="MakeFolder"
              type="button"
              onClick={toggleNoteMode}>
              Создать заметку
            </button>
          ) : (
            <button
              className="MakeFolder"
              type="button"
              onClick={toggleFolderMode}>
              Создать папку
            </button>
          )}
        </form>
      </div>

      <div className={`CreateNoteBtnContainer ${isActive ? "active" : ""}`}>
        <button
          className={`CreateNoteBtn ${isActive ? "active" : ""}`}
          onClick={() => setIsActive(!isActive)}
          type="button">
          <p>+</p>
        </button>
      </div>
    </div>
  );
}
