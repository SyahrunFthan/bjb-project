import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { color } from '@/assets/color';
import Input from '@/components/Input';
import Select from '@/components/Select';
import DatePicker from '@/components/DatePicker';
import Button from '@/components/Button';
import { useModal } from '@/hooks/useModal';
import { genderOptions } from '@/constants/gender';
import { maritalStatusOptions } from '@/constants/maritalStatus';
import { religionOptions } from '@/constants/religion';
import { customerProfileUpdated } from '@/api/customer';
import { employeeProfileUpdated } from '@/api/employee';

interface Props {
  profile: any;
  onSuccess: () => void;
  isEmployee?: boolean;
}

export const PersonalTab = ({ profile, onSuccess, isEmployee = false }: Props) => {
  const modal = useModal();
  const [processing, setProcessing] = useState(false);

  const [fullName, setFullName] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [religion, setReligion] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPlaceOfBirth(profile.place_of_birth || '');
      setDateOfBirth(profile.date_of_birth ? new Date(profile.date_of_birth) : undefined);
      setGender(profile.gender || '');
      setMaritalStatus(profile.marital_status || '');
      setReligion(profile.religion || '');
      setEmail(profile.email || '');
      setPhoneNumber(profile.phone_number || '');
    }
  }, [profile]);

  const handleUpdateProfile = () => {
    const isMaritalRequired = !isEmployee;
    if (
      !fullName ||
      !placeOfBirth ||
      !dateOfBirth ||
      !gender ||
      (isMaritalRequired && !maritalStatus) ||
      !religion ||
      !email ||
      !phoneNumber
    ) {
      Alert.alert('Form Belum Lengkap', 'Silakan lengkapi semua bidang wajib data pribadi.');
      return;
    }

    const year = dateOfBirth.getFullYear();
    const month = String(dateOfBirth.getMonth() + 1).padStart(2, '0');
    const day = String(dateOfBirth.getDate()).padStart(2, '0');
    const dobString = `${year}-${month}-${day}`;

    const values: any = {
      full_name: fullName,
      place_of_birth: placeOfBirth,
      date_of_birth: dobString,
      gender,
      religion,
      email,
      phone_number: phoneNumber,
    };

    if (!isEmployee) {
      values.marital_status = maritalStatus;
    }

    if (isEmployee) {
      employeeProfileUpdated({
        modal,
        values,
        setProcessing,
        onSuccess: () => {
          onSuccess();
        },
      });
    } else {
      customerProfileUpdated({
        modal,
        values,
        setProcessing,
        onSuccess: () => {
          onSuccess();
        },
      });
    }
  };

  return (
    <View style={styles.card}>
      <Input 
        label="Nama Lengkap" 
        placeholder="Masukkan nama lengkap" 
        value={fullName} 
        onChangeText={setFullName} 
      />
      <Input 
        label="Tempat Lahir" 
        placeholder="Kota tempat lahir" 
        value={placeOfBirth} 
        onChangeText={setPlaceOfBirth} 
      />
      <DatePicker 
        label="Tanggal Lahir" 
        placeholder="Pilih Tanggal Lahir" 
        value={dateOfBirth} 
        onDateChange={setDateOfBirth} 
      />
      <Select 
        label="Jenis Kelamin" 
        placeholder="Pilih jenis kelamin" 
        value={gender} 
        onValueChange={val => setGender(String(val))} 
        options={genderOptions} 
      />
      {!isEmployee && (
        <Select
          label="Status Pernikahan"
          placeholder="Pilih status"
          value={maritalStatus}
          onValueChange={val => setMaritalStatus(String(val))}
          options={maritalStatusOptions}
        />
      )}
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

      <Button 
        title="Perbarui Data Pribadi" 
        onPress={handleUpdateProfile} 
        disabled={processing} 
        style={styles.actionBtn} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
