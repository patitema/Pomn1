import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@entities/user';
import { NoteGraph } from '@widgets/note-graph';
import { Header } from '@widgets/header';
import { Footer } from '@widgets/footer';
import { routes } from '@shared/config';
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
