import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@entities/user';
import { routes } from '@shared/config';

const FoldersPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={routes.auth} replace />;
  }

  return (
    <div className="folders-page">
      <h1>Папки</h1>
      <p>Список папок будет здесь</p>
    </div>
  );
};

export default FoldersPage;
