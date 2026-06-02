import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/formatter';
import { Loan } from '@/model/loan';
import { RouteParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  navigation: NativeStackNavigationProp<RouteParamList, 'CourierCollection'>;
  item: Loan;
  loading: boolean;
}

const CollectionLoanList = ({ navigation, item, loading }: Props) => {
  if (loading) {
    return <SkeletonCard />;
  }

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => navigation.navigate('CourierCollectionDetail', { loanId: item.id })}>
      <View style={styles.cardHeader}>
        <View style={styles.customerInfo}>
          <AppIcon name="person" size={16} color={color.primary} />
          <AppText variant="bold" style={styles.customerName}>
            {item.customer?.full_name || 'Nasabah'}
          </AppText>
        </View>
        <View style={styles.badge}>
          <AppText style={styles.badgeText}>AKTIF</AppText>
        </View>
      </View>

      <View style={styles.metaRow}>
        <AppText style={styles.metaLabel}>No. Anggota:</AppText>
        <AppText style={styles.metaValue}>{item.customer?.member_number || '-'}</AppText>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <View style={styles.detailCol}>
          <AppText style={styles.detailLabel}>Sisa Tagihan</AppText>
          <AppText variant="semiBold" style={styles.remainingText}>
            {formatCurrency(item.remaining_amount)}
          </AppText>
        </View>
        <View style={styles.detailCol}>
          <AppText style={styles.detailLabel}>Total Pinjaman</AppText>
          <AppText variant="medium" style={styles.totalText}>
            {formatCurrency(item.amount)}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CollectionLoanList;

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.white,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: color.border,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerName: {
    fontSize: 14,
    color: color.black,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#DCFCE7',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  metaLabel: {
    fontSize: 11,
    color: color.neutral,
  },
  metaValue: {
    fontSize: 11,
    color: color.black,
    fontWeight: '500',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailCol: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 10,
    color: color.neutral,
  },
  remainingText: {
    fontSize: 15,
    color: '#B91C1C',
  },
  totalText: {
    fontSize: 13,
    color: color.black,
  },
});
