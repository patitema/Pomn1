import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@entities/user/model/selectors';
import { routes } from '@shared/config';
import { HomePageView } from './HomePageView';

const HomePage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const landingLink = isAuthenticated ? routes.notes : routes.auth;
  const headerLabel = isAuthenticated ? 'Перейти к заметкам' : 'Начать';
  const mainLabel = isAuthenticated ? 'Перейти к заметкам' : 'Начать пользоваться';

  return (
    <HomePageView
      headerCtaLabel={headerLabel}
      mainCtaLabel={mainLabel}
      renderCta={(className, label) => (
        <Link to={landingLink} className={className}>
          {label}
        </Link>
      )}
    />
  );
};

export default HomePage;
