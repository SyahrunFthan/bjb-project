import { color } from '@/assets/color';
import { MaterialIconsIconName } from '@react-native-vector-icons/material-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../AppText';
import AppIcon from '../Icon';

type SectionCardProps = {
  icon: MaterialIconsIconName;
  iconColor: string;
  iconBg: string;
  title: string;
  children: React.ReactNode;
};

const SectionCard = ({ icon, iconColor, iconBg, title, children }: SectionCardProps) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={[styles.cardIconWrap, { backgroundColor: iconBg }]}>
        <AppIcon name={icon} size={16} color={iconColor} />
      </View>
      <AppText style={styles.cardTitle}>{title}</AppText>
    </View>
    {children}
  </View>
);
export default SectionCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.white,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: color.border,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: color.black,
  },
});
