import { Link } from 'react-router-dom';
import { routes } from '@shared/config';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          <div className="footer__section">
            <h4 className="footer__title">POMNI</h4>
            <p className="footer__description">
              Ваше пространство для заметок и идей
            </p>
          </div>
          
          <div className="footer__section">
            <h4 className="footer__title">Навигация</h4>
            <ul className="footer__links">
              <li><Link to={routes.home}>Главная</Link></li>
              <li><Link to={routes.notes}>Заметки</Link></li>
              <li><Link to={routes.folders}>Папки</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {currentYear} POMNI. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
