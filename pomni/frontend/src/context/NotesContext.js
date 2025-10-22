import React, { createContext, useContext, useEffect, useState } from "react";

const NotesContext = createContext();

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);

  const fetchNotes = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/notes/", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Ошибка загрузки заметок");
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setNotes([]);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async (noteData) => {
    const response = await fetch("http://127.0.0.1:8000/api/notes/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ошибка создания заметки: ${text}`);
    }

    const created = await response.json();
    setNotes((prev) => [created, ...prev]);
    return created;
  };

  const deleteNote = async (id) => {
    const response = await fetch(`http://127.0.0.1:8000/api/notes/${id}/`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ошибка при удалении заметки: ${text}`);
    }

    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return (
    <NotesContext.Provider value={{ notes, addNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export const useNotes = () => useContext(NotesContext);
