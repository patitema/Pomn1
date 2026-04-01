import { LoginForm } from '@features/auth-by-login';
import { Header } from '@widgets/header';
import { Footer } from '@widgets/footer';
import './AuthPage.css';

const AuthPage = () => {
  return (
    <div className="auth-page">
      <Header />
      
      <main className="auth-page__content">
        <div className="auth-page__container">
          <LoginForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AuthPage;
