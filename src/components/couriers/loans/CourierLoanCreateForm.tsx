import { fetchCustomerDetails, fetchCustomerDocuments, fetchRequirementDocs, fetchTenors, loanStore } from '@/api/loan';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import SectionCard from '@/components/ui/SectionCard';
import { Rules, useFormContext } from '@/contexts/FormContext';
import { useModal } from '@/hooks/useModal';
import { formatCurrency } from '@/lib/formatter';
import { Customer } from '@/model/customer';
import { RouteParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { SkeletonCard } from '@/components/ui/Skeleton';
import { CustomerDocument } from '@/model/customerDocument';
import { RequirementDocument } from '@/model/requirementDocument';
import { TenorModel } from '@/model/tenor';
import CustomerAddressSection from './CustomerAddressSection';
import CustomerJobSection from './CustomerJobSection';
import CustomerSelectSection from './CustomerSelectSection';
import LoanPreview from './LoanPreview';
import RequiredDocumentsSection from './RequiredDocumentsSection';

interface Props {
  navigation: NativeStackNavigationProp<RouteParamList, 'CourierLoanCreate'>;
}

const CourierLoanCreateForm = ({ navigation }: Props) => {
  const modal = useModal();
  const form = useFormContext();
  const { values, errors, register, setValue, getValue, validateForm, resetForm } = form;

  const [tenors, setTenors] = useState<TenorModel[]>([]);
  const [requirementDocs, setRequirementDocs] = useState<RequirementDocument[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<CustomerDocument[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    register('customer_id', [Rules.required('Nasabah wajib dipilih')]);
    register('tenor_id', [Rules.required('Tenor wajib dipilih')]);
    register('amount', [Rules.required('Nominal pinjaman wajib diisi'), Rules.pattern(/^[0-9]+$/, 'Nominal pinjaman hanya boleh berisi angka')]);
    resetForm();

    const initData = async () => {
      setLoadingData(true);
      await fetchTenors(setTenors, () => {}, modal);
      await fetchRequirementDocs(setRequirementDocs, () => {}, modal);
      setLoadingData(false);
    };
    initData();
  }, [register]);

  const customerId = values.customer_id as string | undefined;

  useEffect(() => {
    if (customerId) {
      setLoadingDocs(true);
      fetchCustomerDetails(customerId)
        .then(customer => {
          if (customer) {
            setSelectedCustomer(customer);
            setValue('address', undefined);
            setValue('job', undefined);
          }
        })
        .catch(err => console.warn('Error fetching customer details:', err));

      fetchCustomerDocuments(customerId, setUploadedDocs, setLoadingDocs, modal);
    } else {
      setUploadedDocs([]);
      setSelectedCustomer(null);
      setValue('address', undefined);
      setValue('job', undefined);
    }
  }, [customerId]);

  useEffect(() => {
    if (selectedCustomer) {
      if (!selectedCustomer.address) {
        register('address.province_id', [Rules.required('Provinsi wajib dipilih')]);
        register('address.regency_id', [Rules.required('Kabupaten/Kota wajib dipilih')]);
        register('address.district_id', [Rules.required('Kecamatan wajib dipilih')]);
        register('address.sub_district_id', [Rules.required('Kelurahan/Desa wajib dipilih')]);
        register('address.postal_code', [Rules.required('Kode pos wajib diisi'), Rules.pattern(/^[0-9]{5}$/, 'Kode pos harus 5 digit angka')]);
        register('address.address', [Rules.required('Alamat lengkap wajib diisi')]);
      }
      if (!selectedCustomer.job) {
        register('job.company_name', [Rules.required('Nama perusahaan wajib diisi')]);
        register('job.position', [Rules.required('Jabatan wajib diisi')]);
        register('job.salary', [Rules.required('Gaji wajib diisi'), Rules.pattern(/^[0-9]+$/, 'Gaji harus berupa angka')]);
        register('job.address', [Rules.required('Alamat kantor wajib diisi')]);
      }
    }
  }, [selectedCustomer, register]);

  const handleSubmit = () => {
    const isFormValid = validateForm();
    const requiredDocs = requirementDocs.filter(d => d.is_required);
    const uploadedIds = new Set(uploadedDocs.map(d => d.requirement_document_id));
    const missingDocs = requiredDocs.filter(d => !uploadedIds.has(d.id));

    if (customerId && missingDocs.length > 0) {
      modal.result.error('Dokumen Belum Lengkap', `Nasabah wajib mengunggah semua dokumen persyaratan: ${missingDocs.map(d => d.name).join(', ')}`);
      return;
    }

    if (!isFormValid) return;

    const submitValues = {
      customer_id: values.customer_id as string,
      tenor_id: values.tenor_id as string,
      amount: parseInt(values.amount as string, 10),
      address:
        selectedCustomer && !selectedCustomer.address
          ? {
              province_id: getValue('address.province_id') as string,
              regency_id: getValue('address.regency_id') as string,
              district_id: getValue('address.district_id') as string,
              sub_district_id: getValue('address.sub_district_id') as string,
              neighborhood_unit: (getValue('address.neighborhood_unit') as string) || '',
              community_unit: (getValue('address.community_unit') as string) || '',
              postal_code: parseInt(getValue('address.postal_code') as string, 10),
              address: getValue('address.address') as string,
            }
          : undefined,
      job:
        selectedCustomer && !selectedCustomer.job
          ? {
              company_name: getValue('job.company_name') as string,
              position: getValue('job.position') as string,
              salary: parseInt(getValue('job.salary') as string, 10),
              address: getValue('job.address') as string,
            }
          : undefined,
    };

    loanStore(submitValues, modal, setProcessing, () => navigation.goBack());
  };

  const getSimulationDetails = () => {
    if (!values.amount || !values.tenor_id) return null;
    const amountVal = parseInt(values.amount as string, 10);
    const matchedTenor = tenors.find(t => t.id === values.tenor_id);
    if (!matchedTenor) return null;

    const rate = matchedTenor.interest_rate;
    const interestAmount = amountVal * (rate / 100);
    const totalAmount = amountVal + interestAmount;

    let duration = 1;
    let labelPeriod = 'Periode';
    if (matchedTenor.duration_day !== null && matchedTenor.duration_day > 0) {
      duration = matchedTenor.duration_day;
      labelPeriod = 'Hari';
    } else if (matchedTenor.duration_month !== null && matchedTenor.duration_month > 0) {
      duration = matchedTenor.duration_month;
      labelPeriod = 'Bulan';
    }

    const installmentAmount = Math.ceil(totalAmount / duration);

    return {
      amountVal,
      rate,
      interestAmount,
      totalAmount,
      duration,
      labelPeriod,
      installmentAmount,
      tenorName: matchedTenor.name,
    };
  };

  const simulation = getSimulationDetails();
  const amountFormatted = values.amount ? formatCurrency(parseInt(values.amount as string, 10)) : '';

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        {Array.from({ length: 5 }).map((_, index) => {
          return <SkeletonCard key={index} />;
        })}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS == 'android' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CustomerSelectSection selectedCustomer={selectedCustomer} error={errors.customer_id} />

        <RequiredDocumentsSection
          customerId={customerId}
          requirementDocs={requirementDocs}
          uploadedDocs={uploadedDocs}
          setUploadedDocs={setUploadedDocs}
          loadingDocs={loadingDocs}
          modal={modal}
        />

        {selectedCustomer && !selectedCustomer.address && <CustomerAddressSection />}

        {selectedCustomer && !selectedCustomer.job && <CustomerJobSection />}

        <SectionCard icon="currency-exchange" iconBg="#FEF9C3" iconColor="#A16207" title="Detail Pinjaman">
          <Input
            label="Total Pinjaman (Rp)"
            placeholder="Masukkan nominal pinjaman"
            value={amountFormatted}
            onChangeText={val => {
              const cleanNum = val.replace(/[^0-9]/g, '');
              setValue('amount', cleanNum);
            }}
            keyboardType="numeric"
            error={errors.amount}
            leftIcon={<AppText style={styles.prefixText}>Rp</AppText>}
          />

          <Select
            label="Tenor Pinjaman"
            placeholder="Pilih tenor"
            value={(values.tenor_id as string) || ''}
            onValueChange={val => setValue('tenor_id', val)}
            options={tenors.map(t => ({
              label: `${t.name} (Bunga ${t.interest_rate}%)`,
              value: t.id,
            }))}
            error={errors.tenor_id}
          />
        </SectionCard>

        <LoanPreview simulation={simulation} />

        <View style={styles.footer}>
          <Button
            title="Kirim Pengajuan Pinjaman"
            type="default"
            size="medium"
            onPress={handleSubmit}
            loading={processing}
            style={styles.submitBtn}
          />

          <AppText style={styles.footerHint}>Pastikan semua data & dokumen sudah benar sebelum mengirim.</AppText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CourierLoanCreateForm;

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    gap: 5,
    padding: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: color.neutral,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: color.black,
  },
  footer: {
    gap: 10,
  },
  submitBtn: {
    width: '100%',
  },
  footerHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9094A0',
    lineHeight: 18,
  },
});
