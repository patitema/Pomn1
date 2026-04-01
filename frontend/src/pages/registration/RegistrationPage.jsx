import { RegistrationForm } from '../../features/auth-by-registration';
import { Header } from '../../widgets/header';
import { Footer } from '../../widgets/footer';
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
