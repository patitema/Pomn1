import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@entities/user';
import { Footer } from '../../widgets/footer';
import { routes } from '../../shared/config';
import '../../assets/styles/HomePage.css';

const HomePage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const landingLink = isAuthenticated ? routes.notes : routes.auth;

  return (
    <div className="page-container">
      <div className="header-container">
        <h1>POMNI</h1>
        <p>POMNI - ОНЛАЙН САЙТ ДЛЯ СОЗДАНИЯ ОНЛАЙН ЗАМЕТОК</p>
        <Link to={landingLink}>
          <button>{isAuthenticated ? 'ПЕРЕЙТИ К ЗАМЕТКАМ' : 'НАЧАТЬ'}</button>
        </Link>
      </div>

      <main>
        <div className="main-container">
          <h2>НАШ ПРОЕКТ ПОЛНОСТЬЮ БЕСПЛАТНЫЙ!</h2>
          <h3>МЫ НЕ ОТВЕЧАЕМ ЗА БЕЗОПАСНОСТЬ ВАШИХ ДАННЫХ!!!</h3>
          <h3>ПОЛЬЗУЙТЕСЬ НА СВОЙ СТРАХ И РИСК</h3>
          <Link to={landingLink}>
            <button>{isAuthenticated ? 'ПЕРЕЙТИ К ЗАМЕТКАМ' : 'НАЧАТЬ ПОЛЬЗОВАТЬСЯ'}</button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
