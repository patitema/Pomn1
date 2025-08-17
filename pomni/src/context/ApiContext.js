import React, { createContext, useContext, useEffect, useState } from "react";

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const resNotes = await fetch("http://127.0.0.1:8000/api/notes/");
      if (!resNotes.ok) {
        throw new Error(`HTTP error! status: ${resNotes.status}`);
      }
      const data = await resNotes.json();

      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Ошибка загрузки заметок:", error);
      setNotes([]);
    }
  };

  const fetchFolders = async () => {
    try {
      const resFolders = await fetch("http://127.0.0.1:8000/api/folders/");
      if (!resFolders.ok) {
        throw new Error(`HTTP error! status: ${resFolders.status}`);
      }
      const data = await resFolders.json();

      setFolders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Ошибка загрузки папок:", error);
      setFolders([]);
    }
  };

  useEffect(() => {
    Promise.all([fetchNotes(), fetchFolders()]).then(() => setLoading(false));
  }, []);

  return (
    <ApiContext.Provider value={{ notes, folders, loading, fetchNotes, fetchFolders }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
