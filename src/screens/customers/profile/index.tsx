import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useTabBar } from '@/contexts/TabBarContext';
import { color } from '@/assets/color';
import AppIcon from '@/components/Icon';

const ProfileScreen = () => {
  const { onScroll } = useTabBar();

  return (
    <View style={styles.container}>
      <ScrollView 
        onScroll={onScroll} 
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <AppIcon name="person" size={50} color={color.white} />
          </View>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@example.com</Text>
        </View>

        {[...Array(15)].map((_, i) => (
          <View key={i} style={styles.menuItem}>
            <Text>Menu Option {i + 1}</Text>
            <AppIcon name="chevron-right" size={20} color={color.neutral} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: color.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: color.black,
  },
  email: {
    fontSize: 14,
    color: color.neutral,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});
