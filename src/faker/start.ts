import { ImageSourcePropType } from 'react-native';
import { Onboarding1, Onboarding2, Onboarding3 } from '@/assets/images';

export interface OnboardingData {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
}

export const ONBOARDING_DATA: OnboardingData[] = [
  {
    id: '1',
    title: 'Pengajuan Pinjaman Cepat',
    description: 'Akses dana darurat atau modal usaha dalam hitungan menit dengan proses koperasi yang modern.',
    image: Onboarding1,
  },
  {
    id: '2',
    title: 'Simpanan & Investasi Cerdas',
    description: 'Kelola masa depan finansial Anda dengan produk simpanan yang aman dan menguntungkan.',
    image: Onboarding2,
  },
  {
    id: '3',
    title: 'Kelola Keuangan Mudah',
    description: 'Pantau saldo, mutasi, dan pengajuan Anda kapan saja dan di mana saja dengan aman.',
    image: Onboarding3,
  },
];
