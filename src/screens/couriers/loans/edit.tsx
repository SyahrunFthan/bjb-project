import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import CourierLoanEditForm from '@/components/couriers/loans/CourierLoanEditForm';
import AppIcon from '@/components/Icon';
import { Loan } from '@/model/loan';
import { RouteParamList } from '@/types/navigation';
import { useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CourierLoanEditScreen = ({ navigation }: { navigation: NativeStackNavigationProp<RouteParamList, 'CourierLoanEdit'> }) => {
  const route = useRoute();
  const { loan } = route.params as { loan: Loan };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={color.white} barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <AppIcon name="arrow-back" size={20} color={color.black} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Edit Pengajuan Pinjaman</AppText>
      </View>

      <CourierLoanEditForm loan={loan} key={loan.id} />
    </SafeAreaView>
  );
};

export default CourierLoanEditScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.white,
    height: 56,
    borderBottomWidth: 0.5,
    borderBottomColor: color.border,
    paddingHorizontal: 16,
    gap: 12,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F4FA',
    borderWidth: 0.5,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: color.black,
  },
});
