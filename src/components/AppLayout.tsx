import { color } from '@/assets/color';
import { useTabBar } from '@/contexts/TabBarContext';
import React, { ReactNode } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeHeader from './HomeHeader';

interface Props {
  children: ReactNode;
  scrollable?: boolean;
}

const AppLayout = ({ children, scrollable = false }: Props) => {
  const { onScroll } = useTabBar();

  const content = (
    <>
      <HomeHeader name="Syahrun Fathan Hidayah" />
      <View style={styles.content}>{children}</View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={color.white} barStyle={'dark-content'} />
      {scrollable ? (
        <ScrollView style={styles.container} onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        <View style={styles.container}>{content}</View>
      )}
    </SafeAreaView>
  );
};

export default AppLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  content: {
    backgroundColor: color.background + 40,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
