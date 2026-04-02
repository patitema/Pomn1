import './Footer.css';

const Footer = () => {
  return (
    <footer>
      <div className="footer-container">
        <h3>ОБРАТНАЯ СВЯЗЬ</h3>
        <p>ТЕЛЕФОН: <span>+79059884353</span></p>
        <div className="callback-images">
          <a href="https://t.me/example">
            <img src="/images/TG.png" alt="Telegram" />
          </a>
          <a href="https://wa.me/79059884353">
            <img src="/images/Whatsapp.png" alt="WhatsApp" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
