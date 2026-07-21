import React from 'react';
import { ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RouteParamList, 'Terms'>;

const TermsScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={color.white} barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <AppIcon name="arrow-back" size={20} color={color.black} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle} variant="semiBold">Syarat & Kebijakan</AppText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Compliance Banner */}
        <View style={styles.complianceBanner}>
          <View style={styles.complianceIconContainer}>
            <AppIcon name="gavel" size={20} color="#10B981" />
          </View>
          <View style={styles.complianceTextContainer}>
            <AppText variant="bold" style={styles.complianceTitle}>
              Pernyataan Kepatuhan Layanan Keuangan
            </AppText>
            <AppText style={styles.complianceDesc}>
              Aplikasi Koperasi Pinjaman PT. Bare Jaya Berdikari adalah portal administrasi internal dan monitoring real-time yang ditujukan <AppText variant="bold">HANYA untuk anggota resmi</AppText> Koperasi Pinjaman PT. Bare Jaya Berdikari. Aplikasi ini mematuhi Peraturan Kementerian Koperasi & UKM RI, Otoritas Jasa Keuangan (OJK), dan Kebijakan Layanan Keuangan Google Play Store.
            </AppText>
          </View>
        </View>

        {/* Section 1 */}
        <View style={styles.sectionCard}>
          <AppText variant="bold" style={styles.sectionHeader}>
            1. Ketentuan Umum & Keanggotaan
          </AppText>
          <AppText style={styles.paragraph}>
            Dengan mengunduh, memasang, dan/atau menggunakan aplikasi Koperasi Pinjaman PT. Bare Jaya Berdikari ("Aplikasi"), Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui seluruh ketentuan dalam Syarat dan Ketentuan Layanan ini. Jika Anda tidak menyetujui ketentuan ini, mohon untuk tidak melanjutkan penggunaan Aplikasi.
          </AppText>
          <View style={styles.bulletItem}>
            <AppText style={styles.bulletSymbol}>•</AppText>
            <AppText style={styles.bulletText}>
              <AppText variant="bold">Pembatasan Anggota:</AppText> Layanan ini ditujukan secara eksklusif kepada Anggota Resmi Koperasi Pinjaman PT. Bare Jaya Berdikari yang memiliki Nomor Baku Anggota (NBA).
            </AppText>
          </View>
          <View style={styles.bulletItem}>
            <AppText style={styles.bulletSymbol}>•</AppText>
            <AppText style={styles.bulletText}>
              <AppText variant="bold">Kelayakan Usia:</AppText> Pengguna harus berusia minimal 21 tahun atau telah menikah, dan secara hukum cakap untuk mengikatkan diri dalam perjanjian pinjaman berdasarkan hukum Indonesia.
            </AppText>
          </View>
          <View style={styles.bulletItem}>
            <AppText style={styles.bulletSymbol}>•</AppText>
            <AppText style={styles.bulletText}>
              <AppText variant="bold">Modifikasi Syarat:</AppText> Kami berhak untuk mengubah Syarat dan Ketentuan ini sewaktu-waktu demi mematuhi pembaruan kebijakan regulasi pemerintah atau pembaruan fitur Aplikasi. Perubahan akan diumumkan melalui notifikasi Aplikasi.
            </AppText>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.sectionCard}>
          <AppText variant="bold" style={styles.sectionHeader}>
            2. Pendaftaran Akun & Keamanan
          </AppText>
          <AppText style={styles.paragraph}>
            Proses pembuatan akun dan pendaftaran data Anggota/Nasabah dilakukan sepenuhnya secara luring (offline) oleh Petugas Lapangan resmi Koperasi Pinjaman PT. Bare Jaya Berdikari.
          </AppText>
          <View style={styles.bulletItem}>
            <AppText style={styles.bulletSymbol}>•</AppText>
            <AppText style={styles.bulletText}>
              <AppText variant="bold">Pembuatan Akun oleh Petugas:</AppText> Akun Anda akan dibuat secara langsung oleh petugas setelah data keanggotaan Anda diverifikasi di lapangan. Aplikasi ini tidak menyediakan pendaftaran mandiri (self-registration) untuk umum.
            </AppText>
          </View>
          <View style={styles.bulletItem}>
            <AppText style={styles.bulletSymbol}>•</AppText>
            <AppText style={styles.bulletText}>
              <AppText variant="bold">Aktivasi Kredensial:</AppText> Anda akan menerima informasi login (email dan kata sandi sementara) secara langsung dari petugas lapangan untuk melakukan login pertama kali.
            </AppText>
          </View>
          <View style={styles.bulletItem}>
            <AppText style={styles.bulletSymbol}>•</AppText>
            <AppText style={styles.bulletText}>
              <AppText variant="bold">Kerahasiaan Akun:</AppText> Anda sepenuhnya bertanggung jawab atas kata sandi dan keamanan akun Anda. Jangan membagikan detail login Anda kepada siapa pun, termasuk petugas lapangan kami.
            </AppText>
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.sectionCard}>
          <AppText variant="bold" style={styles.sectionHeader}>
            3. Layanan Pinjaman, Invoice & Pembayaran
          </AppText>
          <AppText style={styles.paragraph}>
            Aplikasi ini dirancang sebagai portal utilitas keanggotaan dengan alur transaksi sebagai berikut:
          </AppText>
          <View style={styles.bulletItem}>
            <AppText style={styles.bulletSymbol}>•</AppText>
            <AppText style={styles.bulletText}>
              <AppText variant="bold">Monitoring Terbatas:</AppText> Nasabah/Anggota hanya diberikan akses khusus untuk memantau data tagihan, sisa kewajiban, dan invoice masing-masing yang terdaftar atas nama mereka sendiri.
            </AppText>
          </View>
          <View style={styles.bulletItem}>
            <AppText style={styles.bulletSymbol}>•</AppText>
            <AppText style={styles.bulletText}>
              <AppText variant="bold">Invoice Digital:</AppText> Aplikasi secara otomatis menerbitkan dan menyajikan rincian invoice tagihan digital secara berkala sebagai bukti kewajiban pembayaran yang transparan.
            </AppText>
          </View>
          <View style={styles.bulletItem}>
            <AppText style={styles.bulletSymbol}>•</AppText>
            <AppText style={styles.bulletText}>
              <AppText variant="bold">Metode Pembayaran:</AppText> Pembayaran cicilan hanya dapat dilakukan dengan pembayaran tunai yang diambil/dijemput langsung secara luring oleh petugas lapangan Koperasi yang dilengkapi identitas resmi dan tanda terima digital.
            </AppText>
          </View>
        </View>

        {/* Section 4 */}
        <View style={styles.sectionCard}>
          <AppText variant="bold" style={styles.sectionHeader}>
            4. Tenor, Suku Bunga & Ketentuan Pinjaman
          </AppText>
          <AppText style={styles.paragraph}>
            Produk pinjaman yang disediakan oleh PT. Bare Jaya Berdikari memiliki pilihan jangka waktu (tenor) sesuai dengan kebijakan perusahaan dan kesepakatan yang tercantum dalam perjanjian pinjaman.
          </AppText>
          <AppText style={styles.paragraph}>
            Besaran suku bunga, biaya administrasi, jumlah angsuran, serta total kewajiban pembayaran akan diinformasikan secara transparan kepada Anggota sebelum pinjaman disetujui dan dicantumkan dalam perjanjian pinjaman yang ditandatangani oleh kedua belah pihak.
          </AppText>
          <AppText style={styles.paragraph}>
            Anggota menyatakan telah membaca, memahami, dan menyetujui seluruh rincian pinjaman yang telah disepakati bersama sebelum proses pencairan dilakukan.
          </AppText>
        </View>

        {/* Section 5 */}
        <View style={styles.sectionCard}>
          <AppText variant="bold" style={styles.sectionHeader}>
            5. Pengumpulan & Penggunaan Data
          </AppText>
          <AppText style={styles.paragraph}>
            Privasi data Anda adalah prioritas kami. Seluruh informasi data pribadi yang dikumpulkan melalui Aplikasi diatur dalam Kebijakan Privasi Koperasi Pinjaman PT. Bare Jaya Berdikari.
          </AppText>
          <View style={styles.bulletItem}>
            <AppText style={styles.bulletSymbol}>•</AppText>
            <AppText style={styles.bulletText}>
              <AppText variant="bold">Tujuan Pengumpulan:</AppText> Data KTP, Informasi Keuangan, dan NBA dikumpulkan secara khusus untuk verifikasi status keanggotaan koperasi dan kepatuhan prinsip Mengenal Nasabah (Know Your Customer - KYC).
            </AppText>
          </View>
          <View style={styles.bulletItem}>
            <AppText style={styles.bulletSymbol}>•</AppText>
            <AppText style={styles.bulletText}>
              <AppText variant="bold">Enkripsi Data:</AppText> Semua transmisi data pribadi dan transaksi finansial dienkripsi dengan aman menggunakan teknologi SSL/HTTPS berkekuatan tinggi guna mencegah penyadapan data.
            </AppText>
          </View>
          <View style={styles.bulletItem}>
            <AppText style={styles.bulletSymbol}>•</AppText>
            <AppText style={styles.bulletText}>
              <AppText variant="bold">Pihak Ketiga:</AppText> Kami tidak pernah menjual atau membagikan data pribadi Anda kepada pihak eksternal, kecuali diwajibkan oleh hukum atau putusan pengadilan Indonesia.
            </AppText>
          </View>
        </View>

        {/* Section 6 */}
        <View style={styles.sectionCard}>
          <AppText variant="bold" style={styles.sectionHeader}>
            6. Batasan Tanggung Jawab
          </AppText>
          <AppText style={styles.paragraph}>
            Koperasi Pinjaman PT. Bare Jaya Berdikari berupaya semaksimal mungkin menyediakan sistem teknologi yang andal, aman, dan tanpa kendala. Namun:
          </AppText>
          <View style={styles.bulletItem}>
            <AppText style={styles.bulletSymbol}>•</AppText>
            <AppText style={styles.bulletText}>
              Kami tidak bertanggung jawab atas kerugian finansial atau kerugian lainnya yang diakibatkan oleh kelalaian Anggota (e.g., kebocoran OTP/PIN, ponsel hilang, perangkat lunak berbahaya/malware di perangkat Anggota).
            </AppText>
          </View>
          <View style={styles.bulletItem}>
            <AppText style={styles.bulletSymbol}>•</AppText>
            <AppText style={styles.bulletText}>
              Kami tidak bertanggung jawab atas gangguan layanan Aplikasi yang terjadi di luar kendali wajar kami (Force Majeure), seperti bencana alam, pemadaman listrik massal, atau gangguan jaringan internet nasional.
            </AppText>
          </View>
        </View>

        {/* Section 7 */}
        <View style={styles.sectionCard}>
          <AppText variant="bold" style={styles.sectionHeader}>
            7. Hukum yang Berlaku & Penyelesaian Perselisihan
          </AppText>
          <AppText style={styles.paragraph}>
            Syarat & Ketentuan Layanan ini dibuat, ditafsirkan, dan dilaksanakan berdasarkan hukum Negara Kesatuan Republik Indonesia.
          </AppText>
          <AppText style={styles.paragraph}>
            Setiap perselisihan atau pertikaian yang timbul dari atau berkaitan dengan penggunaan Aplikasi ini akan diselesaikan secara musyawarah mufakat. Apabila kesepakatan tidak tercapai, perselisihan akan diselesaikan melalui jalur hukum resmi di Pengadilan Negeri yang disepakati bersama oleh kedua belah pihak.
          </AppText>
        </View>

        {/* Section 8 */}
        <View style={styles.sectionCard}>
          <AppText variant="bold" style={styles.sectionHeader}>
            8. Hubungi Kami
          </AppText>
          <AppText style={styles.paragraph}>
            Jika Anda memiliki pertanyaan, keluhan, kendala transaksi, atau memerlukan klarifikasi terkait dokumen Syarat & Ketentuan Layanan ini, silakan hubungi kami melalui saluran resmi berikut:
          </AppText>

          {/* Contact Details */}
          <View style={styles.contactContainer}>
            <View style={styles.contactItem}>
              <View style={styles.contactIconCircle}>
                <AppIcon name="location-on" size={16} color={color.primary} />
              </View>
              <View style={styles.contactTextContainer}>
                <AppText variant="semiBold" style={styles.contactLabel}>Alamat Kantor</AppText>
                <AppText style={styles.contactValue}>Jl. Sis-Aljufrie, Kab. Tojo Una Una, Kec. Ampana Kota Sulawesi Tengah</AppText>
              </View>
            </View>

            <View style={styles.contactItem}>
              <View style={styles.contactIconCircle}>
                <AppIcon name="phone" size={16} color={color.primary} />
              </View>
              <View style={styles.contactTextContainer}>
                <AppText variant="semiBold" style={styles.contactLabel}>Telepon</AppText>
                <AppText style={styles.contactValue}>082151077894 (Senin - Jumat | 08:00 - 16:00 WITA)</AppText>
              </View>
            </View>

            <View style={styles.contactItem}>
              <View style={styles.contactIconCircle}>
                <AppIcon name="email" size={16} color={color.primary} />
              </View>
              <View style={styles.contactTextContainer}>
                <AppText variant="semiBold" style={styles.contactLabel}>Email Support</AppText>
                <AppText style={styles.contactValue}>bjb@barejaya.id</AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Footer Branding */}
        <View style={styles.footer}>
          <AppText style={styles.footerText}>
            &copy; {new Date().getFullYear()} PT. Bare Jaya Berdikari. Hak Cipta Dilindungi Undang-Undang.
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsScreen;

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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    borderWidth: 0.5,
    borderColor: color.border,
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
  complianceBanner: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  complianceIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  complianceTextContainer: {
    flex: 1,
  },
  complianceTitle: {
    fontSize: 13,
    color: '#065F46',
    marginBottom: 4,
  },
  complianceDesc: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: color.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    fontSize: 15,
    color: color.primary,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  paragraph: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
    paddingRight: 8,
  },
  bulletSymbol: {
    fontSize: 12,
    color: color.primary,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  simulationBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  simulationField: {
    gap: 4,
  },
  simLabel: {
    fontSize: 10,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  simValue: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
  },
  simDivider: {
    height: 0.5,
    backgroundColor: '#E2E8F0',
  },
  simIntro: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
    marginBottom: 6,
  },
  subBulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 6,
    paddingLeft: 6,
  },
  subBulletText: {
    flex: 1,
    fontSize: 11,
    color: '#475569',
  },
  contactContainer: {
    gap: 12,
    marginTop: 8,
  },
  contactItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  contactIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    borderWidth: 0.5,
    borderColor: '#DBEAFE',
  },
  contactTextContainer: {
    flex: 1,
    gap: 2,
  },
  contactLabel: {
    fontSize: 11,
    color: color.black,
  },
  contactValue: {
    fontSize: 11,
    color: color.neutral,
    lineHeight: 15,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#E2E8F0',
    marginTop: 8,
  },
  footerText: {
    fontSize: 10,
    color: color.neutral,
    textAlign: 'center',
  },
});
