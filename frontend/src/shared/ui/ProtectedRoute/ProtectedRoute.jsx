import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@entities/user/model/selectors';
import { Loader } from '@shared/ui';
import { routes } from '@shared/config';

/**
 * Защищённый маршрут (для использования как element={<ProtectedRoute />})
 */
const ProtectedRoute = () => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated === undefined || isAuthenticated === null) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={routes.auth} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
