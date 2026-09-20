import React, { useMemo, useState } from 'react';

import { Image, KeyboardAvoidingView, PermissionsAndroid, Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

import { errorCodes, isErrorWithCode, pick } from '@react-native-documents/picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createLeaveRequest, SelectedFile } from '@/api/leaveRequest';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import Button from '@/components/Button';
import Card from '@/components/Card';
import DatePicker from '@/components/DatePicker';
import AppIcon from '@/components/Icon';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { getLeaveTypeRule, LEAVE_TYPE_OPTIONS } from '@/constants/leaveRequest';
import { useModal } from '@/hooks/useModal';
import { RouteParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RouteParamList, 'LeaveRequestCreate'>;

/**
 * Menghitung hari kerja antara 2 tanggal (Senin–Sabtu, mengabaikan hari Minggu)
 */
const calculateWorkingDaysClient = (start?: Date, end?: Date): number => {
  if (!start || !end) return 0;
  if (end < start) return 0;

  let count = 0;
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (cur <= last) {
    if (cur.getDay() !== 0) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return count;
};

const LeaveRequestCreateScreen = ({ navigation }: Props) => {
  const modal = useModal();
  const [processing, setProcessing] = useState<boolean>(false);

  // Form states
  const [leaveType, setLeaveType] = useState<string>('marriage_employee');
  const [customDatesForSick, setCustomDatesForSick] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [reason, setReason] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);

  const currentRule = useMemo(() => getLeaveTypeRule(leaveType), [leaveType]);
  const isSick = leaveType === 'sick_leave';

  // Total working days
  const totalWorkingDays = useMemo(() => {
    if (isSick && !customDatesForSick) {
      return 1;
    }
    return calculateWorkingDaysClient(startDate, endDate);
  }, [isSick, customDatesForSick, startDate, endDate]);

  const isExceedingMaxDays = useMemo(() => {
    if (currentRule?.maxDays && totalWorkingDays > currentRule.maxDays) {
      return true;
    }
    return false;
  }, [currentRule, totalWorkingDays]);

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: 'Izin Kamera',
        message: 'Aplikasi membutuhkan izin kamera untuk memotret surat dokter / berkas pendukung.',
        buttonPositive: 'Bolehkan',
        buttonNegative: 'Batal',
      });
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Camera permission error:', err);
      return false;
    }
  };

  const handleLaunchCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      modal.result.error('Izin Ditolak', 'Aplikasi membutuhkan akses kamera untuk memotret surat dokter / berkas.');
      return;
    }

    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          setSelectedFile({
            uri: asset.uri,
            name: asset.fileName || `surat-lampiran-${Date.now()}.jpg`,
            type: asset.type || 'image/jpeg',
            size: asset.fileSize,
          });
        }
      }
    } catch (err) {
      console.error('Launch camera error:', err);
    }
  };

  const handleLaunchGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          setSelectedFile({
            uri: asset.uri,
            name: asset.fileName || `surat-lampiran-${Date.now()}.jpg`,
            type: asset.type || 'image/jpeg',
            size: asset.fileSize,
          });
        }
      }
    } catch (err) {
      console.error('Launch gallery error:', err);
    }
  };

  const handleLaunchDocumentPicker = async () => {
    try {
      const result = await pick({
        type: ['application/pdf', 'image/*'],
      });

      if (result && result.length > 0) {
        const file = result[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name || `dokumen-${Date.now()}.pdf`,
          type: file.type || 'application/pdf',
          size: file.size ?? undefined,
        });
      }
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      console.warn('Document picker error:', err);
    }
  };

  const handleSubmit = () => {
    if (!leaveType) {
      modal.result.error('Form Belum Lengkap', 'Silakan pilih jenis pengajuan.');
      return;
    }

    // Validasi surat dokter untuk izin sakit
    if (isSick && !selectedFile) {
      modal.result.error('Surat Dokter Wajib', 'Pengajuan izin sakit wajib melampirkan foto atau dokumen surat keterangan dokter.');
      return;
    }

    let startDateStr: string | undefined;
    let endDateStr: string | undefined;

    if (isSick) {
      if (customDatesForSick) {
        if (!startDate || !endDate) {
          modal.result.error('Form Belum Lengkap', 'Silakan pilih tanggal mulai dan selesai.');
          return;
        }
        if (endDate < startDate) {
          modal.result.error('Tanggal Tidak Valid', 'Tanggal selesai tidak boleh sebelum tanggal mulai.');
          return;
        }
        if (totalWorkingDays <= 0) {
          modal.result.error('Hari Kerja Kosong', 'Rentang tanggal yang dipilih tidak memuat hari kerja (Senin s.d. Sabtu).');
          return;
        }
        startDateStr = dayjs(startDate).format('YYYY-MM-DD');
        endDateStr = dayjs(endDate).format('YYYY-MM-DD');
      } else {
        // Tanggal fleksibel/tidak diisi -> backend akan otomatis mencatat tanggal hari ini
        startDateStr = undefined;
        endDateStr = undefined;
      }
    } else {
      if (!startDate || !endDate) {
        modal.result.error('Form Belum Lengkap', 'Silakan pilih tanggal mulai dan selesai.');
        return;
      }

      if (endDate < startDate) {
        modal.result.error('Tanggal Tidak Valid', 'Tanggal selesai tidak boleh sebelum tanggal mulai.');
        return;
      }

      if (totalWorkingDays <= 0) {
        modal.result.error('Hari Kerja Kosong', 'Rentang tanggal yang dipilih tidak memuat hari kerja (Senin s.d. Sabtu).');
        return;
      }

      if (currentRule?.maxDays && totalWorkingDays > currentRule.maxDays) {
        modal.result.error(
          'Durasi Melebihi Batas',
          `Batas maksimal durasi untuk ${currentRule.shortLabel} adalah ${currentRule.maxDays} hari kerja. Durasi yang Anda pilih (${totalWorkingDays} hari) melebihi batas ketentuan.`,
        );
        return;
      }

      startDateStr = dayjs(startDate).format('YYYY-MM-DD');
      endDateStr = dayjs(endDate).format('YYYY-MM-DD');
    }

    if (!reason.trim() || reason.trim().length < 3) {
      modal.result.error('Alasan Wajib Diisi', 'Silakan isi alasan pengajuan minimal 3 karakter.');
      return;
    }

    createLeaveRequest({
      params: {
        type: leaveType,
        start_date: startDateStr,
        end_date: endDateStr,
        reason: reason.trim(),
        file: selectedFile,
      },
      modal,
      setProcessing,
      onSuccess: () => {
        navigation.goBack();
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={color.white} barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <AppIcon name="arrow-back" size={20} color={color.black} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle} variant="bold">
          Form Pengajuan Izin & Cuti
        </AppText>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Card: Jenis Pengajuan */}
          <Card style={styles.formCard} variant="elevated">
            <AppText variant="bold" style={styles.cardSectionTitle}>
              1. Jenis Permohonan
            </AppText>

            <Select
              label="Jenis Cuti / Izin *"
              placeholder="Pilih jenis permohonan"
              options={LEAVE_TYPE_OPTIONS}
              value={leaveType}
              onValueChange={val => {
                const newType = String(val);
                setLeaveType(newType);
                if (newType !== 'sick_leave' && (!startDate || !endDate)) {
                  setStartDate(new Date());
                  setEndDate(new Date());
                }
              }}
            />

            {/* Banner Aturan Jenis Pengajuan */}
            {currentRule && (
              <View style={[styles.ruleInfoBox, isSick ? styles.sickNoticeBox : null]}>
                <AppIcon name={isSick ? 'medical-services' : 'verified'} size={18} color={isSick ? '#DC2626' : color.primary} />
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <AppText variant="bold" style={[styles.ruleTitleText, isSick ? { color: '#B91C1C' } : null]}>
                      {currentRule.shortLabel}
                    </AppText>
                    {currentRule.maxDays && (
                      <View style={styles.ruleBadge}>
                        <AppText variant="bold" style={styles.ruleBadgeText}>
                          Maks. {currentRule.maxDays} Hari Kerja
                        </AppText>
                      </View>
                    )}
                  </View>
                  <AppText style={[styles.ruleDescText, isSick ? { color: '#991B1B' } : null]}>
                    {currentRule.description}
                  </AppText>
                </View>
              </View>
            )}
          </Card>

          {/* Card: Periode Tanggal */}
          <Card style={styles.formCard} variant="elevated">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <AppText variant="bold" style={styles.cardSectionTitle}>
                2. Periode Waktu {isSick ? '(Opsional)' : '*'}
              </AppText>
            </View>

            {isSick ? (
              <View>
                {/* Opsi khusus sakit: default tanpa tanggal */}
                <TouchableOpacity
                  style={styles.toggleCustomDatesBox}
                  onPress={() => setCustomDatesForSick(!customDatesForSick)}
                  activeOpacity={0.7}>
                  <AppIcon
                    name={customDatesForSick ? 'check-box' : 'check-box-outline-blank'}
                    size={22}
                    color={customDatesForSick ? color.primary : '#94A3B8'}
                  />
                  <View style={{ flex: 1 }}>
                    <AppText variant="semiBold" style={styles.toggleCustomDatesTitle}>
                      Tentukan rentang tanggal istirahat
                    </AppText>
                    <AppText style={styles.toggleCustomDatesSub}>
                      Centang jika surat dokter memuat rentang istirahat lebih dari 1 hari.
                    </AppText>
                  </View>
                </TouchableOpacity>

                {customDatesForSick ? (
                  <View style={{ marginTop: 6 }}>
                    <DatePicker
                      label="Tanggal Mulai *"
                      placeholder="Pilih Tanggal Mulai"
                      value={startDate}
                      onDateChange={date => {
                        setStartDate(date);
                        if (endDate && date > endDate) {
                          setEndDate(date);
                        }
                      }}
                    />

                    <DatePicker
                      label="Tanggal Selesai *"
                      placeholder="Pilih Tanggal Selesai"
                      value={endDate}
                      onDateChange={date => setEndDate(date)}
                    />

                    {/* Live Working Days Calculation Banner */}
                    <View style={styles.durationBanner}>
                      <View style={styles.durationIconBox}>
                        <AppIcon name="calendar-month" size={20} color={color.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText variant="semiBold" style={styles.durationTitle}>
                          Durasi:{' '}
                          <AppText variant="bold" style={styles.durationHighlight}>
                            {totalWorkingDays} Hari Kerja
                          </AppText>
                        </AppText>
                        <AppText style={styles.durationSubtitle}>* Dihitung hanya Senin s.d. Sabtu (Hari Minggu otomatis dilewati)</AppText>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.autoDateCard}>
                    <AppIcon name="event-available" size={22} color="#059669" />
                    <View style={{ flex: 1 }}>
                      <AppText variant="semiBold" style={{ fontSize: 13, color: '#065F46' }}>
                        Tanggal Pengajuan: Hari Ini (Otomatis)
                      </AppText>
                      <AppText style={{ fontSize: 11, color: '#047857', marginTop: 2 }}>
                        Durasi tercatat 1 hari kerja. Anda tidak perlu memilih tanggal mulai atau selesai.
                      </AppText>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View>
                <DatePicker
                  label="Tanggal Mulai *"
                  placeholder="Pilih Tanggal Mulai"
                  value={startDate}
                  onDateChange={date => {
                    setStartDate(date);
                    if (endDate && date > endDate) {
                      setEndDate(date);
                    }
                  }}
                />

                <DatePicker label="Tanggal Selesai *" placeholder="Pilih Tanggal Selesai" value={endDate} onDateChange={date => setEndDate(date)} />

                {/* Live Working Days Calculation Banner with Limit Check */}
                <View style={[styles.durationBanner, isExceedingMaxDays ? styles.durationBannerError : null]}>
                  <View style={[styles.durationIconBox, isExceedingMaxDays ? styles.durationIconBoxError : null]}>
                    <AppIcon
                      name={isExceedingMaxDays ? 'error-outline' : 'calendar-month'}
                      size={20}
                      color={isExceedingMaxDays ? '#DC2626' : color.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="semiBold" style={styles.durationTitle}>
                      Durasi:{' '}
                      <AppText variant="bold" style={isExceedingMaxDays ? styles.durationHighlightError : styles.durationHighlight}>
                        {totalWorkingDays} Hari Kerja
                      </AppText>
                    </AppText>
                    {isExceedingMaxDays ? (
                      <AppText style={styles.durationSubtitleError}>
                        Melebihi batas maksimal {currentRule?.maxDays} hari kerja untuk jenis cuti ini!
                      </AppText>
                    ) : (
                      <AppText style={styles.durationSubtitle}>
                        {currentRule?.maxDays
                          ? `* Sesuai ketentuan (Maksimal ${currentRule.maxDays} hari kerja)`
                          : '* Dihitung hanya Senin s.d. Sabtu (Hari Minggu otomatis dilewati)'}
                      </AppText>
                    )}
                  </View>
                </View>
              </View>
            )}
          </Card>

          {/* Card: Alasan Pengajuan */}
          <Card style={styles.formCard} variant="elevated">
            <AppText variant="bold" style={styles.cardSectionTitle}>
              3. Keterangan & Alasan *
            </AppText>

            <Input
              placeholder="Tuliskan keterangan dan alasan permohonan..."
              value={reason}
              onChangeText={setReason}
              multiline={true}
              numberOfLines={4}
              style={styles.textAreaInput}
            />
          </Card>

          {/* Card: Lampiran Surat Dokter / Bukti */}
          <Card style={styles.formCard} variant="elevated">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AppText variant="bold" style={styles.cardSectionTitle}>
                4. Lampiran Berkas {isSick ? '*' : '(Opsional)'}
              </AppText>
            </View>
            <AppText style={styles.fieldHelpText}>
              {isSick
                ? 'Wajib melampirkan foto atau surat keterangan resmi dari dokter / rumah sakit.'
                : 'Unggah bukti pendukung jika ada (contoh: surat undangan, surat keterangan, dll).'}
            </AppText>

            {/* Selected File Preview */}
            {selectedFile ? (
              <View style={styles.filePreviewContainer}>
                {selectedFile.type.startsWith('image/') ? (
                  <Image source={{ uri: selectedFile.uri }} style={styles.imageThumbnail} />
                ) : (
                  <View style={styles.pdfThumbnailBox}>
                    <AppIcon name="picture-as-pdf" size={28} color="#DC2626" />
                  </View>
                )}

                <View style={styles.fileInfoWrapper}>
                  <AppText variant="bold" style={styles.fileNameText} numberOfLines={1}>
                    {selectedFile.name}
                  </AppText>
                  {selectedFile.size && <AppText style={styles.fileSizeText}>{(selectedFile.size / 1024).toFixed(0)} KB</AppText>}
                </View>

                <TouchableOpacity style={styles.deleteFileBtn} onPress={() => setSelectedFile(null)} activeOpacity={0.7}>
                  <AppIcon name="close" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadButtonsRow}>
                <TouchableOpacity style={styles.uploadBtn} onPress={handleLaunchCamera} activeOpacity={0.7}>
                  <AppIcon name="photo-camera" size={22} color={color.primary} />
                  <AppText variant="semiBold" style={styles.uploadBtnText}>
                    Foto Kamera
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.uploadBtn} onPress={handleLaunchGallery} activeOpacity={0.7}>
                  <AppIcon name="photo-library" size={22} color={color.primary} />
                  <AppText variant="semiBold" style={styles.uploadBtnText}>
                    Galeri Foto
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.uploadBtn} onPress={handleLaunchDocumentPicker} activeOpacity={0.7}>
                  <AppIcon name="file-present" size={22} color={color.primary} />
                  <AppText variant="semiBold" style={styles.uploadBtnText}>
                    File PDF
                  </AppText>
                </TouchableOpacity>
              </View>
            )}
          </Card>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <Button
              title={processing ? 'Sedang Mengirim...' : 'Kirim Pengajuan Cuti / Izin'}
              loading={processing}
              disabled={processing || isExceedingMaxDays}
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LeaveRequestCreateScreen;

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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
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
  formCard: {
    backgroundColor: color.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardSectionTitle: {
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 10,
  },
  fieldHelpText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 10,
  },
  ruleInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: '#BFDBFE',
    marginTop: 10,
  },
  ruleTitleText: {
    fontSize: 13,
    color: '#1E40AF',
  },
  ruleBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ruleBadgeText: {
    fontSize: 10,
    color: '#1E40AF',
  },
  ruleDescText: {
    fontSize: 11,
    color: '#3B82F6',
    lineHeight: 15,
  },
  sickNoticeBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  toggleCustomDatesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  toggleCustomDatesTitle: {
    fontSize: 13,
    color: '#1E293B',
  },
  toggleCustomDatesSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  autoDateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 4,
  },
  durationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 8,
  },
  durationBannerError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  durationIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationIconBoxError: {
    backgroundColor: '#FEE2E2',
  },
  durationTitle: {
    fontSize: 13,
    color: '#1E293B',
  },
  durationHighlight: {
    fontSize: 14,
    color: color.primary,
  },
  durationHighlightError: {
    fontSize: 14,
    color: '#DC2626',
  },
  durationSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  durationSubtitleError: {
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 2,
    fontWeight: '600',
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    gap: 6,
  },
  uploadBtnText: {
    fontSize: 11,
    color: color.primary,
  },
  filePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  imageThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  pdfThumbnailBox: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfoWrapper: {
    flex: 1,
    gap: 2,
  },
  fileNameText: {
    fontSize: 12,
    color: '#0F172A',
  },
  fileSizeText: {
    fontSize: 11,
    color: '#64748B',
  },
  deleteFileBtn: {
    padding: 6,
  },
  submitContainer: {
    marginTop: 10,
  },
});
