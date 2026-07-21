import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import Input from '@/components/Input';
import SectionCard from '@/components/ui/SectionCard';
import { useFormContext } from '@/contexts/FormContext';
import { formatCurrency } from '@/lib/formatter';
import React from 'react';
import { StyleSheet } from 'react-native';

const CustomerJobSection = () => {
  const { errors, setValue, getValue } = useFormContext();

  return (
    <SectionCard icon="work" iconBg="#FEF3C7" iconColor="#D97706" title="Lengkapi Pekerjaan Nasabah">
      <Input
        label="Nama Pekerjaan"
        placeholder="Masukkan nama pekerjaan"
        value={(getValue('job.company_name') as string) || ''}
        onChangeText={val => setValue('job.company_name', val)}
        error={errors['job.company_name']}
      />

      <Input
        label="Jabatan / Posisi"
        placeholder="Contoh: Staff Administrasi, Wiraswasta"
        value={(getValue('job.position') as string) || ''}
        onChangeText={val => setValue('job.position', val)}
        error={errors['job.position']}
      />

      <Input
        label="Pendapatan Bulanan (RP)"
        placeholder="Masukkan nominal gaji bulanan"
        value={getValue('job.salary') ? formatCurrency(parseInt(getValue('job.salary') as string, 10)) : ''}
        onChangeText={val => {
          const cleanNum = val.replace(/[^0-9]/g, '');
          setValue('job.salary', cleanNum);
        }}
        keyboardType="numeric"
        leftIcon={<AppText style={styles.prefixText}>Rp</AppText>}
        error={errors['job.salary']}
      />

      <Input
        label="Alamat Tempat Kerja"
        placeholder="Masukkan alamat lengkap tempat kerja"
        value={(getValue('job.address') as string) || ''}
        onChangeText={val => setValue('job.address', val)}
        multiline
        numberOfLines={2}
        error={errors['job.address']}
      />
    </SectionCard>
  );
};

export default CustomerJobSection;

const styles = StyleSheet.create({
  prefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: color.black,
  },
});
