import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../../../../shared/api/index.js';
import { setToken, setUser } from '../../model/authSlice';
import { Input, Button } from '../../../../shared/ui/index.js';
import { routes } from '../../../../shared/config/index.js';
import './LoginForm.css';

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(formData).unwrap();
      dispatch(setToken(result.token));
      dispatch(setUser(result.user));
      navigate(routes.notes);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2 className="login-form__title">Вход</h2>
      
      {error && (
        <div className="login-form__error">
          {error?.data?.message || error?.message || 'Ошибка входа'}
        </div>
      )}
      
      <Input
        type="text"
        placeholder="Имя пользователя"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
      />
      
      <Input
        type="password"
        placeholder="Пароль"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      
      <Button type="submit" disabled={isLoading} className="login-form__button">
        {isLoading ? 'Вход...' : 'Войти'}
      </Button>
      
      <p className="login-form__footer">
        Нет аккаунта? <Link to={routes.registration}>Зарегистрироваться</Link>
      </p>
    </form>
  );
};

export default LoginForm;
