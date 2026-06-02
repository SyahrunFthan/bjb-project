import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useFormContext } from '@/contexts/FormContext';
import SectionCard from '@/components/ui/SectionCard';
import DebounceSelect from '@/components/DebounceSelect';
import Input from '@/components/Input';
import {
  fetchProvinces,
  fetchRegencies,
  fetchDistricts,
  fetchSubDistricts,
} from '@/api/loan';

const CustomerAddressSection = () => {
  const { errors, setValue, getValue } = useFormContext();

  const provinceId = (getValue('address.province_id') as string) || '';
  const regencyId = (getValue('address.regency_id') as string) || '';
  const districtId = (getValue('address.district_id') as string) || '';

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
    <SectionCard icon="home" iconBg="#FEE2E2" iconColor="#EF4444" title="Lengkapi Alamat Nasabah">
      <DebounceSelect
        label="Provinsi"
        placeholder="Pilih provinsi..."
        value={provinceId}
        onValueChange={val => {
          setValue('address.province_id', val);
          setValue('address.regency_id', '');
          setValue('address.district_id', '');
          setValue('address.sub_district_id', '');
        }}
        fetchOptions={fetchProvinces}
        error={errors['address.province_id']}
      />

      <DebounceSelect
        label="Kabupaten / Kota"
        placeholder="Pilih kabupaten/kota..."
        value={regencyId}
        onValueChange={val => {
          setValue('address.regency_id', val);
          setValue('address.district_id', '');
          setValue('address.sub_district_id', '');
        }}
        fetchOptions={getRegencyOptions}
        disabled={!provinceId}
        error={errors['address.regency_id']}
      />

      <DebounceSelect
        label="Kecamatan"
        placeholder="Pilih kecamatan..."
        value={districtId}
        onValueChange={val => {
          setValue('address.district_id', val);
          setValue('address.sub_district_id', '');
        }}
        fetchOptions={getDistrictOptions}
        disabled={!regencyId}
        error={errors['address.district_id']}
      />

      <DebounceSelect
        label="Kelurahan / Desa"
        placeholder="Pilih kelurahan/desa..."
        value={(getValue('address.sub_district_id') as string) || ''}
        onValueChange={val => setValue('address.sub_district_id', val)}
        fetchOptions={getSubDistrictOptions}
        disabled={!districtId}
        error={errors['address.sub_district_id']}
      />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Input
            label="RT"
            placeholder="Contoh: 001"
            value={(getValue('address.neighborhood_unit') as string) || ''}
            onChangeText={val => setValue('address.neighborhood_unit', val)}
            error={errors['address.neighborhood_unit']}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            label="RW"
            placeholder="Contoh: 002"
            value={(getValue('address.community_unit') as string) || ''}
            onChangeText={val => setValue('address.community_unit', val)}
            error={errors['address.community_unit']}
          />
        </View>
      </View>

      <Input
        label="Kode Pos"
        placeholder="Masukkan kode pos (5 digit)"
        value={(getValue('address.postal_code') as string) || ''}
        onChangeText={val => setValue('address.postal_code', val.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        maxLength={5}
        error={errors['address.postal_code']}
      />

      <Input
        label="Alamat Lengkap"
        placeholder="Jalan, No. Rumah, RT/RW, Alamat Lengkap"
        value={(getValue('address.address') as string) || ''}
        onChangeText={val => setValue('address.address', val)}
        multiline
        numberOfLines={3}
        error={errors['address.address']}
      />
    </SectionCard>
  );
};

export default CustomerAddressSection;
