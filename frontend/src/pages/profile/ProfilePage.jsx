import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../../entities/user';
import { useLogoutMutation, useUpdateProfileMutation } from '../../shared/api';
import { Input, Button } from '../../shared/ui';
import { routes } from '../../shared/config';
import './ProfilePage.css';

const ProfilePage = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [logout] = useLogoutMutation();
  const [updateProfile] = useUpdateProfileMutation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
      });
    }
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to={routes.auth} replace />;
  }

  const handleLogout = async () => {
    await logout().unwrap();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await updateProfile(formData).unwrap();
      setSuccessMessage('Профиль обновлён');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setErrorMessage(err.data?.error || 'Ошибка обновления');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <div className="page-container">
      <div className="profile-page">
        <div className="profile-page__header">
          <div className="profile-page__avatar">
            {user?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="profile-page__info">
            <h1 className="profile-page__name">{user?.username || 'Пользователь'}</h1>
            <p className="profile-page__subtitle">Личный кабинет</p>
          </div>
        </div>

        {successMessage && (
          <div className="profile-page__success">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="profile-page__error">{errorMessage}</div>
        )}

        <form className="profile-page__form" onSubmit={handleSubmit}>
          <Input
            type="text"
            label="Имя пользователя"
            value={formData.username}
            onChange={handleChange('username')}
          />

          <Input
            type="email"
            label="Email"
            value={formData.email}
            onChange={handleChange('email')}
          />

          <Input
            type="tel"
            label="Телефон"
            value={formData.phone_number}
            onChange={handleChange('phone_number')}
          />

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </form>

        <div className="profile-page__logout">
          <Button variant="danger" onClick={handleLogout}>
            Выйти
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
