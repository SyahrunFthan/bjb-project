import { customerResetPassword, customerUpdate } from '@/api/customer';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import Button from '@/components/Button';
import DatePicker from '@/components/DatePicker';
import AppIcon from '@/components/Icon';
import Input from '@/components/Input';
import Select from '@/components/Select';
import SectionCard from '@/components/ui/SectionCard';
import { genderOptions } from '@/constants/gender';
import { maritalStatusOptions } from '@/constants/maritalStatus';
import { religionOptions } from '@/constants/religion';
import { Rules, useFormContext } from '@/contexts/FormContext';
import { useModal } from '@/hooks/useModal';
import { Customer } from '@/model/customer';
import { RouteParamList } from '@/types/navigation';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  customer: Customer;
}

const CustomerEditForm = ({ customer }: Props) => {
  const navigation = useNavigation<NativeStackNavigationProp<RouteParamList, 'CustomerEdit'>>();
  const form = useFormContext();
  const { values, errors, register, unregister, setValue, validateForm, resetForm } = form;
  const modal = useModal();

  const [processing, setProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [resetResult, setResetResult] = useState<any>(null);
  const nikLength = ((values.national_id as string) || '').length;

  useEffect(() => {
    register('national_id', [
      Rules.required('NIK wajib diisi'),
      Rules.pattern(/^[0-9]+$/, 'NIK hanya boleh berisi angka'),
      Rules.minLength(16, 'NIK harus tepat 16 digit'),
    ]);
    register('full_name', [Rules.required('Nama lengkap wajib diisi')]);
    register('email', [Rules.required('Email wajib diisi'), Rules.email('Format email tidak valid')]);
    register('phone_number', [
      Rules.required('Nomor telepon wajib diisi'),
      Rules.pattern(/^[0-9]+$/, 'Nomor telepon hanya boleh berisi angka'),
      Rules.minLength(8, 'Nomor telepon minimal 8 digit'),
    ]);
    register('place_of_birth', [Rules.required('Tempat lahir wajib diisi')]);
    register('date_of_birth', [Rules.required('Tanggal lahir wajib diisi')]);
    register('gender', [Rules.required('Jenis kelamin wajib dipilih')]);
    register('religion', [Rules.required('Agama wajib dipilih')]);
    register('marital_status', [Rules.required('Status pernikahan wajib dipilih')]);

    return () => {
      unregister('national_id');
      unregister('full_name');
      unregister('email');
      unregister('phone_number');
      unregister('place_of_birth');
      unregister('date_of_birth');
      unregister('gender');
      unregister('religion');
      unregister('marital_status');
    };
  }, [register, unregister]);

  useEffect(() => {
    if (customer) {
      setValue({
        ...customer,
        branch_id: customer.branches ? customer.branches[0].id : undefined,
      });
    }
  }, [customer, setValue]);

  const handleSave = () => {
    const isFormValid = validateForm();
    if (!isFormValid) return;

    customerUpdate({
      modal,
      form,
      setProcessing,
      record: customer,
      goBack: () => navigation.goBack(),
    });
  };

  const handleConfirmReset = () => {
    Alert.alert('Konfirmasi Reset', 'Apakah Anda yakin ingin mereset password nasabah ini kembali ke password bawaan (Nomor Anggota)?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Ya, Reset',
        style: 'destructive',
        onPress: executeResetPassword,
      },
    ]);
  };

  const executeResetPassword = () => {
    if (!customer?.id) return;
    customerResetPassword({
      modal,
      customerId: customer.id,
      setProcessing,
      onSuccess: data => {
        setResetResult(data);
        setShowSuccessModal(true);
      },
    });
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionCard icon="card-membership" iconBg="#DBEAFE" iconColor="#1D4ED8" title="Identitas Diri">
          <View style={styles.fieldWrap}>
            <Input
              label="Nomor NIK (KTP)"
              placeholder="Masukkan 16 digit NIK"
              value={(values.national_id as string) || ''}
              onChangeText={val => setValue('national_id', val)}
              error={errors.national_id}
              keyboardType="numeric"
              maxLength={16}
              rightIcon={<AppText style={[styles.counterText, nikLength === 16 && styles.counterDone]}>{nikLength}/16</AppText>}
            />
            <Input
              label="Nama Lengkap"
              placeholder="Sesuai KTP"
              value={(values.full_name as string) || ''}
              onChangeText={val => setValue('full_name', val)}
              error={errors.full_name}
              autoCapitalize="words"
            />
          </View>
        </SectionCard>

        <SectionCard icon="person" iconBg="#DCFCE7" iconColor="#15803D" title="Data Pribadi">
          <Input
            label="Tempat Lahir"
            placeholder="Kota"
            value={(values.place_of_birth as string) || ''}
            onChangeText={val => setValue('place_of_birth', val)}
            error={errors.place_of_birth}
            autoCapitalize="words"
          />
          <DatePicker
            label="Tanggal Lahir"
            placeholder="Pilih"
            value={values.date_of_birth ? new Date(values.date_of_birth as string | number | Date) : undefined}
            onDateChange={val => setValue('date_of_birth', val)}
            error={errors.date_of_birth}
          />

          <Select
            label="Jenis Kelamin"
            placeholder="Pilih"
            value={(values.gender as string) || ''}
            onValueChange={val => setValue('gender', val)}
            options={genderOptions}
            error={errors.gender}
          />
          <Select
            label="Status Nikah"
            placeholder="Pilih"
            value={(values.marital_status as string) || ''}
            onValueChange={val => setValue('marital_status', val)}
            options={maritalStatusOptions}
            error={errors.marital_status}
          />

          <Select
            label="Agama"
            placeholder="Pilih agama"
            value={(values.religion as string) || ''}
            onValueChange={val => setValue('religion', val)}
            options={religionOptions}
            error={errors.religion}
          />
        </SectionCard>

        <SectionCard icon="phone" iconBg="#FEF9C3" iconColor="#A16207" title="Kontak">
          <Input
            label="Email"
            placeholder="nama@email.com"
            value={(values.email as string) || ''}
            onChangeText={val => setValue('email', val.toLowerCase())}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.phoneRow}>
            <View style={{ flex: 1 }}>
              <Input
                label="Nomor Telepon"
                placeholder="08xxxxxxxxxx"
                value={(values.phone_number as string) || ''}
                onChangeText={val => setValue('phone_number', val)}
                error={errors.phone_number}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
          </View>
        </SectionCard>

        <SectionCard icon="security" iconBg="#FEE2E2" iconColor="#EF4444" title="Keamanan Akun">
          <AppText style={styles.securityText}>
            Fitur ini akan mengatur ulang password nasabah kembali ke password sementara bawaan (Nomor Anggota).
          </AppText>
          <TouchableOpacity style={styles.btnResetPassword} activeOpacity={0.8} disabled={processing} onPress={handleConfirmReset}>
            <AppIcon name="lock-reset" size={16} color="#DC2626" />
            <AppText style={styles.btnResetPasswordText}>Reset Password Nasabah</AppText>
          </TouchableOpacity>
        </SectionCard>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Reset"
          type="outline"
          size="medium"
          onPress={() => {
            resetForm({
              ...customer,
              branch_id: customer.branches ? customer.branches[0].id : undefined,
            });
          }}
          disabled={processing}
          style={styles.btnReset}
        />
        <Button title="Simpan" type="default" size="medium" onPress={handleSave} loading={processing} style={styles.btnSave} />
      </View>

      <Modal visible={showSuccessModal} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconCircle}>
              <AppIcon name="check-circle" size={44} color="#15803D" />
            </View>

            <AppText variant="bold" style={styles.modalTitle}>
              Password Berhasil Di-reset
            </AppText>
            <AppText style={styles.modalSubtitle}>Gunakan informasi berikut untuk masuk ke akun nasabah:</AppText>

            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <AppText style={styles.infoLabel}>Username:</AppText>
                <AppText variant="medium" style={styles.infoValue} numberOfLines={1}>
                  {resetResult?.username}
                </AppText>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <AppText style={styles.infoLabel}>Password Baru:</AppText>
                <AppText variant="bold" style={styles.passwordValue}>
                  {resetResult?.temp_password}
                </AppText>
              </View>
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.btnCopy}
                activeOpacity={0.8}
                onPress={() => {
                  if (resetResult?.temp_password) {
                    Clipboard.setString(resetResult.temp_password);
                    Alert.alert('Sukses', 'Password baru berhasil disalin');
                  }
                }}>
                <AppIcon name="content-copy" size={16} color={color.primary} />
                <AppText style={styles.btnCopyText}>Salin Password</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnClose}
                activeOpacity={0.8}
                onPress={() => {
                  setShowSuccessModal(false);
                }}>
                <AppText style={styles.btnCloseText}>Tutup</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CustomerEditForm;

const styles = StyleSheet.create({
  headerBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  fieldWrap: {
    marginBottom: 0,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 8,
  },
  colLeft: {
    flex: 1,
  },
  colRight: {
    flex: 1,
  },
  counterText: {
    fontSize: 11,
    color: color.neutral,
    fontWeight: '500',
  },
  counterDone: {
    color: '#15803D',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  waBadgeWrap: {
    paddingBottom: 12,
  },
  waBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: color.border,
  },
  dotActive: {
    width: 14,
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    paddingBottom: 16,
    backgroundColor: color.white,
    borderTopWidth: 0.5,
    borderTopColor: color.border,
  },
  btnReset: {
    flex: 1,
  },
  btnSave: {
    flex: 2,
  },
  securityText: {
    fontSize: 12,
    color: color.neutral,
    marginBottom: 16,
  },
  btnResetPassword: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 10,
    height: 44,
    backgroundColor: '#FEF2F2',
  },
  btnResetPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: color.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 12,
    color: color.neutral,
    textAlign: 'center',
    marginBottom: 16,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: color.border,
    padding: 12,
    marginBottom: 20,
  },
  infoRow: {
    gap: 2,
  },
  infoLabel: {
    fontSize: 10,
    color: color.neutral,
  },
  infoValue: {
    fontSize: 13,
    color: '#0F172A',
  },
  infoDivider: {
    height: 0.5,
    backgroundColor: color.border,
    marginVertical: 8,
  },
  passwordValue: {
    fontSize: 14,
    color: '#0F172A',
  },
  modalButtonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  btnCopy: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: color.primary,
    borderRadius: 10,
    height: 40,
  },
  btnCopyText: {
    fontSize: 12,
    fontWeight: '600',
    color: color.primary,
  },
  btnClose: {
    flex: 1,
    backgroundColor: color.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  btnCloseText: {
    fontSize: 12,
    fontWeight: '600',
    color: color.white,
  },
});
