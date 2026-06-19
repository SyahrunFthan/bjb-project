import { clearNotificationsApi, fetchNotifications, markNotificationsAsReadApi, NotificationItem } from '@/api/notification';
import { color } from '@/assets/color';
import AppIcon from '@/components/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/hooks/useModal';
import { formatTransactionDate } from '@/lib/formatter';
import { RouteParamList } from '@/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RouteParamList, 'Notification'>;

const NotificationScreen = ({ navigation }: Props) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const modal = useModal();
  const { setHasUnreadNotification } = useAuth();

  const loadNotifications = useCallback(async (showIndicator = true) => {
    if (showIndicator) setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markNotificationsAsReadApi();
      setNotifications(prev => prev.map(item => ({ ...item, is_read: true })));
      setHasUnreadNotification(false);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleClearAll = () => {
    modal.confirm.show('Hapus Notifikasi', 'Apakah kamu yakin ingin menghapus semua notifikasi?', async () => {
      await clearNotificationsApi({ modal, setNotifications });
      setHasUnreadNotification(false);
    });
  };

  const getNotificationIcon = (title: string, isRead: boolean) => {
    const titleLower = title.toLowerCase();
    let name: any = 'notifications';
    let iconColor = color.primary;
    let bgColor = '#EEF2FF';

    if (titleLower.includes('bayar') || titleLower.includes('pembayaran') || titleLower.includes('lunas')) {
      name = 'check-circle';
      iconColor = '#10B981';
      bgColor = '#ECFDF5';
    } else if (titleLower.includes('pengajuan') || titleLower.includes('baru')) {
      name = 'assignment';
      iconColor = color.yellow;
      bgColor = '#FFFDF0';
    } else if (titleLower.includes('setuju') || titleLower.includes('disetujui')) {
      name = 'verified';
      iconColor = '#3B82F6';
      bgColor = '#EFF6FF';
    } else if (titleLower.includes('tolak') || titleLower.includes('ditolak')) {
      name = 'cancel';
      iconColor = color.tertiary;
      bgColor = '#FDF2F2';
    }

    return (
      <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
        <AppIcon name={name} size={22} color={iconColor} />
      </View>
    );
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    return (
      <View style={[styles.notificationCard, !item.is_read && styles.unreadCard]}>
        {getNotificationIcon(item.title, item.is_read)}
        <View style={styles.contentWrapper}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, !item.is_read && styles.unreadTitle]}>{item.title}</Text>
            {!item.is_read && <View style={styles.unreadDot} />}
          </View>
          <Text style={[styles.cardMessage, !item.is_read && styles.unreadMessage]}>{item.message}</Text>
          <Text style={styles.cardTime}>{formatTransactionDate(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <AppIcon name="notifications-none" size={60} color={color.neutral} />
        </View>
        <Text style={styles.emptyTitle}>Belum Ada Notifikasi</Text>
        <Text style={styles.emptySubtitle}>Seluruh aktivitas akun Anda seperti pembayaran atau pengajuan pinjaman akan muncul di sini.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={color.white} barStyle="dark-content" />

      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <AppIcon name="arrow-back" size={24} color={color.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifikasi</Text>
        {notifications.length > 0 ? (
          <View style={styles.headerActions}>
            {notifications.some(n => !n.is_read) && (
              <TouchableOpacity style={styles.actionButton} onPress={handleMarkAllAsRead} activeOpacity={0.7}>
                <AppIcon name="done-all" size={22} color={color.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionButton} onPress={handleClearAll} activeOpacity={0.7}>
              <AppIcon name="delete-outline" size={22} color={color.tertiary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.headerPlaceholder} />
        )}
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[color.primary]} />}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: color.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: color.primary,
  },
  readAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  readAllIcon: {
    marginRight: 4,
  },
  readAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: color.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
  },
  headerPlaceholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: color.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#F5F8FF', // Soft highlighted blue background for unread items
    borderColor: '#E2E8F0',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contentWrapper: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  unreadTitle: {
    color: color.primary,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.blue,
    marginLeft: 8,
  },
  cardMessage: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 8,
  },
  unreadMessage: {
    color: '#334155',
  },
  cardTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: color.neutral,
    textAlign: 'center',
    lineHeight: 20,
  },
});
