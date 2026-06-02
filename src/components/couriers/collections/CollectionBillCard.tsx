import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import Button from '@/components/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/formatter';
import { getStatusBadge } from '@/lib/paymentStatus';
import { Installment } from '@/model/loan';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  item: Installment;
  loading: boolean;
  processing: boolean;
  onPay: (item: Installment) => void;
}

const CollectionBillCard = ({ item, loading, onPay, processing }: Props) => {
  const status = getStatusBadge(item.status);
  const dateObj = new Date(item.due_date);
  const formattedDueDate = !isNaN(dateObj.getTime())
    ? `${dateObj.getDate()} ${
        ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][dateObj.getMonth()]
      } ${dateObj.getFullYear()}`
    : item.due_date;

  if (loading) {
    return <SkeletonCard />;
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <AppText variant="semiBold" style={styles.invoiceText}>
            Angsuran Ke-{item.sequence_number}
          </AppText>
          <AppText style={styles.dateText}>Jatuh Tempo: {formattedDueDate}</AppText>
        </View>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <AppText style={[styles.badgeText, { color: status.color }]}>{status.label}</AppText>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View>
          <AppText style={styles.amountLabel}>Jumlah Pembayaran</AppText>
          <AppText variant="bold" style={styles.amountVal}>
            {formatCurrency(item.amount)}
          </AppText>
        </View>

        {item.status !== 'paid' && (
          <Button disabled={processing} title="Catat Bayar" type="default" size="small" onPress={() => onPay(item)} style={styles.payBtn} />
        )}
      </View>
    </View>
  );
};

export default CollectionBillCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.white,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: color.border,
    padding: 12,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceText: {
    fontSize: 14,
    color: color.black,
  },
  dateText: {
    fontSize: 11,
    color: color.neutral,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  amountLabel: {
    fontSize: 10,
    color: color.neutral,
  },
  amountVal: {
    fontSize: 16,
    color: color.primary,
  },
  payBtn: {
    minWidth: 100,
    height: 36,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
});
