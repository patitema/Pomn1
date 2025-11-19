import React from 'react';
import './footer.css'

export default function Footer() {
    return (
            <footer>
                <div className='footer-container'>
                    <h3>обратная связь</h3>
                    <p>телефон: <span>+79059884353</span></p>
                    <div className='callback-images'>
                        <img src="/images/TG.png" alt="ТГ" />
                        <img src="/images/Whatsapp.png" alt="Васап" />
                    </div>
                </div>
                <p>проект создан Артёмом авхимовичем 1исп-21</p>
            </footer>
    );
}