import React from 'react';
import Nav from './components/nav/nav'
import Footer from './components/footer/footer'
import './assets/styles/General.css';

export default function General() {
    document.title = "POMNI";
    return (
        <div>
            <Nav></Nav>
            <header>
                <div id='auth-btn'></div>
                <div className='header-container'>
                    <h1>POMNI</h1>
                    <p>POMNI - онлайн сайт для создания онлайн заметок</p>
                    <button id='start'>НАЧАТЬ</button>
                </div>
            </header>
            <main>
                <div className='main-container'>
                    <h2>Наш проект полностью бесплатный!</h2>
                    <h3>Мы не отвечаем за безопасность ваших данных!!!
                    пользуйтесь на свой страх и риск</h3>
                    <button id='start'>начать пользоваться</button>
                    <div className='support'>
                        <p>поддержать нас вы
                        можете на бусти</p>
                        <div id='boosty'></div>
                    </div>
                </div>
            </main>
            <Footer></Footer>
        </div>
    );
}