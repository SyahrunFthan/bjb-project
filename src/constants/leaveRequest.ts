export interface LeaveTypeRule {
  value: string;
  label: string;
  shortLabel: string;
  maxDays?: number;
  isDatesOptional?: boolean;
  requiresDoctorNote?: boolean;
  description: string;
}

export const LEAVE_TYPE_RULES: Record<string, LeaveTypeRule> = {
  marriage_employee: {
    value: 'marriage_employee',
    label: 'Karyawan Menikah (Maks. 6 Hari)',
    shortLabel: 'Karyawan Menikah',
    maxDays: 6,
    description: 'Hak cuti pernikahan karyawan (maksimal 6 hari kerja).',
  },
  marriage_sibling: {
    value: 'marriage_sibling',
    label: 'Saudara Kandung Menikah (Maks. 3 Hari)',
    shortLabel: 'Saudara Menikah',
    maxDays: 3,
    description: 'Hak cuti menghadiri pernikahan saudara kandung (maksimal 3 hari kerja).',
  },
  child_circumcision_baptism: {
    value: 'child_circumcision_baptism',
    label: 'Menghitan / Membaptis Anak (Maks. 2 Hari)',
    shortLabel: 'Khitan / Baptis Anak',
    maxDays: 2,
    description: 'Hak cuti keperluan menghitan atau membaptis anak (maksimal 2 hari kerja).',
  },
  death_main_family: {
    value: 'death_main_family',
    label: 'Suami/Istri/Anak/Ortu/Saudara/Mertua Meninggal (Maks. 7 Hari)',
    shortLabel: 'Duka Cita Inti',
    maxDays: 7,
    description: 'Cuti duka anggota keluarga inti (suami/istri/anak/orang tua/saudara kandung/mertua) maksimal 7 hari kerja.',
  },
  wife_childbirth_miscarriage: {
    value: 'wife_childbirth_miscarriage',
    label: 'Istri Melahirkan / Mengalami Pendarahan (Maks. 2 Hari)',
    shortLabel: 'Istri Melahirkan',
    maxDays: 2,
    description: 'Hak cuti mendampingi istri melahirkan atau keguguran/pendarahan (maksimal 2 hari kerja).',
  },
  death_household_member: {
    value: 'death_household_member',
    label: 'Anggota Keluarga Serumah Meninggal (Maks. 2 Hari)',
    shortLabel: 'Duka Cita Serumah',
    maxDays: 2,
    description: 'Cuti duka anggota keluarga yang berdomisili satu rumah (maksimal 2 hari kerja).',
  },
  sick_leave: {
    value: 'sick_leave',
    label: 'Sakit (Wajib Surat Dokter)',
    shortLabel: 'Izin Sakit',
    isDatesOptional: true,
    requiresDoctorNote: true,
    description: 'Tanggal mulai & tanggal selesai tidak wajib diisi (default hari ini). Wajib melampirkan foto surat dokter.',
  },
  urgent_personal: {
    value: 'urgent_personal',
    label: 'Cuti Penting - Tidak Bisa Diwakili (Maks. 3 Hari)',
    shortLabel: 'Cuti Penting',
    maxDays: 3,
    description: 'Cuti keperluan penting mendesak yang tidak dapat diwakilkan (maksimal 3 hari kerja).',
  },
};

export const LEAVE_TYPE_OPTIONS = Object.values(LEAVE_TYPE_RULES).map(rule => ({
  label: rule.label,
  value: rule.value,
}));

export const getLeaveTypeRule = (type: string): LeaveTypeRule | undefined => {
  return LEAVE_TYPE_RULES[type];
};

export const getLeaveTypeLabel = (type: string): string => {
  if (LEAVE_TYPE_RULES[type]) {
    return LEAVE_TYPE_RULES[type].shortLabel;
  }
  // Fallbacks for backward compatibility
  switch (type) {
    case 'annual_leave':
      return 'Cuti Tahunan';
    case 'permit':
      return 'Izin Pribadi';
    case 'maternity_leave':
      return 'Cuti Khusus';
    case 'marriage_leave':
      return 'Izin Menikah';
    case 'special_leave':
      return 'Izin Khusus';
    default:
      return type;
  }
};
