import { recentPaymentGet } from '@/api/payment';
import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import EmptyData from '@/components/ui/EmptyData';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useModal } from '@/hooks/useModal';
import { formatActivityDate } from '@/lib/formatter';
import { skeletonData } from '@/lib/utils';
import { RecentPayment } from '@/model/dashboard';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';

interface PaymentItem {
  id: string;
  amount: number;
  createdAt: string;
  installment?: {
    installment_number: number;
    loan?: {
      loan_number: string;
      customer?: {
        name: string;
        phone?: string;
      };
    };
  };
}

const ActivityScreen = () => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<RecentPayment[]>([]);
  const modal = useModal();

  const fetchRecentPayments = async (searchTerm = '') => {
    recentPaymentGet({ modal, search, setLoading, setRecentPayments: setPayments, setRefreshing });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRecentPayments(search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecentPayments(search);
  };

  const renderPaymentCard = ({ item }: { item: RecentPayment }) => {
    const customerName = item.customerName || 'Tanpa Nama';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.paymentAmount}>Rp {item.amount?.toLocaleString('id-ID')}</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.metaText}>Bayar Cicilan</Text>
          <Text style={styles.metaText}>
            {formatActivityDate(item.paymentDate)} | {item.paymentMethod?.toUpperCase() ?? 'CASH'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <AppLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Riwayat Pembayaran</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama customer..."
            placeholderTextColor={color.neutral}
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
        </View>

        {loading ? (
          skeletonData.map((_, index) => {
            return <SkeletonCard style={styles.skeleton} key={index} />;
          })
        ) : (
          <FlatList
            data={payments}
            keyExtractor={item => item.id}
            renderItem={renderPaymentCard}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[color.primary]} tintColor={color.primary} />}
            ListEmptyComponent={<EmptyData />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </AppLayout>
  );
};

export default ActivityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: color.black,
    marginBottom: 12,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    height: 44,
    backgroundColor: color.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: color.black,
    borderWidth: 1,
    borderColor: color.border,
  },
  loader: {
    marginTop: 32,
  },
  listContainer: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: color.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: color.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: color.black,
    flex: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: color.success,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 13,
    color: color.neutral,
  },
  dateText: {
    fontSize: 11,
    color: color.neutral,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: color.neutral,
  },
  skeleton: {
    marginBottom: 8,
  },
});
