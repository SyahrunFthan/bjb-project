import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { SkeletonCircle, SkeletonText } from '@/components/ui/Skeleton';
import { customerStatusColor, customerStatusMap } from '@/constants/customerStatus';
import { formatActivityDate } from '@/lib/formatter';
import { getInitials } from '@/lib/utils';
import { Customer } from '@/model/customer';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  item: Customer;
  index: number;
  loading: boolean;
  onEdit?: (item: Customer) => void;
}

const CustomerList = ({ item, index, loading, onEdit }: Props) => {
  if (loading) {
    return (
      <View style={styles.card}>
        <SkeletonCircle size={42} />

        <View style={styles.cardBody}>
          <SkeletonText lines={2} />
          <View style={styles.cardMeta}>
            <SkeletonText lines={2} />
          </View>
        </View>

        <View style={styles.cardRight}>
          <AppText style={styles.cardDate}>{formatActivityDate(item.createdAt)}</AppText>
          <AppIcon name="chevron-right" size={14} color={color.border} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={{ gap: 5 }}>
        <View style={[styles.avatar, { backgroundColor: customerStatusColor[item.status] + 15, borderColor: color.border }]}>
          <AppText style={[styles.avatarText, { color: customerStatusColor[item.status] }]}>{getInitials(item.full_name)}</AppText>
        </View>
        <View style={[styles.badge, { backgroundColor: customerStatusColor[item.status] + 15 }]}>
          <AppText style={[styles.badgeText, { color: customerStatusColor[item.status] }]}>{customerStatusMap[item.status]}</AppText>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <AppText style={[styles.cardName, { color: customerStatusColor[item.status] }]} numberOfLines={1}>
            {item.full_name}
          </AppText>
          {item.is_delegated && (
            <View style={styles.delegatedBadge}>
              <AppIcon name="swap-horiz" size={10} color="#0369a1" />
              <AppText style={styles.delegatedBadgeText}>
                Titipan: {item.original_employee?.full_name || 'Cuti'}
              </AppText>
            </View>
          )}
        </View>
        <AppText style={styles.cardMember}>No. Anggota · {item.member_number}</AppText>
        <View style={styles.cardMeta}>
          <AppIcon name="call" size={11} color={color.neutral} />
          <AppText style={styles.cardPhone}>{item.phone_number}</AppText>
        </View>
      </View>

      <View style={styles.cardRight}>
        <TouchableOpacity style={styles.editButton} onPress={() => onEdit?.(item)} activeOpacity={0.7}>
          <AppIcon name="create" size={12} color={color.primary} />
          <AppText style={styles.editText}>Edit</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(CustomerList);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: color.white,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: color.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '600',
    color: color.primary,
  },
  cardMember: {
    fontSize: 11,
    color: color.neutral,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  cardPhone: {
    fontSize: 11,
    color: color.neutral,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  cardDate: {
    fontSize: 10,
    color: color.neutral,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: color.primary,
    backgroundColor: color.primary + '10',
  },
  editText: {
    fontSize: 10,
    fontWeight: '600',
    color: color.primary,
  },
  delegatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E0F2FE',
    borderWidth: 0.5,
    borderColor: '#7DD3FC',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  delegatedBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0369a1',
  },
});
