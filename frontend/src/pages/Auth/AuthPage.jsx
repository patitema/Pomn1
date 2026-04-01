import { LoginForm } from '@features/auth-by-login';

const AuthPage = () => {
  return (
    <div className="auth-page">
      <h1>Вход</h1>
      <LoginForm />
    </div>
  );
};

export default AuthPage;
