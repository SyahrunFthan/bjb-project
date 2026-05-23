import { MaterialIconsIconName } from '@react-native-vector-icons/material-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import AppIcon from '../Icon';
import { color } from '@/assets/color';

interface Props {
  title?: string;
  description?: string;
  icon?: MaterialIconsIconName;
  style?: ViewStyle;
}

const EmptyData: React.FC<Props> = ({
  title = 'Tidak Ada Data',
  description = 'Belum ada data yang tersedia saat ini',
  icon = 'delete-outline',
  style,
}) => {
  return (
    <>
      <View style={[styles.infoCard, style]}>
        <AppIcon name="info-outline" size={20} color={color.primary} />
        <Text style={styles.infoText}>{description}</Text>
      </View>

      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <AppIcon name={icon} size={64} color={color.neutral} />
        </View>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyDescription}>{description}</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: color.neutral + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: color.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: color.neutral,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: color.primary + '10',
    marginHorizontal: 16,
    marginTop: 16,
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

export default EmptyData;
