import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@entities/user';
import { routes } from '@shared/config';

const NotesPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={routes.auth} replace />;
  }

  return (
    <div className="notes-page">
      <h1>Заметки</h1>
      <p>Граф заметок будет здесь</p>
    </div>
  );
};

export default NotesPage;
