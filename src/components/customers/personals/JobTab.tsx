import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { color } from '@/assets/color';
import AppIcon from '@/components/Icon';
import { AppText } from '@/components/AppText';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useModal } from '@/hooks/useModal';
import { formatCurrency } from '@/lib/formatter';
import { customerJobUpdated, customerJobDeleted } from '@/api/customer';

interface Props {
  profile: any;
  onSuccess: () => void;
}

export const JobTab = ({ profile, onSuccess }: Props) => {
  const modal = useModal();
  const [processing, setProcessing] = useState(false);

  const [job, setJob] = useState<any>(null);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [jobAddress, setJobAddress] = useState('');

  useEffect(() => {
    if (profile) {
      if (profile.job) {
        setJob(profile.job);
        setCompanyName(profile.job.company_name || '');
        setPosition(profile.job.position || '');
        setSalary(profile.job.salary ? String(profile.job.salary) : '');
        setJobAddress(profile.job.address || '');
      } else {
        setJob(null);
        setCompanyName('');
        setPosition('');
        setSalary('');
        setJobAddress('');
      }
    }
  }, [profile]);

  const handleUpdateJob = () => {
    if (!companyName || !position || !salary || !jobAddress) {
      Alert.alert('Form Belum Lengkap', 'Silakan lengkapi semua bidang pekerjaan.');
      return;
    }

    const values = {
      company_name: companyName,
      position,
      salary: parseInt(salary, 10) || 0,
      address: jobAddress,
    };

    customerJobUpdated({
      modal,
      values,
      setProcessing,
      onSuccess: () => {
        setIsEditingJob(false);
        onSuccess();
      },
    });
  };

  const handleDeleteJob = () => {
    Alert.alert('Hapus Pekerjaan', 'Apakah Anda yakin ingin menghapus data pekerjaan ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          customerJobDeleted({
            modal,
            setProcessing,
            onSuccess: () => {
              setIsEditingJob(false);
              onSuccess();
            },
          });
        },
      },
    ]);
  };

  return (
    <View>
      {!job && !isEditingJob ? (
        /* Empty state / create trigger */
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <AppIcon name="work-outline" size={36} color={color.neutral} />
          </View>
          <AppText variant="bold" style={styles.emptyTitle}>
            Data Pekerjaan Kosong
          </AppText>
          <AppText style={styles.emptyDesc}>Silakan isi data pekerjaan Anda untuk mendukung keakuratan pendataan sistem koperasi.</AppText>
          <Button title="Tambah Data Pekerjaan" size="small" onPress={() => setIsEditingJob(true)} />
        </View>
      ) : isEditingJob ? (
        /* Form editing view (Create / Update form) */
        <View style={styles.card}>
          <AppText variant="bold" style={styles.formSectionTitle}>
            {job ? 'Edit Data Pekerjaan' : 'Tambah Data Pekerjaan'}
          </AppText>

          <Input label="Nama Perusahaan" placeholder="Nama instansi / perusahaan" value={companyName} onChangeText={setCompanyName} />

          <Input label="Jabatan" placeholder="Posisi / jabatan kerja" value={position} onChangeText={setPosition} />

          <Input
            label="Gaji Bulanan"
            placeholder="Gaji dalam Rupiah"
            value={salary}
            onChangeText={val => setSalary(val.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
          />

          <Input
            label="Alamat Perusahaan"
            placeholder="Jalan, Kota instansi perusahaan"
            value={jobAddress}
            onChangeText={setJobAddress}
            multiline
            numberOfLines={2}
          />

          <View style={styles.formActions}>
            <Button title="Batal" type="outline" style={{ flex: 1 }} onPress={() => setIsEditingJob(false)} disabled={processing} />
            <Button title="Simpan" type="default" style={{ flex: 2 }} onPress={handleUpdateJob} disabled={processing} />
          </View>
        </View>
      ) : (
        /* View job details mode */
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <AppIcon name="business" size={22} color={color.primary} />
            <AppText variant="bold" style={styles.detailHeaderTitle}>
              Informasi Pekerjaan
            </AppText>
          </View>

          <View style={styles.detailRow}>
            <AppText style={styles.detailLabel}>Perusahaan</AppText>
            <AppText variant="semiBold" style={styles.detailValue}>
              {job.company_name}
            </AppText>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <AppText style={styles.detailLabel}>Jabatan</AppText>
            <AppText variant="semiBold" style={styles.detailValue}>
              {job.position}
            </AppText>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <AppText style={styles.detailLabel}>Estimasi Pendapatan</AppText>
            <AppText variant="bold" style={[styles.detailValue, { color: '#059669' }]}>
              Rp {formatCurrency(job.salary)}
            </AppText>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <AppText style={styles.detailLabel}>Alamat Kantor</AppText>
            <AppText style={styles.detailValue}>{job.address}</AppText>
          </View>

          <View style={styles.detailActions}>
            <Button title="Ubah Data" type="outline" style={{ flex: 1 }} onPress={() => setIsEditingJob(true)} />
            <Button title="Hapus" type="outline" style={{ flex: 1, borderColor: color.tertiary }} onPress={handleDeleteJob} />
          </View>
        </View>
      )}
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
  emptyCard: {
    backgroundColor: color.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    color: color.black,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 12,
    color: color.neutral,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  formSectionTitle: {
    fontSize: 14,
    color: color.black,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  detailCard: {
    backgroundColor: color.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  detailHeaderTitle: {
    fontSize: 14,
    color: color.black,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: color.neutral,
  },
  detailValue: {
    fontSize: 12,
    color: color.black,
    flex: 1,
    textAlign: 'right',
  },
  detailDivider: {
    height: 0.5,
    backgroundColor: '#F1F5F9',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
});
