import { color } from '@/assets/color';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppIcon from './Icon';

interface HomeHeaderProps {
  name: string;
  onNotificationPress?: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ name, onNotificationPress }) => {
  const getInitials = (fullName: string) => {
    return fullName.charAt(0).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.greeting}>Selamat Datang,</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={onNotificationPress} style={styles.notificationButton} activeOpacity={0.7}>
        <AppIcon name="notifications" size={24} color={color.primary} />
        <View style={styles.badge} />
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
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: color.primary,
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
    fontSize: 12,
    color: color.neutral,
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
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
