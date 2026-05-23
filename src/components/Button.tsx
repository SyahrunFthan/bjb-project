import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';

import { color } from '@/assets/color';

interface Props extends TouchableOpacityProps {
  title: string;
  type?: 'default' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}

const Button = ({ title, type = 'default', size = 'medium', loading = false, disabled, style, ...rest }: Props) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = { ...styles.button, ...(styles[size as keyof typeof styles] as ViewStyle) };

    if (disabled || loading) {
      return { ...baseStyle, backgroundColor: color.neutral, borderColor: color.neutral, opacity: 0.7 };
    }

    switch (type) {
      case 'outline':
        return { ...baseStyle, backgroundColor: 'transparent', borderWidth: 1, borderColor: color.primary };
      case 'ghost':
        return { ...baseStyle, backgroundColor: 'transparent' };
      default:
        return { ...baseStyle, backgroundColor: color.primary };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseText: TextStyle = { ...styles.text, ...(styles[`${size}Text` as keyof typeof styles] as TextStyle) };

    if (disabled || loading) {
      return { ...baseText, color: color.white };
    }

    switch (type) {
      case 'outline':
      case 'ghost':
        return { ...baseText, color: color.primary };
      default:
        return { ...baseText, color: color.white };
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.8} disabled={disabled || loading} style={[getButtonStyle(), style]} {...rest}>
      {loading ? <ActivityIndicator color={type === 'default' ? color.white : color.primary} /> : <Text style={getTextStyle()}>{title}</Text>}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 80,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 120,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minWidth: 160,
  },
  smallText: { fontSize: 12 },
  mediumText: { fontSize: 16 },
  largeText: { fontSize: 18 },
});
