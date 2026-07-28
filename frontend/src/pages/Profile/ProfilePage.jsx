import { Input, Button, PhoneInput } from '@shared/ui'
import { PushNotificationSettings } from '@features/manage-push-notifications'
import { Footer } from '@widgets/footer'
import { useProfilePageModel } from './model/useProfilePageModel'
import './ProfilePage.css'

const ProfilePage = () => {
  const {
    errorMessage,
    formData,
    handleChange,
    handleLogout,
    handleSubmit,
    isSubmitting,
    successMessage,
    user,
  } = useProfilePageModel()

  return (
    <div className="page-container profile-page-shell">
      <div className="profile-page-layout">
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

            <PhoneInput
              label="Телефон"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange('phone_number')}
            />

            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </form>

          <PushNotificationSettings />

          <div className="profile-page__logout">
            <Button variant="danger" onClick={handleLogout}>
              Выйти
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProfilePage
