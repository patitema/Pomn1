import { routes } from '../../../shared/config';

import HomePage from '../../../pages/home/HomePage.jsx';
import AuthPage from '../../../pages/auth/AuthPage.jsx';
import RegistrationPage from '../../../pages/registration/RegistrationPage.jsx';
import NotesPage from '../../../pages/notes/NotesPage.jsx';
import FoldersPage from '../../../pages/folders/FoldersPage.jsx';
import ProfilePage from '../../../pages/profile/ProfilePage.jsx';
import TasksPage from '../../../pages/tasks/TasksPage.jsx';

import { Routes, Route } from 'react-router-dom';

export const AppRoutes = () => (
  <Routes>
    <Route path={routes.home} element={<HomePage />} />
    <Route path={routes.auth} element={<AuthPage />} />
    <Route path={routes.registration} element={<RegistrationPage />} />
    <Route path={routes.notes} element={<NotesPage />} />
    <Route path={routes.folders} element={<FoldersPage />} />
    <Route path={routes.profile} element={<ProfilePage />} />
    <Route path={routes.tasks} element={<TasksPage />} />
    <Route path="*" element={<div>Страница не найдена</div>} />
  </Routes>
);
