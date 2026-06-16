import { customerProfileFetched } from '@/api/customer';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { useModal } from '@/hooks/useModal';
import { RouteParamList } from '@/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddressTab } from '@/components/customers/personals/AddressTab';
import { DocumentTab } from '@/components/customers/personals/DocumentTab';
import { JobTab } from '@/components/customers/personals/JobTab';
import { PersonalTab } from '@/components/customers/personals/PersonalTab';

type Props = NativeStackScreenProps<RouteParamList, 'Personal'>;

const PersonalScreen = ({ navigation }: Props) => {
  const modal = useModal();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pribadi' | 'alamat' | 'pekerjaan' | 'dokumen'>('pribadi');
  const [profile, setProfile] = useState<any>(null);

  const loadData = useCallback(() => {
    customerProfileFetched({
      setData: setProfile,
      modal,
      setRefreshing,
    });
  }, [refreshing, modal]);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={color.white} barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <AppIcon name="arrow-back" size={20} color={color.black} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle} variant="semiBold">
          Profil Saya
        </AppText>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'pribadi' && styles.tabActive]}
          onPress={() => setActiveTab('pribadi')}
          activeOpacity={0.7}>
          <AppText style={[styles.tabLabel, activeTab === 'pribadi' && styles.tabLabelActive]} variant="medium">
            Pribadi
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'alamat' && styles.tabActive]}
          onPress={() => setActiveTab('alamat')}
          activeOpacity={0.7}>
          <AppText style={[styles.tabLabel, activeTab === 'alamat' && styles.tabLabelActive]} variant="medium">
            Alamat
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'pekerjaan' && styles.tabActive]}
          onPress={() => setActiveTab('pekerjaan')}
          activeOpacity={0.7}>
          <AppText style={[styles.tabLabel, activeTab === 'pekerjaan' && styles.tabLabelActive]} variant="medium">
            Pekerjaan
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'dokumen' && styles.tabActive]}
          onPress={() => setActiveTab('dokumen')}
          activeOpacity={0.7}>
          <AppText style={[styles.tabLabel, activeTab === 'dokumen' && styles.tabLabelActive]} variant="medium">
            Dokumen
          </AppText>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} colors={[color.primary]} />}>
          {activeTab === 'pribadi' && <PersonalTab profile={profile} onSuccess={loadData} />}

          {activeTab === 'alamat' && <AddressTab profile={profile} onSuccess={loadData} />}

          {activeTab === 'pekerjaan' && <JobTab profile={profile} onSuccess={loadData} />}

          {activeTab === 'dokumen' && profile?.id && <DocumentTab customerId={profile.id} refreshing={refreshing} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PersonalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: color.neutral,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.white,
    height: 56,
    borderBottomWidth: 0.5,
    borderBottomColor: color.border,
    paddingHorizontal: 16,
    gap: 12,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    borderWidth: 0.5,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    color: color.black,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: color.white,
    borderBottomWidth: 0.5,
    borderBottomColor: color.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: color.primary,
  },
  tabLabel: {
    fontSize: 13,
    color: color.neutral,
  },
  tabLabelActive: {
    color: color.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  tabLoadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});
