import { color } from '@/assets/color';
import { useTabBar } from '@/contexts/TabBarContext';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useRef } from 'react';
import { Animated, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icon';

const { width } = Dimensions.get('window');

const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { translateY } = useTabBar();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View style={[styles.tabBar, { height: 70 + insets.bottom, paddingBottom: insets.bottom }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          const isFocused = state.index === index;

          const onPress = () => {
            Animated.sequence([
              Animated.timing(scaleAnim, { toValue: 0.9, duration: 50, useNativeDriver: true }),
              Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
              Animated.timing(scaleAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
            ]).start();

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const getIcon = () => {
            switch (route.name) {
              case 'Dashboard':
                return 'dashboard';
              case 'History':
                return 'history';
              case 'Profile':
                return 'person';
              case 'CourierLoan':
                return '3p';
              case 'CustomerCourier':
                return 'group';
              case 'Monitoring':
                return 'insights';
              default:
                return 'help';
            }
          };

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={(options as any).tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              activeOpacity={0.7}>
              <Animated.View
                style={{
                  transform: [{ scale: isFocused ? scaleAnim : 1 }],
                  alignItems: 'center',
                }}>
                {isFocused && <View style={styles.indicator} />}
                <AppIcon name={getIcon() as any} size={28} color={isFocused ? color.primary : color.neutral} />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: color.white,
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
    height: 70,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: color.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  indicator: {
    position: 'absolute',
    top: -5,
    width: 24,
    height: 3,
    backgroundColor: color.primary,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});
