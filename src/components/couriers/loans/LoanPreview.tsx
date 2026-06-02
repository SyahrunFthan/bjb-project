import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { formatCurrency } from '@/lib/formatter';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface SimulationDetails {
  amountVal: number;
  rate: number;
  interestAmount: number;
  totalAmount: number;
  duration: number;
  labelPeriod: string;
  installmentAmount: number;
  tenorName: string;
}

interface Props {
  simulation: SimulationDetails | null;
}

const LoanPreview = ({ simulation }: Props) => {
  if (!simulation) return null;

  return (
    <View style={styles.simCard}>
      <View style={styles.simHeader}>
        <AppIcon name="analytics" size={20} color={color.primary} />
        <AppText variant="bold" style={styles.simHeaderTitle}>
          Simulasi Pinjaman
        </AppText>
      </View>
      <View style={styles.simDivider} />

      <View style={styles.simRow}>
        <AppText style={styles.simLabel}>Pokok Pinjaman</AppText>
        <AppText style={styles.simValue}>{formatCurrency(simulation.amountVal)}</AppText>
      </View>

      <View style={styles.simRow}>
        <AppText style={styles.simLabel}>Suku Bunga ({simulation.rate}%)</AppText>
        <AppText style={styles.simValue}>+ {formatCurrency(simulation.interestAmount)}</AppText>
      </View>

      <View style={[styles.simRow, styles.simTotalRow]}>
        <AppText variant="medium" style={styles.simLabelTotal}>
          Total Pengembalian
        </AppText>
        <AppText variant="bold" style={styles.simValueTotal}>
          {formatCurrency(simulation.totalAmount)}
        </AppText>
      </View>

      <View style={styles.simDivider} />

      <View style={styles.installmentContainer}>
        <AppText style={styles.installmentLabel}>
          Angsuran per {simulation.labelPeriod} ({simulation.duration}x)
        </AppText>
        <AppText variant="bold" style={styles.installmentValue}>
          {formatCurrency(simulation.installmentAmount)}
          <AppText style={styles.installmentPeriod}> / {simulation.labelPeriod.toLowerCase()}</AppText>
        </AppText>
      </View>
    </View>
  );
};

export default LoanPreview;

const styles = StyleSheet.create({
  simCard: {
    backgroundColor: color.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: color.primary + '30',
    padding: 16,
    marginBottom: 16,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  simHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  simHeaderTitle: {
    fontSize: 15,
    color: color.primary,
  },
  simDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  simRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  simLabel: {
    fontSize: 13,
    color: color.neutral,
  },
  simValue: {
    fontSize: 13,
    color: color.black,
    fontWeight: '500',
  },
  simTotalRow: {
    marginTop: 4,
  },
  simLabelTotal: {
    fontSize: 14,
    color: color.black,
  },
  simValueTotal: {
    fontSize: 15,
    color: color.primary,
  },
  installmentContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  installmentLabel: {
    fontSize: 12,
    color: color.neutral,
    marginBottom: 4,
  },
  installmentValue: {
    fontSize: 22,
    color: color.primary,
  },
  installmentPeriod: {
    fontSize: 12,
    color: color.neutral,
    fontWeight: 'normal',
  },
});
