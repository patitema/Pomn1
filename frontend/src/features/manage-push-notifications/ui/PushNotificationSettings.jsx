import { useEffect, useMemo, useState } from 'react';
import {
  useGetPushSettingsQuery,
  useRemovePushSubscriptionMutation,
  useSavePushSubscriptionMutation,
  useUpdatePushSettingsMutation,
} from '@shared/api';
import { Button } from '@shared/ui';
import {
  PUSH_CAPABILITY,
  detectPushCapability,
  getBrowserTimezone,
  getCurrentPushSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from '../model/pushClient';
import './PushNotificationSettings.css';

const capabilityMessages = {
  [PUSH_CAPABILITY.denied]: (
    'Уведомления запрещены в настройках браузера. Разрешите их для POMNI и обновите страницу.'
  ),
  [PUSH_CAPABILITY.unsupported]: (
    'Этот браузер не поддерживает системные Web Push уведомления.'
  ),
  [PUSH_CAPABILITY.iosInstallRequired]: (
    'На iPhone и iPad сначала добавьте POMNI на экран «Домой», затем откройте установленное приложение.'
  ),
};

const PushNotificationSettings = () => {
  const { data: settings, isLoading } = useGetPushSettingsQuery();
  const [saveSubscription] = useSavePushSubscriptionMutation();
  const [removeSubscription] = useRemovePushSubscriptionMutation();
  const [updateSettings] = useUpdatePushSettingsMutation();
  const [hasCurrentSubscription, setHasCurrentSubscription] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const capability = useMemo(() => detectPushCapability(), []);

  useEffect(() => {
    let isActive = true;
    getCurrentPushSubscription()
      .then((subscription) => {
        if (isActive) setHasCurrentSubscription(Boolean(subscription));
      })
      .catch(() => {
        if (isActive) setHasCurrentSubscription(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  const handleEnable = async () => {
    setIsSubmitting(true);
    setMessage('');
    setErrorMessage('');
    try {
      if (!settings?.available || !settings?.vapid_public_key) {
        throw new Error('Push уведомления пока не настроены на сервере.');
      }

      const subscription = await subscribeToPush(settings.vapid_public_key);
      await saveSubscription(subscription.toJSON()).unwrap();
      await updateSettings({
        push_enabled: true,
        timezone: getBrowserTimezone(),
      }).unwrap();
      setHasCurrentSubscription(true);
      setMessage('Push уведомления включены на этом устройстве.');
    } catch (error) {
      if (error.code === PUSH_CAPABILITY.denied) {
        setErrorMessage(capabilityMessages[PUSH_CAPABILITY.denied]);
      } else {
        setErrorMessage(
          error.data?.detail
          || error.data?.error
          || error.message
          || 'Не удалось включить push уведомления.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisable = async () => {
    setIsSubmitting(true);
    setMessage('');
    setErrorMessage('');
    try {
      const endpoint = await unsubscribeFromPush();
      if (endpoint) {
        await removeSubscription({ endpoint }).unwrap();
      }
      setHasCurrentSubscription(false);
      setMessage('Push уведомления отключены на этом устройстве.');
    } catch (error) {
      setErrorMessage(
        error.data?.detail
        || error.data?.error
        || 'Не удалось отключить push уведомления.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const unavailableMessage = capabilityMessages[capability];
  const canEnable = (
    capability === PUSH_CAPABILITY.supported
    && settings?.available
    && !hasCurrentSubscription
  );

  return (
    <section className="push-settings" aria-labelledby="push-settings-title">
      <div className="push-settings__heading">
        <div>
          <h2 id="push-settings-title">Push уведомления</h2>
          <p>
            В 09:00 напомним о задачах на сегодня и просроченных.
            О дедлайне предупредим за 24 часа.
          </p>
        </div>
        <span
          className={`push-settings__status ${
            hasCurrentSubscription ? 'push-settings__status--enabled' : ''
          }`}
        >
          {hasCurrentSubscription ? 'Включены' : 'Выключены'}
        </span>
      </div>

      {isLoading && <p className="push-settings__note">Проверяем настройки…</p>}
      {unavailableMessage && (
        <p className="push-settings__warning">{unavailableMessage}</p>
      )}
      {!settings?.available && !isLoading && !unavailableMessage && (
        <p className="push-settings__warning">
          Push уведомления пока не настроены на сервере.
        </p>
      )}
      {message && <p className="push-settings__success">{message}</p>}
      {errorMessage && (
        <p className="push-settings__error" role="alert">{errorMessage}</p>
      )}

      <div className="push-settings__actions">
        {hasCurrentSubscription ? (
          <Button
            variant="secondary"
            onClick={handleDisable}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Отключение…' : 'Отключить на этом устройстве'}
          </Button>
        ) : (
          <Button
            onClick={handleEnable}
            disabled={isSubmitting || !canEnable}
          >
            {isSubmitting ? 'Включение…' : 'Включить на этом устройстве'}
          </Button>
        )}
      </div>
    </section>
  );
};

export default PushNotificationSettings;
