import { color } from '@/assets/color';
import { AppLogo, OJKLogo } from '@/assets/images';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { RouteParamList } from '@/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StatusBar, StyleSheet, View } from 'react-native';

const SplashScreen = ({ navigation }: NativeStackScreenProps<RouteParamList, 'Splash'>) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        navigation.replace('Start');
      }
    });
  }, [progress, navigation]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={color.primary} barStyle={'light-content'} />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={AppLogo} style={styles.logo} resizeMode="contain" />
        </View>

        <AppText style={styles.subtitle}>Solusi Digital Koperasi Modern</AppText>
      </View>

      <View style={styles.loadingTrack}>
        <Animated.View style={[styles.loadingBar, { width }]} />
      </View>

      <View style={styles.footer}>
        <View style={styles.contentBadge}>
          <Image source={OJKLogo} style={styles.badges} resizeMode="contain" />

          <AppIcon name="security" size={24} color={color.white + '70'} />
        </View>
        <AppText style={styles.poweredBy}>Powered by: PT. Bare Jaya Berdikari</AppText>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: color.white,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: color.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    color: color.white,
    fontSize: 36,
    letterSpacing: 2,
  },
  subtitle: {
    color: color.white + '90',
    maxWidth: 200,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  loadingTrack: {
    width: 200,
    height: 4,
    backgroundColor: color.white + '30',
    borderRadius: 2,
    marginTop: 40,
    overflow: 'hidden',
  },
  loadingBar: {
    height: '100%',
    backgroundColor: color.secondary,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  poweredBy: {
    color: color.white + '90',
    fontSize: 10,
  },
  badges: {
    width: 80,
    height: 65,
  },
  contentBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
