import 'firebase/auth';

declare module 'firebase/auth' {
  /**
   * Firebase exposes this helper from its React Native runtime entry point,
   * but its default declaration file omits the platform-specific export.
   */
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
