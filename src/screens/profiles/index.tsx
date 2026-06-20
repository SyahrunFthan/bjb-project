import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { getData } from '@/lib/storage';
import { getInitials } from '@/lib/utils';
import { User } from '@/model/user';
import { RouteParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/hooks/useModal';
import { authLogout } from '@/api/auth';

const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RouteParamList>>();
  const { setAuth } = useAuth();
  const modal = useModal();
  const [profile, setProfile] = useState<User | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const response = await getData('auth');
      setProfile(response);
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    authLogout({
      modal,
      setProcessing,
      navigation,
      setAuth,
    });
  };

  return (
    <AppLayout scrollable={true}>
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <AppText variant="semiBold" style={styles.avatarText}>
            {getInitials((profile?.full_name as string) ?? 'B')}
          </AppText>
        </View>

        <AppText variant="bold" style={styles.nameText}>
          {profile?.full_name}
        </AppText>

        <AppText variant="medium" style={styles.employeeId}>
          {profile?.employee ? profile.employee?.employee_id : profile?.customer?.member_number}
        </AppText>

        <View style={styles.statusBadge}>
          <AppIcon name="security" size={12} />
          {profile?.employee ? (
            <AppText variant="medium" style={styles.statusText}>
              Petugas
            </AppText>
          ) : (
            <AppText variant="medium" style={styles.statusText}>
              Nasabah
            </AppText>
          )}
        </View>
      </View>

      <AppText variant="medium" style={styles.sectionTitle}>
        Pengaturan Akun
      </AppText>

      <View style={styles.menuContainer}>
        <TouchableOpacity onPress={() => navigation.navigate(profile?.employee ? 'CourierProfile' : 'Personal')} style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={styles.iconPrimaryContainer}>
              <AppIcon name="manage-accounts" color={color.primary} size={20} />
            </View>

            <View style={styles.menuTextWrapper}>
              <AppText variant="medium">Data Probadi</AppText>
            </View>
          </View>

          <AppIcon name="chevron-right" size={24} color={color.primary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Secure')} style={[styles.menuItem, styles.menuItemSpacing]}>
          <View style={styles.menuLeft}>
            <View style={styles.iconPrimaryContainer}>
              <AppIcon name="security" color={color.primary} size={20} />
            </View>

            <View style={styles.menuTextWrapper}>
              <AppText variant="medium">Kemanan Akun</AppText>
            </View>
          </View>

          <AppIcon name="chevron-right" size={24} color={color.primary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('DeleteAccount')} style={styles.menuItemNoBorder}>
          <View style={styles.menuLeft}>
            <View style={styles.iconDangerContainer}>
              <AppIcon name="delete" color={color.tertiary} size={20} />
            </View>

            <View style={styles.menuTextWrapper}>
              <AppText variant="medium" style={styles.deleteText}>
                Hapus Akun
              </AppText>
            </View>
          </View>

          <AppIcon name="chevron-right" size={24} color={color.tertiary} />
        </TouchableOpacity>
      </View>

      <AppText variant="medium" style={styles.sectionTitle}>
        Bantuan & Dukungan
      </AppText>

      <View style={styles.menuContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Help')} style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={styles.iconPrimaryContainer}>
              <AppIcon name="support-agent" color={color.primary} size={20} />
            </View>

            <View style={styles.menuTextWrapper}>
              <AppText variant="medium">Butuh Bantuan ?</AppText>
            </View>
          </View>

          <AppIcon name="chevron-right" size={24} color={color.primary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Terms')} style={styles.menuItemNoBorder}>
          <View style={styles.menuLeft}>
            <View style={styles.iconPrimaryContainer}>
              <AppIcon name="policy" color={color.primary} size={20} />
            </View>

            <View style={styles.menuTextWrapper}>
              <AppText variant="medium">Syarat & Kebijakan</AppText>
            </View>
          </View>

          <AppIcon name="chevron-right" size={24} color={color.primary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={processing}>
        <AppIcon name="logout" size={20} color={color.tertiary} />
        <AppText variant="medium" style={styles.logoutText}>
          Keluar Aplikasi
        </AppText>
      </TouchableOpacity>

      <View style={styles.footer}>
        <AppText variant="medium" style={styles.footerText}>
          Versi 2.1
        </AppText>

        <AppText variant="medium" style={styles.footerText}>
          &copy; 2026 PT. Bare Jaya Berdikari
        </AppText>
      </View>
    </AppLayout>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  profileCard: {
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderColor: color.border,
    backgroundColor: color.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: color.primary,
    borderRadius: 30,
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 22,
    color: color.white,
  },
  nameText: {
    textAlign: 'center',
    maxWidth: 150,
  },
  employeeId: {
    color: color.neutral,
    marginTop: -5,
  },
  statusBadge: {
    backgroundColor: color.secondary + '40',
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    textTransform: 'uppercase',
    color: color.neutral,
  },
  menuContainer: {
    backgroundColor: color.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: color.border,
  },
  menuItemSpacing: {
    marginBottom: 10,
  },
  menuItemNoBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  menuLeft: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 15,
  },
  iconPrimaryContainer: {
    width: 30,
    height: 30,
    backgroundColor: color.primary + '15',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconDangerContainer: {
    width: 30,
    height: 30,
    backgroundColor: color.tertiary + '15',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextWrapper: {
    flex: 1,
  },
  deleteText: {
    color: color.tertiary,
  },
  logoutButton: {
    backgroundColor: color.tertiary + '20',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 20,
  },
  logoutText: {
    color: color.tertiary,
  },
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: color.neutral,
  },
});
