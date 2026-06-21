import { Onboarding1, Onboarding2, Onboarding3 } from '@/assets/images';
import { ImageSourcePropType } from 'react-native';

export interface OnboardingData {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
}

export const ONBOARDING_DATA: OnboardingData[] = [
  {
    id: '1',
    title: 'Portal Anggota Resmi BJB',
    description:
      'Aplikasi eksklusif anggota resmi PT. Bare Jaya Berdikari. Akun Anda didaftarkan secara offline oleh petugas lapangan kami setelah verifikasi.',
    image: Onboarding1,
  },
  {
    id: '2',
    title: 'Pantau Kewajiban & Invoice',
    description: 'Pantau rincian tagihan harian, sisa kewajiban pinjaman, dan invoice digital Anda secara transparan langsung dari genggaman.',
    image: Onboarding2,
  },
  {
    id: '3',
    title: 'Pembayaran Luring Terbantu',
    description:
      'Pembayaran cicilan dijemput langsung secara tunai oleh petugas lapangan resmi, dan dapatkan bukti tanda terima digital real-time di aplikasi.',
    image: Onboarding3,
  },
];
