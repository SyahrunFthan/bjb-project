/**
 * @format
 */

import React from 'react';
import { AppRegistry, Text, TextInput } from 'react-native';
import { fonts } from '@/assets/fonts';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import { backgroundMessageHandler } from '@/lib/notification';

// Register background handler for Firebase Cloud Messaging
messaging().setBackgroundMessageHandler(backgroundMessageHandler);

// Set global font family
const oldTextRender = Text.render;
Text.render = function (...args) {
  const origin = oldTextRender.call(this, ...args);
  return React.cloneElement(origin, {
    style: [{ fontFamily: fonts.regular }, origin.props.style],
  });
};

// Alternative for newer RN versions where Text.render might not work as expected
// We can use defaultProps if they still work, or just recommend AppText
if (Text.defaultProps) {
  Text.defaultProps.style = { fontFamily: fonts.regular };
} else {
  Text.defaultProps = {
    style: { fontFamily: fonts.regular },
  };
}

if (TextInput.defaultProps) {
  TextInput.defaultProps.style = { fontFamily: fonts.regular };
} else {
  TextInput.defaultProps = {
    style: { fontFamily: fonts.regular },
  };
}

AppRegistry.registerComponent(appName, () => App);
