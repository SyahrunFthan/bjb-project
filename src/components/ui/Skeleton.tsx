import { color } from '@/assets/color';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  animationSpeed?: number;
  backgroundColor?: string;
  highlightColor?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  animationSpeed = 800,
  backgroundColor = color.neutral,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: animationSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: animationSpeed,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [animatedValue, animationSpeed]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
          opacity,
        } as Animated.AnimatedProps<ViewStyle>,
        style,
      ]}
    />
  );
};

// Komponen preset untuk kasus umum
interface SkeletonTextProps {
  lines?: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({ lines = 1, gap = 8, style }) => {
  return (
    <View style={[styles.textContainer, { gap }, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} width={index === lines - 1 ? '80%' : '100%'} height={14} borderRadius={4} />
      ))}
    </View>
  );
};

interface SkeletonCircleProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({ size = 50, style }) => {
  return <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />;
};

interface SkeletonCardProps {
  style?: StyleProp<ViewStyle>;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ style }) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <SkeletonCircle size={40} />
        <View style={styles.cardHeaderText}>
          <Skeleton width={120} height={16} borderRadius={4} />
          <Skeleton width={80} height={12} borderRadius={4} />
        </View>
      </View>
      <SkeletonText lines={3} />
    </View>
  );
};

export default Skeleton;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  skeleton: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    width: '100%',
  },
  card: {
    backgroundColor: color.white,
    borderRadius: 10,
    padding: 15,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
    gap: 6,
  },
});
