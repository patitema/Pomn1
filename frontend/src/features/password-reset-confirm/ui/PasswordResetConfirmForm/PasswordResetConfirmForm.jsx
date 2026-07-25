import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useConfirmPasswordResetMutation } from '@shared/api';
import { routes } from '@shared/config';
import { Button, Input } from '@shared/ui';
import './PasswordResetConfirmForm.css';

const PasswordResetConfirmForm = () => {
  const { uid, token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmReset, { isLoading, error }] =
    useConfirmPasswordResetMutation();

  useEffect(() => {
    const existingMeta = document.querySelector('meta[name="referrer"]');
    const previousContent = existingMeta?.getAttribute('content');
    const meta = existingMeta || document.createElement('meta');

    if (!existingMeta) {
      meta.setAttribute('name', 'referrer');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'no-referrer');

    return () => {
      if (!existingMeta) {
        meta.remove();
      } else if (previousContent) {
        meta.setAttribute('content', previousContent);
      } else {
        meta.removeAttribute('content');
      }
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setLocalError('Пароли не совпадают');
      return;
    }

    try {
      const result = await confirmReset({
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }).unwrap();
      setSuccessMessage(result.message);
    } catch {
      setSuccessMessage('');
    }
  };

  const serverError =
    error?.data?.new_password?.[0] ||
    error?.data?.confirm_password?.[0] ||
    error?.data?.message ||
    (error ? 'Не удалось изменить пароль.' : '');
  const errorMessage = localError || serverError;

  return (
    <form className="password-reset-form" onSubmit={handleSubmit}>
      <h1 className="password-reset-form__title">Новый пароль</h1>

      {successMessage ? (
        <div
          className="password-reset-form__message"
          role="status"
        >
          {successMessage}
        </div>
      ) : (
        <>
          <p className="password-reset-form__description">
            Пароль должен содержать минимум 8 символов, цифру
            и один из знаков !, _ или -.
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
            autoComplete="new-password"
            label="Новый пароль"
            name="new_password"
            onChange={(event) => setNewPassword(event.target.value)}
            required
            type="password"
            value={newPassword}
          />
          <Input
            autoComplete="new-password"
            label="Повторите пароль"
            name="confirm_password"
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            type="password"
            value={confirmPassword}
          />

          <Button
            className="password-reset-form__button"
            disabled={isLoading}
            fullWidth
            type="submit"
          >
            {isLoading ? 'Сохраняем...' : 'Изменить пароль'}
          </Button>
        </>
      )}

      <p className="password-reset-form__footer">
        <Link to={routes.auth}>
          {successMessage ? 'Перейти ко входу' : 'Вернуться ко входу'}
        </Link>
      </p>
    </form>
  );
};

export default PasswordResetConfirmForm;
