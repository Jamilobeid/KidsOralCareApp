import { Alert as NativeAlert, Platform } from 'react-native';

export const appAlert = {
  alert: (title: string, message?: string) => {
    if (Platform.OS === 'web') {
      const browserAlert = (globalThis as typeof globalThis & {
        alert?: (text: string) => void;
      }).alert;
      browserAlert?.(message ? `${title}\n\n${message}` : title);
      return;
    }

    NativeAlert.alert(title, message);
  }
};
