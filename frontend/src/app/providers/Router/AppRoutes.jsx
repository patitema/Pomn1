import { routes } from '@shared/config';

import HomePage from '@pages/home';
import AuthPage from '@pages/auth';
import RegistrationPage from '@pages/registration';
import NotesPage from '@pages/notes';
import FoldersPage from '@pages/folders';
import ProfilePage from '@pages/profile';
import TasksPage from '@pages/tasks';

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
