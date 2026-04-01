import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@entities/user';
import { routes } from '@shared/config';

const ProfilePage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={routes.auth} replace />;
  }

  return (
    <div className="profile-page">
      <h1>Профиль</h1>
      <p>Информация о пользователе будет здесь</p>
    </div>
  );
};

export default ProfilePage;
