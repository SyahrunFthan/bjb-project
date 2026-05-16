import { AbstractGlow } from '@/assets/images';
import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface AuthBackgroundProps {
  children?: React.ReactNode;
}

const AuthBackground: React.FC<AuthBackgroundProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.baseBackground} />

      <View style={[styles.glowCircle, styles.circle1]} />
      <View style={[styles.glowCircle, styles.circle2]} />
      <View style={[styles.glowCircle, styles.circle3]} />

      <View style={styles.imageContainer}>
        <Image source={AbstractGlow} style={styles.abstractGlow} blurRadius={50} />
      </View>

      <View style={styles.content}>{children}</View>
    </View>
  );
};

export default AuthBackground;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  baseBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#EFF6FF',
  },
  glowCircle: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    opacity: 0.3,
  },
  circle1: {
    top: -width * 0.2,
    left: -width * 0.2,
    backgroundColor: '#D4E3FF',
  },
  circle2: {
    top: height * 0.2,
    right: -width * 0.3,
    backgroundColor: '#E0E7FF',
    width: width,
    height: width,
  },
  circle3: {
    bottom: -width * 0.1,
    left: width * 0.1,
    backgroundColor: '#EEF2FF',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 1.5,
    height: width * 1.5,
    opacity: 0.2,
    transform: [{ translateX: width * 0.5 }, { translateY: -width * 0.5 }],
  },
  abstractGlow: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  content: {
    flex: 1,
  },
});
