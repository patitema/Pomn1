import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { UserInfo } from '@entities/user';
import { selectIsAuthenticated } from '@entities/user';
import { routes } from '@shared/config';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header__container">
        <Link to={routes.home} className="header__logo">
          <span className="header__logo-text">POMNI</span>
        </Link>
        
        <nav className="header__nav">
          {isAuthenticated ? (
            <>
              <Link 
                to={routes.notes} 
                className={`header__link ${isActive(routes.notes) ? 'header__link--active' : ''}`}
              >
                Заметки
              </Link>
              <Link 
                to={routes.folders} 
                className={`header__link ${isActive(routes.folders) ? 'header__link--active' : ''}`}
              >
                Папки
              </Link>
              <Link 
                to={routes.profile} 
                className={`header__link ${isActive(routes.profile) ? 'header__link--active' : ''}`}
              >
                Профиль
              </Link>
            </>
          ) : (
            <>
              <Link 
                to={routes.auth} 
                className={`header__link ${isActive(routes.auth) ? 'header__link--active' : ''}`}
              >
                Вход
              </Link>
              <Link 
                to={routes.registration} 
                className={`header__link ${isActive(routes.registration) ? 'header__link--active' : ''}`}
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>
        
        {isAuthenticated && (
          <div className="header__user">
            <UserInfo />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
