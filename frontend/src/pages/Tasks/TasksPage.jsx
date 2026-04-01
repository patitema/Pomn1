import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../entities/user/index.js';
import { Header } from '../../widgets/header/index.js';
import { Footer } from '../../widgets/footer/index.js';
import { routes } from '../../shared/config/index.js';
import './TasksPage.css';

const TasksPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={routes.auth} replace />;
  }

  return (
    <div className="tasks-page">
      <Header />
      
      <main className="tasks-page__content">
        <div className="tasks-page__container">
          <h1 className="tasks-page__title">Задачи</h1>
          <div className="tasks-page__placeholder">
            <span className="tasks-page__icon">🚧</span>
            <p>Страница в разработке</p>
            <p className="tasks-page__subtitle">
              Скоро здесь появится управление задачами
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TasksPage;
