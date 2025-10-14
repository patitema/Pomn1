// hooks/useAddNote.js
import { useCallback } from "react";
import axios from "axios";

export function useAddNote() {
  const addNote = useCallback(async (noteData) => {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/notes/",
      noteData
    );
    return response.data;
  }, []);

  return { addNote };
}
