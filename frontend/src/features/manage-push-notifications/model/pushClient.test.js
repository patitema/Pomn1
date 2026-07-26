import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PUSH_CAPABILITY,
  detectPushCapability,
  getCurrentPushSubscription,
  subscribeToPush,
  urlBase64ToUint8Array,
} from './pushClient';


const originalNavigator = globalThis.navigator;
const originalNotification = globalThis.Notification;
const originalPushManager = globalThis.PushManager;

const setNavigator = (value) => {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value,
  });
};

const setNotification = (value) => {
  Object.defineProperty(globalThis, 'Notification', {
    configurable: true,
    value,
  });
};

afterEach(() => {
  vi.restoreAllMocks();
  setNavigator(originalNavigator);
  setNotification(originalNotification);
  Object.defineProperty(globalThis, 'PushManager', {
    configurable: true,
    value: originalPushManager,
  });
});

describe('pushClient', () => {
  it('detects supported push without requesting permission', () => {
    const requestPermission = vi.fn();
    setNavigator({
      userAgent: 'Desktop',
      serviceWorker: {},
    });
    setNotification({
      permission: 'default',
      requestPermission,
    });
    Object.defineProperty(globalThis, 'PushManager', {
      configurable: true,
      value: class PushManager {},
    });

    expect(detectPushCapability()).toBe(PUSH_CAPABILITY.supported);
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it('finds the service worker registration by root scope', async () => {
    const subscription = { endpoint: 'https://push.example/current' };
    const update = vi.fn().mockResolvedValue(undefined);
    const getRegistration = vi.fn().mockResolvedValue({
      update,
      pushManager: {
        getSubscription: vi.fn().mockResolvedValue(subscription),
      },
    });
    setNavigator({
      userAgent: 'Desktop',
      serviceWorker: { getRegistration },
    });

    await expect(getCurrentPushSubscription()).resolves.toBe(subscription);
    expect(getRegistration).toHaveBeenCalledWith('/');
    expect(update).toHaveBeenCalledOnce();
  });

  it('reuses an existing browser subscription', async () => {
    const existingSubscription = {
      endpoint: 'https://push.example/current',
    };
    const subscribe = vi.fn();
    const register = vi.fn().mockResolvedValue({
      pushManager: {
        getSubscription: vi.fn().mockResolvedValue(existingSubscription),
        subscribe,
      },
    });
    setNavigator({
      userAgent: 'Desktop',
      serviceWorker: { register },
    });
    setNotification({
      permission: 'granted',
      requestPermission: vi.fn(),
    });
    Object.defineProperty(globalThis, 'PushManager', {
      configurable: true,
      value: class PushManager {},
    });

    await expect(subscribeToPush('AQAB')).resolves.toBe(existingSubscription);
    expect(register).toHaveBeenCalledWith('/push-service-worker.js');
    expect(subscribe).not.toHaveBeenCalled();
  });

  it('converts a VAPID public key to bytes', () => {
    expect(Array.from(urlBase64ToUint8Array('AQAB'))).toEqual([1, 0, 1]);
  });
});
