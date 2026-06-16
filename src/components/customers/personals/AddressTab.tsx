import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { color } from '@/assets/color';
import Input from '@/components/Input';
import DebounceSelect from '@/components/DebounceSelect';
import Button from '@/components/Button';
import { useModal } from '@/hooks/useModal';
import { fetchProvinces, fetchRegencies, fetchDistricts, fetchSubDistricts } from '@/api/loan';
import { customerAddressUpdated } from '@/api/customer';

interface Props {
  profile: any;
  onSuccess: () => void;
}

export const AddressTab = ({ profile, onSuccess }: Props) => {
  const modal = useModal();
  const [processing, setProcessing] = useState(false);

  const [provinceId, setProvinceId] = useState('');
  const [regencyId, setRegencyId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [subDistrictId, setSubDistrictId] = useState('');
  const [neighborhoodUnit, setNeighborhoodUnit] = useState('');
  const [communityUnit, setCommunityUnit] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (profile && profile.address) {
      setProvinceId(profile.address.province_id || '');
      setRegencyId(profile.address.regency_id || '');
      setDistrictId(profile.address.district_id || '');
      setSubDistrictId(profile.address.sub_district_id || '');
      setNeighborhoodUnit(profile.address.neighborhood_unit || '');
      setCommunityUnit(profile.address.community_unit || '');
      setPostalCode(profile.address.postal_code ? String(profile.address.postal_code) : '');
      setAddress(profile.address.address || '');
    }
  }, [profile]);

  const handleUpdateAddress = () => {
    if (!provinceId || !regencyId || !districtId || !subDistrictId || !postalCode || !address) {
      Alert.alert('Form Belum Lengkap', 'Silakan lengkapi semua bidang wajib alamat.');
      return;
    }

    const values = {
      province_id: provinceId,
      regency_id: regencyId,
      district_id: districtId,
      sub_district_id: subDistrictId,
      neighborhood_unit: neighborhoodUnit,
      community_unit: communityUnit,
      postal_code: parseInt(postalCode, 10) || 0,
      address,
    };

    customerAddressUpdated({
      modal,
      values,
      setProcessing,
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  const getRegencyOptions = useCallback(
    (query: string) => fetchRegencies(provinceId, query),
    [provinceId],
  );

  const getDistrictOptions = useCallback(
    (query: string) => fetchDistricts(regencyId, query),
    [regencyId],
  );

  const getSubDistrictOptions = useCallback(
    (query: string) => fetchSubDistricts(districtId, query),
    [districtId],
  );

  return (
    <View style={styles.card}>
      <DebounceSelect
        label="Provinsi"
        placeholder="Pilih provinsi..."
        value={provinceId}
        onValueChange={val => {
          setProvinceId(String(val));
          setRegencyId('');
          setDistrictId('');
          setSubDistrictId('');
        }}
        fetchOptions={fetchProvinces}
      />

      <DebounceSelect
        label="Kabupaten / Kota"
        placeholder="Pilih kabupaten/kota..."
        value={regencyId}
        onValueChange={val => {
          setRegencyId(String(val));
          setDistrictId('');
          setSubDistrictId('');
        }}
        fetchOptions={getRegencyOptions}
        disabled={!provinceId}
      />

      <DebounceSelect
        label="Kecamatan"
        placeholder="Pilih kecamatan..."
        value={districtId}
        onValueChange={val => {
          setDistrictId(String(val));
          setSubDistrictId('');
        }}
        fetchOptions={getDistrictOptions}
        disabled={!regencyId}
      />

      <DebounceSelect
        label="Kelurahan / Desa"
        placeholder="Pilih kelurahan/desa..."
        value={subDistrictId}
        onValueChange={val => setSubDistrictId(String(val))}
        fetchOptions={getSubDistrictOptions}
        disabled={!districtId}
      />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Input 
            label="RT" 
            placeholder="RT" 
            value={neighborhoodUnit} 
            onChangeText={setNeighborhoodUnit} 
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input 
            label="RW" 
            placeholder="RW" 
            value={communityUnit} 
            onChangeText={setCommunityUnit} 
          />
        </View>
      </View>

      <Input
        label="Kode Pos"
        placeholder="Masukkan 5 digit kode pos"
        value={postalCode}
        onChangeText={val => setPostalCode(val.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        maxLength={5}
      />

      <Input
        label="Alamat Lengkap"
        placeholder="Jalan, Blok, No. Rumah"
        value={address}
        onChangeText={setAddress}
        multiline
        numberOfLines={3}
      />

      <Button 
        title="Perbarui Alamat" 
        onPress={handleUpdateAddress} 
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
