import { RegistrationForm } from '../../features/auth-by-registration/index.js';
import { Header } from '../../widgets/header/index.js';
import { Footer } from '../../widgets/footer/index.js';
import './RegistrationPage.css';

const RegistrationPage = () => {
  return (
    <div className="registration-page">
      <Header />
      
      <main className="registration-page__content">
        <div className="registration-page__container">
          <RegistrationForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RegistrationPage;
