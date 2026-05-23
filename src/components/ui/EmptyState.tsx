import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import AppIcon from '../Icon';
import { color } from '@/assets/color';

interface Props {
  description?: string;
  style?: ViewStyle;
}

const EmptyState: React.FC<Props> = ({ description = 'Belum ada data yang tersedia saat ini', style }) => {
  return (
    <View style={[styles.infoCard, style]}>
      <AppIcon name="info-outline" size={20} color={color.primary} />
      <Text style={styles.infoText}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: color.primary + '10',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: color.primary,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: color.black,
    lineHeight: 20,
  },
});

export default EmptyState;
