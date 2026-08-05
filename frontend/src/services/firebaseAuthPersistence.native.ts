import { getReactNativePersistence } from 'firebase/auth';
import { requireOptionalNativeModule } from 'expo-modules-core';
import type * as SecureStoreApi from 'expo-secure-store';

// A stale Expo development client may not contain ExpoSecureStore even though
// the JavaScript dependency is installed. Avoid loading its JS wrapper until
// the corresponding native module is known to exist, otherwise the app fails
// during module initialization before it can render an error or recovery UI.
const hasSecureStore = Boolean(requireOptionalNativeModule('ExpoSecureStore'));
const secureStore: typeof SecureStoreApi | null = hasSecureStore ? require('expo-secure-store') : null;
const memoryStore = new Map<string, string>();
const getSecureStoreKey = (key: string) => `firebase_auth_${key.replace(/[^A-Za-z0-9._-]/g, '_')}`;

export const isSecureAuthPersistenceAvailable = Boolean(secureStore);

export const nativeAuthPersistence = getReactNativePersistence({
  getItem: (key: string) =>
    secureStore ? secureStore.getItemAsync(getSecureStoreKey(key)) : Promise.resolve(memoryStore.get(key) ?? null),
  setItem: (key: string, value: string) => {
    if (secureStore) return secureStore.setItemAsync(getSecureStoreKey(key), value);
    memoryStore.set(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    if (secureStore) return secureStore.deleteItemAsync(getSecureStoreKey(key));
    memoryStore.delete(key);
    return Promise.resolve();
  }
});
