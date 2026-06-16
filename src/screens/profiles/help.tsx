import React from 'react';
import { ScrollView, StatusBar, StyleSheet, TouchableOpacity, View, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RouteParamList, 'Help'>;

const HelpScreen = ({ navigation }: Props) => {
  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Oops', 'Aplikasi atau tautan ini tidak dapat dibuka.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={color.white} barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <AppIcon name="arrow-back" size={20} color={color.black} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle} variant="semiBold">Pusat Bantuan</AppText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Intro Section */}
        <View style={styles.introCard}>
          <View style={styles.introIconContainer}>
            <AppIcon name="support-agent" size={36} color={color.primary} />
          </View>
          <AppText variant="bold" style={styles.introTitle}>Ada Kendala atau Pertanyaan?</AppText>
          <AppText style={styles.introDesc}>
            Tim Customer Service KSP PT. Bare Jaya Berdikari siap membantu Anda menemukan solusi terbaik untuk kebutuhan finansial Anda.
          </AppText>
        </View>

        {/* Contact Options */}
        <AppText variant="bold" style={styles.sectionTitle}>Pilih Saluran Hubung</AppText>

        {/* WhatsApp Card */}
        <TouchableOpacity 
          style={styles.contactCard} 
          activeOpacity={0.8}
          onPress={() => handleOpenLink('https://wa.me/6281234567890?text=Halo%20Admin%20KSP%20PT.%20Bare%20Jaya%20Berdikari,%20saya%20butuh%20bantuan...')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#E6FDF4' }]}>
            <AppIcon name="chat" size={24} color="#10B981" />
          </View>
          <View style={styles.cardInfo}>
            <AppText variant="bold" style={styles.cardTitle}>WhatsApp Support</AppText>
            <AppText style={styles.cardDesc}>Respon cepat via pesan instan chat WhatsApp</AppText>
          </View>
          <AppIcon name="chevron-right" size={20} color={color.neutral} />
        </TouchableOpacity>

        {/* Instagram Card */}
        <TouchableOpacity 
          style={styles.contactCard} 
          activeOpacity={0.8}
          onPress={() => handleOpenLink('https://www.instagram.com/barejayaberdikari')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#FDF2F8' }]}>
            <AppIcon name="photo-camera" size={24} color="#EC4899" />
          </View>
          <View style={styles.cardInfo}>
            <AppText variant="bold" style={styles.cardTitle}>Instagram Resmi</AppText>
            <AppText style={styles.cardDesc}>Ikuti berita terbaru & info layanan kami</AppText>
          </View>
          <AppIcon name="chevron-right" size={20} color={color.neutral} />
        </TouchableOpacity>

        {/* Email Card */}
        <TouchableOpacity 
          style={styles.contactCard} 
          activeOpacity={0.8}
          onPress={() => handleOpenLink('mailto:bjb@barejaya.id')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
            <AppIcon name="email" size={24} color="#3B82F6" />
          </View>
          <View style={styles.cardInfo}>
            <AppText variant="bold" style={styles.cardTitle}>Email Support</AppText>
            <AppText style={styles.cardDesc}>Kirim keluhan resmi atau berkas dokumen</AppText>
          </View>
          <AppIcon name="chevron-right" size={20} color={color.neutral} />
        </TouchableOpacity>

        {/* Info Card */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <AppIcon name="location-on" size={18} color={color.primary} />
            <View style={styles.infoTextContainer}>
              <AppText variant="semiBold" style={styles.infoLabel}>Alamat Kantor</AppText>
              <AppText style={styles.infoValue}>Jl. Cendrawasih Tojo Una-Una, Sulawesi Tengah, Indonesia</AppText>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <AppIcon name="phone" size={18} color={color.primary} />
            <View style={styles.infoTextContainer}>
              <AppText variant="semiBold" style={styles.infoLabel}>Jam Operasional</AppText>
              <AppText style={styles.infoValue}>Senin - Jumat | 08:00 - 16:00 WITA</AppText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpScreen;

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
  introCard: {
    backgroundColor: color.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  introIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 16,
    color: color.black,
    marginBottom: 6,
    textAlign: 'center',
  },
  introDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    color: color.neutral,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 14,
    color: color.black,
  },
  cardDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  infoBox: {
    backgroundColor: color.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginTop: 12,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  infoTextContainer: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: color.black,
  },
  infoValue: {
    fontSize: 12,
    color: color.neutral,
    lineHeight: 16,
  },
  infoDivider: {
    height: 0.5,
    backgroundColor: '#E2E8F0',
  },
});
