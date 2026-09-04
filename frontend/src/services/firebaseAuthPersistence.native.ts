import { getReactNativePersistence } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';

const getSecureStoreKey = (key: string) => `firebase_auth_${key.replace(/[^A-Za-z0-9._-]/g, '_')}`;

export const isSecureAuthPersistenceAvailable = true;

export const nativeAuthPersistence = getReactNativePersistence({
  getItem: (key: string) => SecureStore.getItemAsync(getSecureStoreKey(key)),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(getSecureStoreKey(key), value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(getSecureStoreKey(key))
});
