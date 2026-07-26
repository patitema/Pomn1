export const PUSH_CAPABILITY = {
  supported: 'supported',
  denied: 'denied',
  unsupported: 'unsupported',
  iosInstallRequired: 'ios-install-required',
};

const isIosDevice = () => (
  /iphone|ipad|ipod/i.test(globalThis.navigator?.userAgent || '')
  || (
    globalThis.navigator?.platform === 'MacIntel'
    && globalThis.navigator?.maxTouchPoints > 1
  )
);

const isStandalone = () => (
  globalThis.navigator?.standalone === true
  || globalThis.matchMedia?.('(display-mode: standalone)').matches === true
);

export const detectPushCapability = () => {
  if (isIosDevice() && !isStandalone()) {
    return PUSH_CAPABILITY.iosInstallRequired;
  }
  if (
    !('serviceWorker' in globalThis.navigator)
    || !('PushManager' in globalThis)
    || !('Notification' in globalThis)
  ) {
    return PUSH_CAPABILITY.unsupported;
  }
  if (globalThis.Notification.permission === 'denied') {
    return PUSH_CAPABILITY.denied;
  }
  return PUSH_CAPABILITY.supported;
};

export const getBrowserTimezone = () => (
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
);

export const urlBase64ToUint8Array = (value) => {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const bytes = globalThis.atob(base64);
  return Uint8Array.from(bytes, (character) => character.charCodeAt(0));
};

const getServiceWorkerRegistration = async () => {
  if (!('serviceWorker' in globalThis.navigator)) return null;
  const registration = await globalThis.navigator.serviceWorker.getRegistration('/');
  if (!registration) return null;
  try {
    await registration.update?.();
  } catch {
    return registration;
  }
  return registration;
};

export const getCurrentPushSubscription = async () => {
  const registration = await getServiceWorkerRegistration();
  if (!registration) return null;
  return registration.pushManager.getSubscription();
};

export const subscribeToPush = async (publicKey) => {
  const capability = detectPushCapability();
  if (capability !== PUSH_CAPABILITY.supported) {
    const error = new Error(capability);
    error.code = capability;
    throw error;
  }

  const registration = await globalThis.navigator.serviceWorker.register(
    '/push-service-worker.js',
  );
  let permission = globalThis.Notification.permission;
  if (permission === 'default') {
    permission = await globalThis.Notification.requestPermission();
  }
  if (permission !== 'granted') {
    const error = new Error(PUSH_CAPABILITY.denied);
    error.code = PUSH_CAPABILITY.denied;
    throw error;
  }

  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) return existingSubscription;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
};

export const unsubscribeFromPush = async () => {
  const subscription = await getCurrentPushSubscription();
  if (!subscription) return null;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  return endpoint;
};
