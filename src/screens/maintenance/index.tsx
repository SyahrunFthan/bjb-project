import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import api from '@/lib/api';
import { reset } from '@/lib/navigate';
import React, { useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

const MaintenanceScreen = () => {
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const checkStatus = async () => {
    setChecking(true);
    setStatusMessage(null);
    try {
      const response = await api.get('/settings/maintenance/status');
      if (response.data && response.data.maintenance === false) {
        setStatusMessage('Sistem sudah kembali online! Membuka aplikasi...');
        setTimeout(() => {
          reset('Splash');
        }, 1500);
      } else {
        setStatusMessage('Sistem masih dalam pemeliharaan. Silakan coba beberapa saat lagi.');
      }
    } catch (error) {
      setStatusMessage('Gagal menghubungi server. Silakan periksa koneksi internet Anda.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={color.primary} barStyle={'light-content'} />

      {/* Icon Area */}
      <View style={styles.iconContainer}>
        <View style={styles.outerCircle}>
          <View style={styles.innerCircle}>
            <AppIcon name="build" size={60} color={color.primary} />
          </View>
        </View>
        {/* Badge Warning */}
        <View style={styles.warningBadge}>
          <AppIcon name="warning" size={16} color={color.white} />
        </View>
      </View>

      {/* Text Area */}
      <View style={styles.textContainer}>
        <AppText variant="bold" style={styles.title}>
          Pemeliharaan Sistem
        </AppText>
        <AppText style={styles.description}>
          Saat ini kami sedang melakukan peningkatan dan pemeliharaan rutin untuk meningkatkan kualitas layanan. Aplikasi akan segera kembali online.
        </AppText>
        <AppText style={styles.subDescription}>Terima kasih atas kesabaran Anda.</AppText>
      </View>

      {/* Button Area */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, checking && styles.buttonDisabled]} onPress={checkStatus} disabled={checking}>
          {checking ? (
            <ActivityIndicator size="small" color={color.white} style={{ marginRight: 8 }} />
          ) : (
            <AppIcon name="refresh" size={20} color={color.white} style={{ marginRight: 8 }} />
          )}
          <AppText variant="bold" style={styles.buttonText}>
            {checking ? 'Memeriksa...' : 'Coba Lagi'}
          </AppText>
        </TouchableOpacity>

        {statusMessage && (
          <AppText style={[styles.statusText, statusMessage.includes('online') ? styles.statusSuccess : styles.statusError]}>{statusMessage}</AppText>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <AppText style={styles.errorCode}>Status: 503 | Service Unavailable</AppText>
      </View>
    </View>
  );
};

export default MaintenanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Sleek clean background
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 40,
    position: 'relative',
  },
  outerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: color.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: color.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: color.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  warningBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: color.tertiary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F8FAFC',
    elevation: 3,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    color: color.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: color.neutral,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  subDescription: {
    fontSize: 13,
    color: color.neutral,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: color.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    width: '80%',
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: color.white,
    fontSize: 15,
  },
  statusText: {
    marginTop: 15,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  statusSuccess: {
    color: 'green',
  },
  statusError: {
    color: color.tertiary,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
  },
  errorCode: {
    fontSize: 11,
    color: color.neutral + '80',
  },
});
