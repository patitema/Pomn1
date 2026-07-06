import './Footer.css';

const Footer = () => {
  return (
    <footer>
      <div className="footer-container">
        <h3>ОБРАТНАЯ СВЯЗЬ</h3>
        <p>ТЕЛЕФОН: <span>+79059884353</span></p>
        <div className="footer-links" aria-label="Правовая информация">
          <a href="/privacy">Политика конфиденциальности</a>
          <a href="/terms">Условия использования</a>
        </div>
        <div className="callback-images">
          <a href="https://t.me/example" aria-label="Telegram">
            <img src="/images/TG.webp" alt="Telegram" />
          </a>
          <a href="https://wa.me/79059884353" aria-label="WhatsApp">
            <img src="/images/Whatsapp.webp" alt="WhatsApp" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
