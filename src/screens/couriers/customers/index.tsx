import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import { AppText } from '@/components/AppText';
import CustomerList from '@/components/couriers/customers/CustomerList';
import AppIcon from '@/components/Icon';
import Input from '@/components/Input';
import EmptyData from '@/components/ui/EmptyData';
import { CustomerModel } from '@/model/customer';
import React, { useMemo, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

// ─── Mock data (ganti dengan API call) ───────────────────────────────────────
const MOCK_CUSTOMERS: CustomerModel[] = [
  {
    id: '1',
    user_id: 'u1',
    national_id: '3201010101010001',
    full_name: 'Ahmad Wahyudi',
    place_of_birth: 'Jakarta',
    date_of_birth: '1990-01-01',
    gender: 'Laki-laki',
    religion: 'Islam',
    address: 'Jl. Merdeka No. 1',
    phone_number: '081234567890',
    email: 'ahmad@email.com',
    marital_status: 'Menikah',
    member_number: 'ANS-001234',
    status: 'active',
    created_by: 'admin',
    updated_by: 'admin',
    createdAt: '2025-01-12T00:00:00Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    id: '2',
    user_id: 'u2',
    national_id: '3201010101010002',
    full_name: 'Siti Rahayu',
    place_of_birth: 'Bandung',
    date_of_birth: '1995-05-20',
    gender: 'Perempuan',
    religion: 'Islam',
    address: 'Jl. Sudirman No. 5',
    phone_number: '085698741230',
    email: 'siti@email.com',
    marital_status: 'Belum Menikah',
    member_number: 'ANS-001235',
    status: 'pending',
    created_by: 'admin',
    updated_by: 'admin',
    createdAt: '2025-02-03T00:00:00Z',
    updatedAt: '2025-02-03T00:00:00Z',
  },
  {
    id: '3',
    user_id: 'u3',
    national_id: '3201010101010003',
    full_name: 'Budi Prasetyo',
    place_of_birth: 'Surabaya',
    date_of_birth: '1988-11-15',
    gender: 'Laki-laki',
    religion: 'Kristen',
    address: 'Jl. Pahlawan No. 3',
    phone_number: '087712345678',
    email: 'budi@email.com',
    marital_status: 'Menikah',
    member_number: 'ANS-001236',
    status: 'inactive',
    created_by: 'admin',
    updated_by: 'admin',
    createdAt: '2025-02-18T00:00:00Z',
    updatedAt: '2025-02-18T00:00:00Z',
  },
  {
    id: '4',
    user_id: 'u4',
    national_id: '3201010101010004',
    full_name: 'Dewi Lestari',
    place_of_birth: 'Yogyakarta',
    date_of_birth: '1993-07-08',
    gender: 'Perempuan',
    religion: 'Islam',
    address: 'Jl. Malioboro No. 10',
    phone_number: '082345678901',
    email: 'dewi@email.com',
    marital_status: 'Menikah',
    member_number: 'ANS-001237',
    status: 'active',
    created_by: 'admin',
    updated_by: 'admin',
    createdAt: '2025-03-05T00:00:00Z',
    updatedAt: '2025-03-05T00:00:00Z',
  },
];

const FILTER_OPTIONS = [
  { key: 'all', label: 'Semua' },
  { key: 'active', label: 'Aktif' },
  { key: 'inactive', label: 'Nonaktif' },
  { key: 'pending', label: 'Pending' },
];

const CustomerScreen = () => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const customers = MOCK_CUSTOMERS;

  const filtered = useMemo(() => {
    let list = customers;
    if (activeFilter !== 'all') list = list.filter(c => c.status === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.full_name.toLowerCase().includes(q) || c.national_id.includes(q) || c.member_number.toLowerCase().includes(q));
    }
    return list;
  }, [customers, activeFilter, search]);

  return (
    <AppLayout scrollable={true}>
      <StatusBar backgroundColor={color.primary} barStyle="light-content" />
      <Input leftIcon={<AppIcon name="search" size={20} color={color.border} />} placeholder="Cari Nama" />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <FlatList
              horizontal
              data={FILTER_OPTIONS}
              keyExtractor={f => f.key}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={styles.filterRow}
              renderItem={({ item: f }) => (
                <TouchableOpacity
                  style={[styles.chip, activeFilter === f.key && styles.chipActive]}
                  onPress={() => setActiveFilter(f.key)}
                  activeOpacity={0.7}>
                  <AppText style={[styles.chipText, activeFilter === f.key && styles.chipTextActive]}>{f.label}</AppText>
                </TouchableOpacity>
              )}
            />

            <AppText style={styles.sectionLabel}>Nasabah terdaftar</AppText>
          </>
        }
        renderItem={({ item, index }) => <CustomerList item={item} index={index} />}
        ListEmptyComponent={<EmptyData />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </AppLayout>
  );
};

export default CustomerScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: color.white,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: color.border,
    padding: 10,
    gap: 2,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '600',
    color: color.primary,
  },
  statLabel: {
    fontSize: 10,
    color: color.neutral,
  },
  filterRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: color.border,
    backgroundColor: color.white,
  },
  chipActive: {
    backgroundColor: color.primary,
    borderColor: color.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: color.neutral,
  },
  chipTextActive: {
    color: color.white,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: color.neutral,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  listContent: {
    paddingBottom: 24,
    backgroundColor: '#F0F4FF',
  },
});
