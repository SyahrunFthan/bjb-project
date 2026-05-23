import { color } from '@/assets/color';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle, StyleProp } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({ children, variant = 'default', style, contentStyle, onPress }) => {
  const Container = onPress ? TouchableOpacity : View;

  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevated;
      case 'outlined':
        return styles.outlined;
      case 'glass':
        return styles.glass;
      default:
        return styles.default;
    }
  };

  return (
    <Container activeOpacity={0.9} onPress={onPress} style={[styles.base, getVariantStyle(), style]}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </Container>
  );
};

export default Card;

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: color.white,
  },
  content: {
    padding: 16,
  },
  default: {
    backgroundColor: color.white,
  },
  elevated: {
    backgroundColor: color.white,
    shadowColor: color.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  outlined: {
    backgroundColor: color.white,
    borderWidth: 1,
    borderColor: color.border,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 5,
  },
});
