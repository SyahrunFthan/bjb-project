import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import Button from '@/components/Button';
import AppIcon from '@/components/Icon';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/formatter';
import { getStatusBadge } from '@/lib/paymentStatus';
import { Installment } from '@/model/loan';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

dayjs.locale('id');

interface Props {
  item: Installment;
  loading: boolean;
  processing: boolean;
  onPay: (item: Installment) => void;
  onViewReceipt?: (paymentId: string) => void;
}

const CollectionBillCard = ({ item, loading, onPay, onViewReceipt, processing }: Props) => {
  const [showHistory, setShowHistory] = useState<boolean>(false);

  if (loading) {
    return <SkeletonCard />;
  }

  const instAmount = Number(item.amount || 0);
  const instPaidAmount = Number(item.paid_amount || 0);
  const remaining = Math.max(0, Math.round(instAmount - instPaidAmount));
  const isFullyPaid =
    item.status === 'paid' || (instAmount > 0 && (remaining < 1 || instPaidAmount >= instAmount));

  // Check overdue
  const today = dayjs().startOf('day');
  const dueDateObj = dayjs(item.due_date).startOf('day');
  const isOverdue = !isFullyPaid && dueDateObj.isBefore(today);
  const daysOverdue = isOverdue ? today.diff(dueDateObj, 'day') : 0;

  const effectiveStatus = isFullyPaid ? 'paid' : isOverdue ? 'overdue' : instPaidAmount > 0 ? 'partially_paid' : 'unpaid';
  const status = getStatusBadge(effectiveStatus);

  const formattedDueDate = dueDateObj.isValid() ? dueDateObj.format('dddd, D MMM YYYY') : item.due_date;

  const payments = (item.payments || []) as any[];
  const hasPayments = payments.length > 0;
  const latestPayment = hasPayments ? payments[0] : null;

  return (
    <View style={[styles.card, isOverdue && styles.cardOverdue]}>
      {/* Header: Angsuran sequence & Badges */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.sequenceBadge}>
            <AppText variant="bold" style={styles.sequenceText}>
              Ke-{item.sequence_number}
            </AppText>
          </View>
          <View>
            <AppText variant="semiBold" style={styles.invoiceTitle}>
              Angsuran #{item.sequence_number}
            </AppText>
            <View style={styles.dueDateRow}>
              <AppIcon name="event" size={12} color={color.neutral} />
              <AppText style={styles.dueDateText}>{formattedDueDate}</AppText>
            </View>
          </View>
        </View>

        <View style={styles.badgeContainer}>
          {isOverdue && (
            <View style={styles.overdueChip}>
              <AppIcon name="warning" size={10} color="#DC2626" />
              <AppText style={styles.overdueChipText}>Terlewat {daysOverdue} hari</AppText>
            </View>
          )}
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <AppText style={[styles.badgeText, { color: status.color }]}>{status.label}</AppText>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Body: Amounts & Actions */}
      <View style={styles.cardBody}>
        <View style={styles.amountsColumn}>
          <AppText style={styles.amountLabel}>
            {isFullyPaid ? 'Nominal Lunas' : 'Sisa yang Harus Dibayar'}
          </AppText>
          <AppText variant="bold" style={[styles.amountVal, isFullyPaid ? styles.amountValPaid : styles.amountValPending]}>
            Rp {formatCurrency(isFullyPaid ? instAmount : remaining)}
          </AppText>

          {instPaidAmount > 0 && (
            <View style={styles.paidInfoRow}>
              <AppIcon name="check-circle" size={12} color="#059669" />
              <AppText style={styles.paidText}>
                Sudah masuk: Rp {formatCurrency(instPaidAmount)} / Rp {formatCurrency(instAmount)}
              </AppText>
            </View>
          )}
        </View>

        <View style={styles.actionColumn}>
          {!isFullyPaid && (
            <Button
              disabled={processing}
              title="Catat Bayar"
              type="default"
              size="small"
              onPress={() => onPay(item)}
              style={styles.payBtn}
            />
          )}

          {hasPayments && onViewReceipt && latestPayment && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.receiptBtn}
              onPress={() => onViewReceipt(latestPayment.id)}>
              <AppIcon name="receipt" size={14} color={color.primary} />
              <AppText variant="semiBold" style={styles.receiptBtnText}>
                Struk
              </AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Payment History Toggle & Details */}
      {hasPayments && (
        <View style={styles.historyContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.historyToggleRow}
            onPress={() => setShowHistory(!showHistory)}>
            <View style={styles.historyToggleLeft}>
              <AppIcon name="history" size={14} color={color.neutral} />
              <AppText style={styles.historyToggleText}>
                {payments.length} Riwayat Setoran
              </AppText>
            </View>
            <AppIcon
              name={showHistory ? 'expand-less' : 'expand-more'}
              size={18}
              color={color.neutral}
            />
          </TouchableOpacity>

          {showHistory && (
            <View style={styles.historyList}>
              {payments.map((p: any, idx: number) => {
                const pDate = dayjs(p.payment_date).isValid()
                  ? dayjs(p.payment_date).format('DD MMM YYYY, HH:mm')
                  : '-';
                const isCash =
                  !p.payment_method ||
                  p.payment_method.toLowerCase() === 'cash' ||
                  p.payment_method.toLowerCase() === 'courier';

                return (
                  <View key={p.id || idx} style={styles.historyItemRow}>
                    <View style={styles.historyItemLeft}>
                      <View style={[styles.methodBadge, { backgroundColor: isCash ? '#ECFDF5' : '#EFF6FF' }]}>
                        <AppText style={[styles.methodBadgeText, { color: isCash ? '#059669' : '#2563EB' }]}>
                          {isCash ? 'TUNAI' : (p.payment_method || 'TRANSFER').toUpperCase()}
                        </AppText>
                      </View>
                      <AppText style={styles.historyDateText}>{pDate}</AppText>
                    </View>

                    <View style={styles.historyItemRight}>
                      <AppText variant="bold" style={styles.historyAmountText}>
                        +Rp {formatCurrency(p.amount)}
                      </AppText>
                      {onViewReceipt && (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => onViewReceipt(p.id)}
                          style={styles.historyReceiptIcon}>
                          <AppIcon name="receipt" size={16} color={color.primary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default CollectionBillCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardOverdue: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFBFB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sequenceBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  sequenceText: {
    fontSize: 12,
    color: '#1D4ED8',
  },
  invoiceTitle: {
    fontSize: 14,
    color: '#0F172A',
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dueDateText: {
    fontSize: 11,
    color: color.neutral,
  },
  badgeContainer: {
    alignItems: 'flex-end',
    gap: 4,
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
  overdueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  overdueChipText: {
    fontSize: 9,
    color: '#DC2626',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountsColumn: {
    flex: 1,
    paddingRight: 8,
  },
  amountLabel: {
    fontSize: 11,
    color: color.neutral,
    marginBottom: 2,
  },
  amountVal: {
    fontSize: 17,
  },
  amountValPending: {
    color: '#0F172A',
  },
  amountValPaid: {
    color: '#059669',
  },
  paidInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  paidText: {
    fontSize: 10,
    color: '#059669',
  },
  actionColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payBtn: {
    minWidth: 95,
    height: 38,
    borderRadius: 10,
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  receiptBtnText: {
    fontSize: 11,
    color: color.primary,
  },
  historyContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  historyToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyToggleText: {
    fontSize: 11,
    color: color.neutral,
  },
  historyList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  historyItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  methodBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  methodBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  historyDateText: {
    fontSize: 11,
    color: color.neutral,
  },
  historyItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyAmountText: {
    fontSize: 12,
    color: '#059669',
  },
  historyReceiptIcon: {
    padding: 3,
  },
});
