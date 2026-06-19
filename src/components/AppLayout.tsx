import { color } from '@/assets/color';
import { TabBarContext } from '@/contexts/TabBarContext';
import { RouteParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { ReactNode, useContext } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeHeader from './HomeHeader';

interface Props {
  children: ReactNode;
  scrollable?: boolean;
  refreshControl?: React.ReactElement<any>;
}

const AppLayout = ({ children, scrollable = false, refreshControl }: Props) => {
  const tabBar = useContext(TabBarContext);
  const onScroll = tabBar?.onScroll ?? (() => {});
  const navigation = useNavigation<NativeStackNavigationProp<RouteParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={color.white} barStyle={'dark-content'} />
      <HomeHeader name="PT. Bare Jaya Berdikari" onNotificationPress={() => navigation.navigate('Notification')} />
      {scrollable ? (
        <ScrollView
          style={styles.container}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}>
          <View style={[styles.content, styles.contentScrollable]}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.container, styles.content, styles.contentFlex]}>{children}</View>
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
