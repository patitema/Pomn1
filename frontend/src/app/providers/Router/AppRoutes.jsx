import { routes } from '@shared/config';

import HomePage from '@pages/home/HomePage';
import AuthPage from '@pages/auth/AuthPage';
import RegistrationPage from '@pages/registration/RegistrationPage';
import NotesPage from '@pages/notes/NotesPage';
import FoldersPage from '@pages/folders/FoldersPage';
import ProfilePage from '@pages/profile/ProfilePage';
import TasksPage from '@pages/tasks/TasksPage';

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
