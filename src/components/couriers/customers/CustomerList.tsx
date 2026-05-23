import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { formatActivityDate } from '@/lib/formatter';
import { getInitials } from '@/lib/utils';
import { CustomerModel } from '@/model/customer';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const CustomerList = ({ item, index }: { item: CustomerModel; index: number }) => {
  return (
    <View style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: color.primary + 15, borderColor: color.border }]}>
        <AppText style={[styles.avatarText, { color: color.primary }]}>{getInitials(item.full_name)}</AppText>
      </View>

      <View style={styles.cardBody}>
        <AppText style={styles.cardName} numberOfLines={1}>
          {item.full_name}
        </AppText>
        <AppText style={styles.cardMember}>No. Anggota · {item.member_number}</AppText>
        <View style={styles.cardMeta}>
          <AppIcon name="call" size={11} color={color.neutral} />
          <AppText style={styles.cardPhone}>{item.phone_number}</AppText>
          <View style={[styles.badge, { backgroundColor: color.secondary + 15 }]}>
            <AppText style={[styles.badgeText, { color: color.secondary }]}>{item.status}</AppText>
          </View>
        </View>
      </View>

      <View style={styles.cardRight}>
        <AppText style={styles.cardDate}>{formatActivityDate(item.createdAt)}</AppText>
        <AppIcon name="chevron-right" size={14} color={color.border} />
      </View>
    </View>
  );
};

export default CustomerList;

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
    gap: 4,
  },
  cardDate: {
    fontSize: 10,
    color: color.neutral,
  },
});
