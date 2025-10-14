import React, { createContext, useContext, useEffect, useState } from "react";

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/notes/");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Ошибка загрузки заметок:", error);
      setNotes([]);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/folders/");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setFolders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Ошибка загрузки папок:", error);
      setFolders([]);
    }
  };

  useEffect(() => {
    Promise.all([fetchNotes(), fetchFolders()]).finally(() =>
      setLoading(false)
    );
  }, []);

  return (
    <ApiContext.Provider
      value={{
        notes,
        setNotes, // полезно для мутаций из других контекстов
        folders,
        setFolders, // полезно для мутаций из других контекстов
        loading,
        fetchNotes,
        fetchFolders,
      }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
