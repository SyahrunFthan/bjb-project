import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import { useTabBar } from '@/contexts/TabBarContext';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const HistoryScreen = () => {
  const { onScroll } = useTabBar();

  return (
    <AppLayout>
      <ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>History</Text>
        {[...Array(20)].map((_, i) => (
          <View key={i} style={styles.dummyItem}>
            <Text>History Item {i + 1}</Text>
          </View>
        ))}
      </ScrollView>
    </AppLayout>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dummyItem: {
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
  },
});
