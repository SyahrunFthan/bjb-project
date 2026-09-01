import { fetchCustomerOptions } from '@/api/loan';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import DebounceSelect from '@/components/DebounceSelect';
import SectionCard from '@/components/ui/SectionCard';
import { useFormContext } from '@/contexts/FormContext';
import { Customer } from '@/model/customer';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  selectedCustomer: Customer | null;
  error?: string;
}

const CustomerSelectSection = ({ selectedCustomer, error }: Props) => {
  const { values, setValue } = useFormContext();

  return (
    <SectionCard icon="people" iconBg="#DBEAFE" iconColor="#1D4ED8" title="Pilih Nasabah">
      <DebounceSelect
        label="Nama Nasabah"
        placeholder="Cari & pilih nasabah..."
        value={(values.customer_id as string) || ''}
        onValueChange={val => setValue('customer_id', val)}
        fetchOptions={fetchCustomerOptions}
        error={error}
      />

      {selectedCustomer && (
        <View style={styles.customerPreview}>
          <View style={styles.customerAvatar}>
            <AppText style={styles.customerAvatarText}>
              {selectedCustomer.full_name ? selectedCustomer.full_name.charAt(0).toUpperCase() : 'N'}
            </AppText>
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="semiBold" style={styles.customerName}>
              {selectedCustomer.full_name}
            </AppText>
            <AppText style={styles.customerMeta}>No. Anggota: {selectedCustomer.member_number}</AppText>
            <AppText style={styles.customerMeta}>Telp: {selectedCustomer.phone_number}</AppText>
          </View>
        </View>
      )}
    </SectionCard>
  );
};

export default CustomerSelectSection;

const styles = StyleSheet.create({
  customerPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0F4FA',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: color.border,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: color.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.primary + '30',
  },
  customerAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.primary,
  },
  customerName: {
    fontSize: 14,
    color: color.black,
  },
  customerMeta: {
    fontSize: 11,
    color: color.neutral,
    marginTop: 1,
  },
});
