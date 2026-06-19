import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import api from './api';
import { getData } from './storage';
import { ModalProps } from '@/contexts/ModalContext';

/**
 * Create Android Notification Channel & request permissions (required for Android 8.0+ / API 26+)
 * Firebase automatically creates the channel when receiving a notification with a channelId,
 * but we must request POST_NOTIFICATIONS permission on Android 13+ (API 33+).
 */
export const createNotificationChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;

  try {
    // For Android 13+ (API 33), request POST_NOTIFICATIONS permission
    // Without this, notifications will be silently blocked
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      console.log('[Notification] POST_NOTIFICATIONS permission:', granted);
    }

    console.log('[Notification] Android notification channel setup complete.');
  } catch (error) {
    console.error('[Notification] Error creating notification channel:', error);
  }
};

/**
 * Request notification permissions from the user (primarily for iOS & Android 13+)
 */
export const requestUserPermission = async (): Promise<boolean> => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log('[Notification] Authorization status:', authStatus);
    return enabled;
  } catch (error) {
    console.error('[Notification] Error requesting permission:', error);
    return false;
  }
};

/**
 * Get the current FCM token of the device
 */
export const getFcmToken = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestUserPermission();
    if (!hasPermission) {
      console.log('[Notification] Notification permission not granted.');
      return null;
    }

    const fcmToken = await messaging().getToken();
    console.log('[Notification] Device FCM Token:', fcmToken);
    return fcmToken;
  } catch (error) {
    console.error('[Notification] Error getting FCM token:', error);
    return null;
  }
};

/**
 * Upload the FCM token to the backend database
 */
export const uploadFcmToken = async (token: string): Promise<boolean> => {
  try {
    const response = await api.post('/auth/fcm-token', { fcm_token: token });
    if (response.status === 200) {
      console.log('[Notification] FCM token uploaded to backend successfully.');
      return true;
    }
    return false;
  } catch (error) {
    console.error('[Notification] Failed to upload FCM token to backend:', error);
    return false;
  }
};

/**
 * Retrieve the FCM token and register it to the backend for the currently authenticated user
 */
export const registerDeviceForNotifications = async (): Promise<void> => {
  try {
    // Verify if user is logged in
    const authUser = await getData('auth');
    if (!authUser) {
      console.log('[Notification] User not authenticated. Skipping FCM registration.');
      return;
    }

    const token = await getFcmToken();
    if (token) {
      await uploadFcmToken(token);
    }
  } catch (error) {
    console.error('[Notification] Error during device registration:', error);
  }
};

/**
 * Initialize listeners for foreground, background, and quit states
 */
export const setupNotificationListeners = (
  modal: ModalProps,
  onNotificationReceivedForeground?: (title: string, body: string, data?: any) => void,
) => {
  // 1. Foreground message handler
  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    console.log('[Notification] Message received in foreground:', remoteMessage);
    
    const title = remoteMessage.notification?.title || 'Notifikasi Baru';
    const body = remoteMessage.notification?.body || '';
    
    if (onNotificationReceivedForeground) {
      onNotificationReceivedForeground(title, body, remoteMessage.data);
    } else {
      modal.result.success(title, body);
    }
  });

  // 2. Notification opened app from background state handler
  const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('[Notification] App opened from background state by notification click:', remoteMessage);
    // Add custom navigation logic here if needed (e.g. redirect to Notification/Payment History screen)
  });

  // 3. Notification opened app from quit state handler
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('[Notification] App opened from quit state by notification click:', remoteMessage);
        // Add custom navigation logic here if needed
      }
    });

  // 4. Token refresh listener
  const unsubscribeTokenRefresh = messaging().onTokenRefresh(async token => {
    console.log('[Notification] FCM Token refreshed:', token);
    await uploadFcmToken(token);
  });

  // Return function to unsubscribe all listeners on cleanup
  return () => {
    unsubscribeForeground();
    unsubscribeOpenedApp();
    unsubscribeTokenRefresh();
  };
};

/**
 * Service to handle background messages (Must be registered early, e.g., in index.js)
 */
export const backgroundMessageHandler = async (remoteMessage: any) => {
  console.log('[Notification] Message handled in the background:', remoteMessage);
  // Perform background task if needed
};
