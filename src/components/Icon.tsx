import Icon from '@react-native-vector-icons/material-icons';
import { MaterialIconsIconName } from '@react-native-vector-icons/material-icons/static';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

interface Props {
  name?: MaterialIconsIconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const AppIcon = ({ name, size, color, style }: Props) => {
  if (!name) return null;
  return <Icon name={name} size={size} color={color} style={style} />;
};

export default AppIcon;
