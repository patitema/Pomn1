import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../../components/nav/nav'
import './Notes.css'
import Footer from '../../components/footer/footer'
import ForceGraphRenderer from '../../components/forceGraphRender/ForceGraphRender'
import { useUsers } from '../../hooks/UseUsers'

export default function Notes() {
  document.title = 'POMNI - NOTES'
  const navigate = useNavigate()
  const { token } = useUsers()
  const [isActive, setIsActive] = useState(false)
  const canvasRef = useRef()

  useEffect(() => {
    if (!token) {
      navigate('/Auth')
    }
  }, [token, navigate])

  const toggleInfo = () => {
    setIsActive(!isActive)
  }
  return (
    <div>
      <Nav></Nav>
      <header>
        <div className="Hcontainer">
          <div className="hTextContainer">
            <h1>POMNI</h1>
            <h2>BASE NAME</h2>
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
              onClick={() => canvasRef.current.addCircle()}
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
      <Footer></Footer>
    </div>
  )
}
