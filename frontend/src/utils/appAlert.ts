import { Alert as NativeAlert, AlertButton, Platform } from 'react-native';

export const appAlert = {
  alert: (title: string, message?: string, buttons?: AlertButton[]) => {
    if (Platform.OS === 'web') {
      const browserAlert = (globalThis as typeof globalThis & {
        alert?: (text: string) => void;
      }).alert;
      browserAlert?.(message ? `${title}\n\n${message}` : title);
      buttons?.find((button) => button.style !== 'cancel')?.onPress?.();
      return;
    }

    NativeAlert.alert(title, message, buttons);
  }
};
