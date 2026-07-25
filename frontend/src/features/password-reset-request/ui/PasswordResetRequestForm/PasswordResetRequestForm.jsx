import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequestPasswordResetMutation } from '@shared/api';
import { routes } from '@shared/config';
import { Button, Input } from '@shared/ui';
import './PasswordResetRequestForm.css';

const PasswordResetRequestForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [requestPasswordReset, { isLoading, error }] =
    useRequestPasswordResetMutation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const result = await requestPasswordReset({ email }).unwrap();
      setMessage(result.message);
    } catch {
      setMessage('');
    }
  };

  const errorMessage =
    error?.data?.email?.[0] ||
    error?.data?.message ||
    (error ? 'Не удалось отправить запрос. Попробуйте позже.' : '');

  return (
    <form className="password-reset-form" onSubmit={handleSubmit}>
      <h1 className="password-reset-form__title">
        Восстановление пароля
      </h1>

      {message ? (
        <div
          className="password-reset-form__message"
          role="status"
        >
          {message}
        </div>
      ) : (
        <>
          <p className="password-reset-form__description">
            Укажите email, который использовали при регистрации.
          </p>

          {errorMessage && (
            <div
              className="password-reset-form__error"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <Input
            autoComplete="email"
            label="Email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />

          <Button
            className="password-reset-form__button"
            disabled={isLoading}
            fullWidth
            type="submit"
          >
            {isLoading ? 'Отправляем...' : 'Получить ссылку'}
          </Button>
        </>
      )}

      <p className="password-reset-form__footer">
        <Link to={routes.auth}>Вернуться ко входу</Link>
      </p>
    </form>
  );
};

export default PasswordResetRequestForm;
