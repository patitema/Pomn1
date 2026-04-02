import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser, selectIsAuthenticated } from '@entities/user'
import { routes } from '@shared/config'
import './Navigation.css'

export const Navigation = () => {
  const [isActive, setIsActive] = useState(false)
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const toggleMenu = () => {
    setIsActive(!isActive)
  }

  return (
    <nav>
      <div className={`nav-container ${isActive ? 'active' : ''}`}>
        <div className="logo-nav">
          <img src="/images/small.png" alt="Logo" />
        </div>
        <button className={`openNavBtn ${isActive ? 'active' : ''}`}>
          <svg
            className={`openNavSvg ${isActive ? 'active' : ''}`}
            onClick={toggleMenu}
          >
            <use href="/images/icons.svg#Arrow"></use>
          </svg>
        </button>
        <ul className="list-Of-Pages">
          <li>
            <Link to={routes.home}>
              <svg className="icon">
                <use href="/images/icons.svg#general"></use>
              </svg>
              <p>Главная</p>
            </Link>
          </li>
          <li>
            <Link to={routes.notes}>
              <svg className="icon">
                <use href="/images/icons.svg#pointView"></use>
              </svg>
              <p>Заметки</p>
            </Link>
          </li>
          <li>
            <Link to={routes.folders}>
              <svg className="icon">
                <use href="/images/icons.svg#folders"></use>
              </svg>
              <p>Папка</p>
            </Link>
          </li>
          <li>
            <Link to={routes.tasks}>
              <svg className="icon">
                <use href="/images/icons.svg#notes"></use>
              </svg>
              <p>Задачи</p>
            </Link>
          </li>
          <li>
            <Link to={isAuthenticated ? routes.profile : routes.auth}>
              <svg className="icon profile-icon" viewBox="0 0 24 24">
                <use href="/images/icons.svg#icon-profile" />
              </svg>
              <p>{user ? user.username : 'Войти'}</p>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
