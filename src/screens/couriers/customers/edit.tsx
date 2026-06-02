import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import CustomerEditForm from '@/components/couriers/customers/CustomerEditForm';
import AppIcon from '@/components/Icon';
import { Customer } from '@/model/customer';
import { RouteParamList } from '@/types/navigation';
import { useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CustomerEditScreen = ({ navigation }: { navigation: NativeStackNavigationProp<RouteParamList, 'CustomerEdit'> }) => {
  const route = useRoute();
  const { customer } = route.params as { customer: Customer };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={color.white} barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <AppIcon name="arrow-back" size={20} color={color.black} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Edit Nasabah</AppText>
      </View>

      <CustomerEditForm customer={customer} key={customer.id} />
    </SafeAreaView>
  );
};

export default CustomerEditScreen;

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
