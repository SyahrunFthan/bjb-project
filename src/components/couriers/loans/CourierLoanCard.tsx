import { loanDelete } from '@/api/loan';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { loanStatusMap } from '@/constants/loanStatus';
import { useModal } from '@/hooks/useModal';
import { formatCurrency } from '@/lib/formatter';
import { Loan } from '@/model/loan';
import { RouteParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  loan: Loan;
  loading?: boolean;
  onRefresh?: () => void;
}

const CourierLoanCard = ({ loan, onRefresh }: Props) => {
  const navigation = useNavigation<NativeStackNavigationProp<RouteParamList>>();
  const modal = useModal();

  const handleDelete = () => {
    modal.confirm.show('Hapus Pengajuan', 'Apakah Anda yakin ingin menghapus pengajuan pinjaman ini?', () => {
      loanDelete(loan.id, modal, () => {
        onRefresh?.();
      });
    });
  };

  const status = loanStatusMap[loan.submission_status] || { label: loan.submission_status, color: color.neutral, bg: '#F3F4F6' };

  const dateObj = new Date(loan.createdAt);
  const formattedDate = !isNaN(dateObj.getTime())
    ? `${dateObj.getDate()} ${
        ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][dateObj.getMonth()]
      } ${dateObj.getFullYear()}`
    : loan.createdAt;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.customerInfo}>
          <AppIcon name="person" size={16} color={color.primary} />
          <AppText variant="bold" style={styles.customerName} numberOfLines={1}>
            {loan.customer?.full_name || 'Nasabah'}
          </AppText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <AppText style={[styles.statusLabel, { color: status.color }]}>{status.label}</AppText>
        </View>
      </View>

      <View style={styles.metaRow}>
        <AppText style={styles.metaLabel}>No. Anggota:</AppText>
        <AppText style={styles.metaValue}>{loan.customer?.member_number || '-'}</AppText>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <View style={styles.detailCol}>
          <AppText style={styles.detailLabel}>Jumlah Pinjaman</AppText>
          <AppText variant="semiBold" style={styles.amountText}>
            Rp {formatCurrency(loan.amount)}
          </AppText>
        </View>

        <View style={styles.detailCol}>
          <AppText style={styles.detailLabel}>Tenor ({loan.tenor?.name || 'Tenor'})</AppText>
          <AppText variant="medium" style={styles.detailValue}>
            {loan.tenor?.name ? loan.tenor.name.split(' (')[0] : '-'}
          </AppText>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.dateWrap}>
          <AppIcon name="calendar-today" size={12} color={color.neutral} />
          <AppText style={styles.dateText}>Diajukan: {formattedDate}</AppText>
        </View>

        <AppText style={styles.seqText}>Pengajuan ke-{loan.loan_sequence_number}</AppText>
      </View>

      {loan.submission_status === 'pending' && (
        <>
          <View style={styles.divider} />
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete} activeOpacity={0.7}>
              <AppIcon name="delete" size={14} color="#EF4444" />
              <AppText style={styles.deleteBtnText}>Hapus</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => navigation.navigate('CourierLoanEdit', { loan })}
              activeOpacity={0.7}>
              <AppIcon name="create" size={14} color={color.primary} />
              <AppText style={styles.editBtnText}>Edit</AppText>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default CourierLoanCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.white,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: color.border,
    padding: 14,
    marginHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
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
    flex: 1,
    marginRight: 10,
  },
  customerName: {
    fontSize: 14,
    color: color.black,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
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
  amountText: {
    fontSize: 15,
    color: color.primary,
  },
  detailValue: {
    fontSize: 13,
    color: color.black,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 10,
    color: color.neutral,
  },
  seqText: {
    fontSize: 10,
    color: color.neutral,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginVertical: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  editBtn: {
    borderColor: color.primary,
    backgroundColor: color.primary + '10',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: color.primary,
  },
  deleteBtn: {
    borderColor: '#EF4444',
    backgroundColor: '#EF444410',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
});
