import { LoginForm } from '../../features/auth-by-login';
import './AuthPage.css';

const AuthPage = () => {
  return (
    <div className="page-container page-container--centered">
      <div className="auth-container">
        <LoginForm />
      </div>
    </div>
  );
};

export default AuthPage;
