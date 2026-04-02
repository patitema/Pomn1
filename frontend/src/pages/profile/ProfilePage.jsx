import { useState } from 'react';
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
    username: user?.username || '',
    email: user?.email || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

    try {
      await updateProfile(formData).unwrap();
      setSuccessMessage('Профиль обновлён');
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <div className="page-container page-container--centered">
      <div className="profile-container">
        <h1 className="profile-title">Профиль</h1>

        {successMessage && (
          <div className="profile-success">{successMessage}</div>
        )}

        <form className="profile-form" onSubmit={handleSubmit}>
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

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </form>

        <div className="profile-logout">
          <Button variant="danger" onClick={handleLogout}>
            Выйти
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
