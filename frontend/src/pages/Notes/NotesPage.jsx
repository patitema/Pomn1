import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../entities/user/index.js';
import { NoteGraph } from '../../widgets/note-graph/index.js';
import { Header } from '../../widgets/header/index.js';
import { Footer } from '../../widgets/footer/index.js';
import { routes } from '../../shared/config/index.js';
import './NotesPage.css';

const NotesPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={routes.auth} replace />;
  }

  return (
    <div className="notes-page">
      <Header />
      
      <main className="notes-page__content">
        <NoteGraph />
      </main>
      
      <Footer />
    </div>
  );
};

export default NotesPage;
