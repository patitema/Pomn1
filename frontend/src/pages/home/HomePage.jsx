import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectIsAuthenticated } from '../../entities/user/index.js';
import { Header } from '../../widgets/header/index.js';
import { Footer } from '../../widgets/footer/index.js';
import { Button } from '../../shared/ui/index.js';
import { routes } from '../../shared/config/index.js';
import './HomePage.css';

const HomePage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <div className="home-page">
      <Header />
      
      <main className="home-page__content">
        <div className="home-page__hero">
          <h1 className="home-page__title">
            Добро пожаловать в <span className="home-page__accent">POMNI</span>
          </h1>
          <p className="home-page__subtitle">
            Ваше пространство для заметок и идей
          </p>
          
          {!isAuthenticated ? (
            <div className="home-page__actions">
              <Link to={routes.auth}>
                <Button size="large">Войти</Button>
              </Link>
              <Link to={routes.registration}>
                <Button variant="secondary" size="large">
                  Регистрация
                </Button>
              </Link>
            </div>
          ) : (
            <div className="home-page__actions">
              <Link to={routes.notes}>
                <Button size="large">Перейти к заметкам</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
