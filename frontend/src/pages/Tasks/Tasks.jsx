import React from 'react'

import './Tasks.css'

import Nav from '../../components/nav/nav'
import Footer from '../../components/footer/footer'

export default function Tasks() {
  document.title = 'POMNI - TASKS'

  return (
    <div>
      <Nav></Nav>
      <main>
        <div className="main-container"></div>
      </main>
      <Footer></Footer>
    </div>
  )
}
