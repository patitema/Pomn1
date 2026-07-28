import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@entities/user/model/selectors';
import { routes } from '@shared/config';
import { getHomePageCtaState } from './model/homePageModel';
import { HomePageView } from './HomePageView';

const HomePage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { landingLink, headerLabel, mainLabel } = getHomePageCtaState(isAuthenticated, routes);

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
