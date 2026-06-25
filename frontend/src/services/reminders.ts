import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const configureNotifications = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('brushing-reminders', {
      name: 'Brushing reminders',
      importance: Notifications.AndroidImportance.HIGH
    });
  }
};

export const scheduleDailyReminder = async (label: string, time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  const permissions = await Notifications.requestPermissionsAsync();
  if (!permissions.granted) return null;

  return Notifications.scheduleNotificationAsync({
    content: { title: label, body: 'Time to brush for a healthy smile.' },
    trigger: { hour, minute, repeats: true, channelId: 'brushing-reminders' }
  });
};
