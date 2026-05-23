import { color } from '@/assets/color';
import { useTabBar } from '@/contexts/TabBarContext';
import React, { ReactNode, useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeHeader from './HomeHeader';
import { User } from '@/model/user';
import { getData } from '@/lib/storage';

interface Props {
  children: ReactNode;
  scrollable?: boolean;
  refreshControl?: React.ReactElement<any>;
}

const AppLayout = ({ children, scrollable = false, refreshControl }: Props) => {
  const { onScroll } = useTabBar();
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const auth = await getData('auth');
      if (auth) {
        setProfile(auth);
      }
    };

    loadProfile();
  }, []);

  const content = (
    <>
      <HomeHeader name={profile?.full_name ?? 'Loading...'} />
      <View style={[styles.content, !scrollable && styles.contentFlex, scrollable && styles.contentScrollable]}>{children}</View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={color.white} barStyle={'dark-content'} />
      {scrollable ? (
        <ScrollView
          style={styles.container}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}>
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
    backgroundColor: color.background + 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  contentFlex: {
    flex: 1,
  },
  contentScrollable: {
    paddingBottom: 55,
  },
});
