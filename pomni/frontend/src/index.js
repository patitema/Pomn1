// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

import Notes from "./pages/Notes/Notes.jsx";
import Folder from "./pages/Folder-view/Folder.jsx";
import General from "./General";
import Authorization from "./pages/Authorization/Authorization.jsx";
import { ApiProvider } from "./context/ApiContext.js";
import { NotesProvider } from "./context/NotesContext.js";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ApiProvider>
      <NotesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<General />} />
            <Route path="/Notes" element={<Notes />} />
            <Route path="/Folder" element={<Folder />} />
            <Route path="/Authorization" element={<Authorization />} />
            <Route path="*" element={<div>Яна Бийск</div>} />
          </Routes>
        </BrowserRouter>
      </NotesProvider>
    </ApiProvider>
  </React.StrictMode>
);
