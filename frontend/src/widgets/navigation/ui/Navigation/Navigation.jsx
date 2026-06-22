import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '@entities/user';
import { routes } from '@shared/config';
import './Navigation.css';

const getNavItems = ({ isAuthenticated, user }) => [
  {
    to: routes.home,
    icon: 'general',
    label: 'Главная',
  },
  {
    to: routes.notes,
    icon: 'pointView',
    label: 'Заметки',
  },
  {
    to: routes.folders,
    icon: 'folders',
    label: 'Папка',
  },
  {
    to: routes.tasks,
    icon: 'notes',
    label: 'Задачи',
  },
  {
    to: isAuthenticated ? routes.profile : routes.auth,
    icon: 'icon-profile',
    label: user ? user.username : (isAuthenticated ? 'Профиль' : 'Войти'),
    isProfile: true,
  },
];

export const Navigation = () => {
  const [isActive, setIsActive] = useState(false);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navItems = getNavItems({ isAuthenticated, user });

  const toggleMenu = () => {
    setIsActive((current) => !current);
  };

  return (
    <nav>
      <div className={`nav-container ${isActive ? 'active' : ''}`}>
        <div className="logo-nav">
          <img src="/images/small.png" alt="Logo" />
        </div>
        <button
          type="button"
          className={`openNavBtn ${isActive ? 'active' : ''}`}
          aria-label={isActive ? 'Свернуть навигацию' : 'Развернуть навигацию'}
          onClick={toggleMenu}
        >
          <svg
            className={`openNavSvg ${isActive ? 'active' : ''}`}
            aria-hidden="true"
          >
            <use href="/images/icons.svg#Arrow"></use>
          </svg>
        </button>
        <ul className="list-Of-Pages">
          {navItems.map((item) => (
            <li key={`${item.to}-${item.icon}`}>
              <NavLink
                to={item.to}
                aria-label={item.label}
                title={item.label}
                className={({ isActive: isRouteActive }) => (
                  isRouteActive ? 'nav-link nav-link--active' : 'nav-link'
                )}
              >
                {item.isProfile ? (
                  <span className="profile-nav-icon">
                    <svg className="icon profile-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <use href={`/images/icons.svg#${item.icon}`} />
                    </svg>
                    {isAuthenticated && <span className="profile-status-dot" />}
                  </span>
                ) : (
                  <svg className="icon" aria-hidden="true">
                    <use href={`/images/icons.svg#${item.icon}`}></use>
                  </svg>
                )}
                <p className="nav-link__label">{item.label}</p>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
