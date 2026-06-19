import { color } from '@/assets/color';
import { AppLogo } from '@/assets/images';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppIcon from './Icon';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';

interface HomeHeaderProps {
  name: string;
  onNotificationPress?: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ name, onNotificationPress }) => {
  const { auth, hasUnreadNotification, refreshUnreadStatus } = useAuth();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (auth && isFocused) {
      refreshUnreadStatus();
    }
  }, [auth, isFocused]);

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.avatar}>
          <Image source={AppLogo} style={{ width: 30, height: 30 }} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.greeting}>Hallo, Selamat Datang!</Text>
        </View>
      </View>

      <TouchableOpacity onPress={onNotificationPress} style={styles.notificationButton} activeOpacity={0.7}>
        <AppIcon name="notifications" size={24} color={color.primary} />
        {hasUnreadNotification && <View style={styles.badge} />}
      </TouchableOpacity>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: color.white,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: color.white,
    fontSize: 20,
    fontWeight: '700',
  },
  textContainer: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 11,
    color: color.neutral,
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: color.black,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    borderWidth: 1.5,
    borderColor: color.white,
  },
});
