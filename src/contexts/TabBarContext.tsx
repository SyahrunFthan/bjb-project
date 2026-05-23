import React, { createContext, useContext, useRef } from 'react';
import { Animated } from 'react-native';

interface TabBarContextProps {
  translateY: Animated.Value;
  hideTabBar: () => void;
  showTabBar: () => void;
  onScroll: (event: any) => void;
}

const TabBarContext = createContext<TabBarContextProps | undefined>(undefined);

export const TabBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  const hideTabBar = () => {
    Animated.timing(translateY, {
      toValue: 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const showTabBar = () => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const onScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;

    if (currentScrollY > lastScrollY.current && currentScrollY > 5) {
      hideTabBar();
    } else if (currentScrollY < lastScrollY.current) {
      showTabBar();
    }

    lastScrollY.current = currentScrollY;
  };

  return <TabBarContext.Provider value={{ translateY, hideTabBar, showTabBar, onScroll }}>{children}</TabBarContext.Provider>;
};

export const useTabBar = () => {
  const context = useContext(TabBarContext);
  if (!context) {
    throw new Error('useTabBar must be used within a TabBarProvider');
  }
  return context;
};
