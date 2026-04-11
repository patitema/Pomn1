import React, { useState, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectUser } from '@entities/user'
import { Footer } from '@widgets/footer'
import { ForceGraphRenderer } from '@widgets/note-graph'
import './NotesPage.css'

const NotesPage = () => {
  document.title = 'POMNI - NOTES'
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const [isActive, setIsActive] = useState(false)
  const canvasRef = useRef()

  if (!isAuthenticated) {
    return <Navigate to="/Auth" replace />
  }

  const toggleInfo = () => {
    setIsActive(!isActive)
  }

  return (
    <div className="page-container">
      <header>
        <div className="Hcontainer">
          <div className="hTextContainer">
            <h1>POMNI</h1>
            <h2>{user ? user.username : 'BASE NAME'}</h2>
          </div>
        </div>
      </header>
      <main>
        <div className="NotesContainer">
          {' '}
          <ForceGraphRenderer />
        </div>
        <div className={`ReadFile ${isActive ? 'active' : ''}`}>
          <div className={`FileName ${isActive ? 'active' : ''}`}>
            <h3>Имя файла</h3>
          </div>
          <div className="Info">
            <div className="openInfo">
              <button className={`openInfoBtn ${isActive ? 'active' : ''}`}>
                <svg
                  className={`openInfoSvg ${isActive ? 'active' : ''}`}
                  onClick={toggleInfo}
                >
                  <use href="/images/icons.svg#Arrow"></use>
                </svg>
              </button>
            </div>
            <div className={`FileInfo ${isActive ? 'active' : ''}`}>
              <textarea
                name="FileInfo"
                id="FileInfo"
                placeholder="Здесь пока пусто"
              ></textarea>
            </div>
          </div>
        </div>
        <div className="EditToolsContainer">
          <ul className="ToolsList">
            <button
              className="toolButton"
              onClick={() => canvasRef.current?.addCircle?.()}
            >
              <svg className="toolIcon available">
                <use href="/images/icons.svg#ToolAdd"></use>
              </svg>
            </button>
            <button className="toolButton">
              <svg className="toolIcon">
                <use href="/images/icons.svg#ToolColor"></use>
              </svg>
            </button>
            <button className="toolButton">
              <svg className="toolIcon">
                <use href="/images/icons.svg#ToolFolder"></use>
              </svg>
            </button>
            <button className="toolButton">
              <svg className="toolIcon">
                <use href="/images/icons.svg#ToolDelete"></use>
              </svg>
            </button>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default NotesPage
