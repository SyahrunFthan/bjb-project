import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { fonts } from '@/assets/fonts';

interface AppTextProps extends TextProps {
  variant?: 'regular' | 'medium' | 'semiBold' | 'bold';
}

export const AppText: React.FC<AppTextProps> = ({
  style,
  variant = 'regular',
  ...props
}) => {
  const fontFamily = fonts[variant];

  return (
    <Text style={[{ fontFamily }, styles.defaultText, style]} {...props} />
  );
};

const styles = StyleSheet.create({
  defaultText: {
    color: '#000000', // Default color
  },
});
