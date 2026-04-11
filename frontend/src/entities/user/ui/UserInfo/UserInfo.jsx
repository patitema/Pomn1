import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../model/selectors';
import { getInitials, formatUserName } from '../../model/helpers';
import './UserInfo.css';

const UserInfo = () => {
  const user = useSelector(selectCurrentUser);

  if (!user) return null;

  return (
    <div className="user-info">
      <div className="user-info__avatar">
        {getInitials(formatUserName(user))}
      </div>
      <div className="user-info__details">
        <span className="user-info__name">{formatUserName(user)}</span>
        <span className="user-info__email">{user.email}</span>
      </div>
    </div>
  );
};

export default UserInfo;
