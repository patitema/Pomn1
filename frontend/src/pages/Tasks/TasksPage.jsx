import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@entities/user';
import { routes } from '@shared/config';

const TasksPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={routes.auth} replace />;
  }

  return (
    <div className="tasks-page">
      <h1>Задачи</h1>
      <p>Страница в разработке 🚧</p>
    </div>
  );
};

export default TasksPage;
