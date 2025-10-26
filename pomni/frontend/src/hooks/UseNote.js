import { useCallback, useEffect, useState } from "react";

export function useNote() {
  const [notes, setNotes] = useState([]);

  const fetchNotes = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/notes/", {
        headers: {
          Authorization: token ? `Token ${token}` : "",
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Ошибка загрузки заметок");
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setNotes([]);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = useCallback(async (noteData) => {
    const token = localStorage.getItem("token");
    const response = await fetch("http://127.0.0.1:8000/api/notes/", {
      method: "POST",
      headers: {
        Authorization: token ? `Token ${token}` : "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ошибка создания заметки: ${text}`);
    }

    const created = await response.json();
    setNotes((prev) => [created, ...prev]);
    return created;
  }, []);

  const deleteNote = useCallback(async (id) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://127.0.0.1:8000/api/notes/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Token ${token}` : "",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ошибка при удалении заметки: ${text}`);
    }

    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  return { notes, addNote, deleteNote, fetchNotes };
}
