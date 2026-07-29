import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type BrushingPeriod = 'morning' | 'evening';

const REMINDER_CHANNEL_ID = 'brushing-reminders';

const hasNotificationPermission = (permissions: Notifications.NotificationPermissionsStatus) =>
  permissions.granted ||
  permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL ||
  permissions.ios?.status === Notifications.IosAuthorizationStatus.EPHEMERAL;

export const configureNotifications = async () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false
    })
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Brushing reminders',
      description: 'Morning and evening tooth-brushing reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250]
    });
  }
};

export const requestReminderPermission = async () => {
  const current = await Notifications.getPermissionsAsync();
  if (hasNotificationPermission(current)) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return hasNotificationPermission(requested);
};

export const scheduleDailyReminder = async (
  label: string,
  time: string,
  period: BrushingPeriod) => {
  const [hour, minute] = time.split(':').map(Number);

  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error(`Invalid reminder time: ${time}`);
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: label,
      body: 'Time to brush for a healthy smile!',
      sound: 'default',
      data: {
        type: 'brushing-reminder',
        period
      }
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      channelId: REMINDER_CHANNEL_ID
    }
  });
};

export const cancelBrushingReminders = async () => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const brushingReminders = scheduled.filter(
    (notification) => notification.content.data?.type === 'brushing-reminder'
  );

  await Promise.all(
    brushingReminders.map((notification) =>
      Notifications.cancelScheduledNotificationAsync(notification.identifier)
    )
  );
};

export const scheduleTestReminder = async () =>
  Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test brushing reminder',
      body: 'Tap here to open the brushing screen.',
      sound: 'default',
      data: {
        type: 'brushing-reminder',
        period: new Date().getHours() < 15 ? 'morning' : 'evening',
        isTest: true
      }
    },
    trigger: {
      seconds: 5,
      channelId: REMINDER_CHANNEL_ID
    }
  });
