import { employeeProfileFetched, employeeProfileUpdated } from '@/api/employee';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import Button from '@/components/Button';
import DatePicker from '@/components/DatePicker';
import AppIcon from '@/components/Icon';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { genderOptions } from '@/constants/gender';
import { religionOptions } from '@/constants/religion';
import { useModal } from '@/hooks/useModal';
import { RouteParamList } from '@/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RouteParamList, 'CourierProfile'>;

const CourierProfileScreen = ({ navigation }: Props) => {
  const modal = useModal();

  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [fullName, setFullName] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [gender, setGender] = useState('');
  const [religion, setReligion] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  const loadData = useCallback(() => {
    employeeProfileFetched({
      setData: data => {
        if (data) {
          setFullName(data.full_name || '');
          setPlaceOfBirth(data.place_of_birth || '');
          setDateOfBirth(data.date_of_birth ? new Date(data.date_of_birth) : undefined);
          setGender(data.gender || '');
          setReligion(data.religion || '');
          setEmail(data.email || '');
          setPhoneNumber(data.phone_number || '');
          setAddress(data.address || '');
        }
      },
      modal,
      setRefreshing,
    });
  }, [refreshing, modal]);

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateProfile = () => {
    if (!fullName || !placeOfBirth || !dateOfBirth || !gender || !religion || !email || !phoneNumber || !address) {
      Alert.alert('Form Belum Lengkap', 'Silakan lengkapi semua bidang wajib data pribadi.');
      return;
    }

    const year = dateOfBirth.getFullYear();
    const month = String(dateOfBirth.getMonth() + 1).padStart(2, '0');
    const day = String(dateOfBirth.getDate()).padStart(2, '0');
    const dobString = `${year}-${month}-${day}`;

    const values = {
      full_name: fullName,
      place_of_birth: placeOfBirth,
      date_of_birth: dobString,
      gender,
      religion,
      email,
      phone_number: phoneNumber,
      address,
    };

    employeeProfileUpdated({
      modal,
      values,
      setProcessing,
      onSuccess: () => {
        loadData();
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={color.white} barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <AppIcon name="arrow-back" size={20} color={color.black} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle} variant="semiBold">
          Profil Saya (Petugas)
        </AppText>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} colors={[color.primary]} />}>
          <View style={styles.card}>
            <Input label="Nama Lengkap" placeholder="Masukkan nama lengkap" value={fullName} onChangeText={setFullName} />
            <Input label="Tempat Lahir" placeholder="Kota tempat lahir" value={placeOfBirth} onChangeText={setPlaceOfBirth} />
            <DatePicker label="Tanggal Lahir" placeholder="Pilih Tanggal Lahir" value={dateOfBirth} onDateChange={setDateOfBirth} />
            <Select
              label="Jenis Kelamin"
              placeholder="Pilih jenis kelamin"
              value={gender}
              onValueChange={val => setGender(String(val))}
              options={genderOptions}
            />
            <Select
              label="Agama"
              placeholder="Pilih agama"
              value={religion}
              onValueChange={val => setReligion(String(val))}
              options={religionOptions}
            />
            <Input
              label="Email"
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Nomor Telepon"
              placeholder="08xxxxxxxxxx"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={15}
            />
            <Input
              label="Alamat Rumah"
              placeholder="Masukkan alamat lengkap"
              value={address}
              onChangeText={setAddress}
              multiline={true}
              numberOfLines={3}
            />

            <Button title="Perbarui Data Pribadi" onPress={handleUpdateProfile} disabled={processing} style={styles.actionBtn} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CourierProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#F1F5F9',
    borderWidth: 0.5,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    color: color.black,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: color.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  actionBtn: {
    marginTop: 12,
    width: '100%',
  },
});
