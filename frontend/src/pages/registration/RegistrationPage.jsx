import { RegistrationForm } from '../../features/auth-by-registration';
import './RegistrationPage.css';

const RegistrationPage = () => {
  return (
    <div className="page-container page-container--centered">
      <div className="auth-container">
        <RegistrationForm />
      </div>
    </div>
  );
};

export default RegistrationPage;
