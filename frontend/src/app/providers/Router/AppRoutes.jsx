import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { routes } from '@shared/config';
import { ProtectedRoute } from '@shared/ui/ProtectedRoute';
import { Loader } from '@shared/ui/Loader';

const HomePage = lazy(() => import('@pages/home/HomePage'));
const AuthPage = lazy(() => import('@pages/Auth/AuthPage'));
const RegistrationPage = lazy(() => import('@pages/registration/RegistrationPage'));
const PasswordResetRequestPage = lazy(() => import('@pages/password-reset/PasswordResetRequestPage'));
const PasswordResetConfirmPage = lazy(() => import('@pages/password-reset/PasswordResetConfirmPage'));
const PrivacyPolicyPage = lazy(() => import('@pages/legal/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('@pages/legal/TermsPage'));
const SeoPage = lazy(() => import('@pages/seo/SeoPage'));
const NotesPage = lazy(() => import('@pages/Notes/NotesPage'));
const FoldersPage = lazy(() => import('@pages/folders/FoldersPage'));
const ProfilePage = lazy(() => import('@pages/Profile/ProfilePage'));
const TasksPage = lazy(() => import('@pages/Tasks/TasksPage'));
const MuiProvider = lazy(() => import('@app/providers/MuiProvider/MuiProvider'));

const withMui = (page) => <MuiProvider>{page}</MuiProvider>;

export const AppRoutes = () => (
  <Suspense fallback={<Loader />}>
    <Routes>
      <Route path={routes.home} element={<HomePage />} />
      <Route path={routes.auth} element={withMui(<AuthPage />)} />
      <Route path={routes.registration} element={withMui(<RegistrationPage />)} />
      <Route path={routes.passwordReset} element={withMui(<PasswordResetRequestPage />)} />
      <Route path={routes.passwordResetConfirm} element={withMui(<PasswordResetConfirmPage />)} />
      <Route path={routes.privacy} element={<PrivacyPolicyPage />} />
      <Route path={routes.terms} element={<TermsPage />} />
      <Route path={routes.notesOnline} element={<SeoPage pageKey="notesOnline" />} />
      <Route path={routes.tasksAndNotes} element={<SeoPage pageKey="tasksAndNotes" />} />
      <Route path={routes.weeklyPlanner} element={<SeoPage pageKey="weeklyPlanner" />} />
      <Route path={routes.knowledgeGraph} element={<SeoPage pageKey="knowledgeGraph" />} />
      <Route path={routes.markdownNotes} element={<SeoPage pageKey="markdownNotes" />} />
      <Route path={routes.faq} element={<SeoPage pageKey="faq" />} />
      <Route element={withMui(<ProtectedRoute />)}>
        <Route path={routes.notes} element={<NotesPage />} />
        <Route path={routes.folders} element={<FoldersPage />} />
        <Route path={routes.profile} element={<ProfilePage />} />
        <Route path={routes.tasks} element={<TasksPage />} />
      </Route>
      <Route path="*" element={<div>Страница не найдена</div>} />
    </Routes>
  </Suspense>
);
