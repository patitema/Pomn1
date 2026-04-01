import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '@shared/api';
import { setToken, setUser } from '@features/auth-by-login/model/authSlice';
import { Input, Button } from '@shared/ui';
import { routes } from '@shared/config';
import './RegistrationForm.css';

const RegistrationForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading, error }] = useRegisterMutation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('Пароль должен быть не менее 6 символов');
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData).unwrap();
      dispatch(setToken(result.token));
      dispatch(setUser(result.user));
      navigate(routes.notes);
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form className="registration-form" onSubmit={handleSubmit}>
      <h2 className="registration-form__title">Регистрация</h2>
      
      {(error || validationError) && (
        <div className="registration-form__error">
          {error?.data?.message || error?.message || validationError}
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
        type="email"
        placeholder="Email"
        name="email"
        value={formData.email}
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
      
      <Input
        type="password"
        placeholder="Подтвердите пароль"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
      />
      
      <Button type="submit" disabled={isLoading} className="registration-form__button">
        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
      </Button>
      
      <p className="registration-form__footer">
        Уже есть аккаунт? <Link to={routes.auth}>Войти</Link>
      </p>
    </form>
  );
};

export default RegistrationForm;
