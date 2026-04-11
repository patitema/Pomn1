import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../entities/user';
import { routes } from '../../shared/config';
import './TasksPage.css';

const TasksPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={routes.auth} replace />;
  }

  return (
    <div className="page-container page-container--centered">
      <div className="tasks-container">
        <h1 className="tasks-title">Задачи</h1>
        <div className="tasks-placeholder">
          <span className="tasks-icon">🚧</span>
          <p>Страница в разработке</p>
          <p className="tasks-subtitle">
            Скоро здесь появится управление задачами
          </p>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
