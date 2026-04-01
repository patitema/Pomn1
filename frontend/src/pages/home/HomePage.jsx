import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectIsAuthenticated } from '@entities/user';
import { routes } from '@shared/config';

const HomePage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <div className="home-page">
      <h1>POMNI</h1>
      <p>Ваше пространство для заметок и идей</p>
      
      {!isAuthenticated ? (
        <div className="home-page__actions">
          <Link to={routes.auth}>Войти</Link>
          <Link to={routes.registration}>Регистрация</Link>
        </div>
      ) : (
        <div className="home-page__actions">
          <Link to={routes.notes}>Перейти к заметкам</Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;
