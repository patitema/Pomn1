import React, { createContext, useContext } from "react";
import { useNote } from "../hooks/UseNote";

const NotesContext = createContext();

export function NotesProvider({ children }) {
  const noteData = useNote();

  return (
    <NotesContext.Provider value={noteData}>{children}</NotesContext.Provider>
  );
}

export const useNotes = () => useContext(NotesContext);
