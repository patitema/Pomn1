import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../entities/user';
import { NoteGraph } from '../../widgets/note-graph';
import { routes } from '../../shared/config';
import './NotesPage.css';

const NotesPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={routes.auth} replace />;
  }

  return (
    <div className="page-container">
      <div className="notes-container">
        <NoteGraph />
      </div>
    </div>
  );
};

export default NotesPage;
