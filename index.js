/**
 * @format
 */

import { backgroundMessageHandler } from '@/lib/notification';
import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register background handler for Firebase Cloud Messaging
messaging().setBackgroundMessageHandler(backgroundMessageHandler);

AppRegistry.registerComponent(appName, () => App);
