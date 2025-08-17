import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import './nav.css'

export default function Nav() {
    const [isActive, setIsActive] = useState(false);
    
        const toggleMenu = () => {
            setIsActive(!isActive);
        };
    
    return (
        <nav>
            <div className={`nav-container ${isActive ? 'active' : ''}`}>
                <div className='logo-nav'><img src="/images/small.png" alt="" /></div>
                <button className={`openNavBtn ${isActive ? 'active' : ''}`}><svg className={`openNavSvg ${isActive ? 'active' : ''}`} onClick={toggleMenu}><use href='/images/icons.svg#Arrow'></use></svg></button>
                <ul className='list-Of-Pages'>
                    <li><Link to="/">
                        <svg class="icon">
                            <use href="/images/icons.svg#general"></use>
                        </svg><p>Главная</p></Link></li>
                    <li><Link to="/Notes">
                        <svg class="icon">
                            <use href="/images/icons.svg#notes"></use>
                        </svg><p>Заметки</p></Link></li>
                    <li><Link to="/Folder">
                        <svg class="icon">
                            <use href="/images/icons.svg#folders"></use>
                        </svg><p>Папка</p></Link></li>
                </ul>
            </div>
            <script ></script>
        </nav>
    );
}