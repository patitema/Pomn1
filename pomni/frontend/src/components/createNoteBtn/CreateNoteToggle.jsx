import React, { useState } from "react";
import { useNotes } from "../../context/NotesContext";
import "./CreateNoteToggle.css";

export default function CreateNoteToggle({ folderId }) {
  const [isActive, setIsActive] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const { addNote } = useNotes() || {};
  const toggleNote = () => setIsActive((s) => !s);

  const validate = (data) => {
    if (!data.title || !data.text)
      throw new Error("Title and text are required");
    return true;
  };

  const fallbackCreate = async (noteData) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const noteData = {
      title: title.trim(),
      text: text.trim(),
      folder_id: folderId ? Number(folderId) : 1,
      created_at: new Date().toISOString(),
    };

    try {
      validate(noteData);

      let result;
      if (typeof addNote === "function") {
        console.info("Calling context addNote...");
        result = addNote(noteData);
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
        result = await fallbackCreate(noteData);
      }

      console.log("Note created result:", result);
      setTitle("");
      setText("");
      setIsActive(false);

      window.location.reload();
    } catch (err) {
      console.error("Ошибка при создании заметки:", err);
      alert("Ошибка при создании заметки: " + (err.message || err));
    }
  };

  return (
    <div>
      <div className={`CreateNoteContainer ${isActive ? "active" : ""}`}>
        <h3>Создайте заметку</h3>
        <form className="CreateNote" onSubmit={handleSubmit} noValidate>
          <input
            id="HeadName"
            type="text"
            placeholder="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            id="NoteInfo"
            placeholder="Текст заметки"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <button className="MakeNote" type="submit">
            Создать
          </button>
        </form>
      </div>

      <div className={`CreateNoteBtnContainer ${isActive ? "active" : ""}`}>
        <button
          className={`CreateNoteBtn ${isActive ? "active" : ""}`}
          onClick={toggleNote}
          type="button">
          <p>+</p>
        </button>
      </div>
    </div>
  );
}
