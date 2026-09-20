import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import Geolocation from '@react-native-community/geolocation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AxiosError } from 'axios';
import { Camera, CameraApi, CameraType } from 'react-native-camera-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

import { clockIn, clockOut, registerFace } from '@/api/attendance';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { useModal } from '@/hooks/useModal';
import { RouteParamList } from '@/types/navigation';

Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'whenInUse',
  locationProvider: 'auto',
});

const { width, height } = Dimensions.get('window');
const OVAL_HEIGHT = height * 0.44;

type Props = NativeStackScreenProps<RouteParamList, 'FaceCamera'>;

const FaceCameraScreen: React.FC<Props> = ({ navigation, route }) => {
  const { mode = 'clock-in', isSimulated = false, onSuccess } = route.params || {};

  const modal = useModal();
  const cameraRef = useRef<CameraApi>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(true);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [cameraReady, setCameraReady] = useState<boolean>(false);

  // GPS Geolocation state
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'searching' | 'ready' | 'denied' | 'error'>('searching');

  // Animation values
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const verifyLaserAnim = useRef(new Animated.Value(0)).current;
  const radarAnim1 = useRef(new Animated.Value(0)).current;
  const radarAnim2 = useRef(new Animated.Value(0)).current;
  const progressBarAnim = useRef(new Animated.Value(0)).current;
  const [statusStep, setStatusStep] = useState(0);

  const statusMessages = [
    'Memindai Biometrik Wajah...',
    'Mencocokkan dengan Master...',
    'Memvalidasi Radius GPS Kantor...',
    'Menyimpan Data Presensi...',
  ];

  // Viewfinder Animations (Looping Laser & Pulsing Oval Guide)
  useEffect(() => {
    let scanLoop: Animated.CompositeAnimation | null = null;
    let pulseLoop: Animated.CompositeAnimation | null = null;

    if (!capturedUri) {
      scanLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );

      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.025,
            duration: 1300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

      scanLoop.start();
      pulseLoop.start();
    }

    return () => {
      scanLoop?.stop();
      pulseLoop?.stop();
    };
  }, [capturedUri, scanAnim, pulseAnim]);

  // Attendance Submission Biometric Animation (Fast Laser, Radar Ripples, Dynamic Steps)
  useEffect(() => {
    let radar1: Animated.CompositeAnimation | null = null;
    let radar2: Animated.CompositeAnimation | null = null;
    let verifyLaser: Animated.CompositeAnimation | null = null;
    let progressLoop: Animated.CompositeAnimation | null = null;
    let statusInterval: ReturnType<typeof setInterval> | null = null;

    if (processing) {
      radar1 = Animated.loop(
        Animated.timing(radarAnim1, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      );
      radar2 = Animated.loop(
        Animated.sequence([
          Animated.delay(600),
          Animated.timing(radarAnim2, {
            toValue: 1,
            duration: 1800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
      verifyLaser = Animated.loop(
        Animated.sequence([
          Animated.timing(verifyLaserAnim, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(verifyLaserAnim, {
            toValue: 0,
            duration: 1100,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
      progressLoop = Animated.loop(
        Animated.timing(progressBarAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );

      radar1.start();
      radar2.start();
      verifyLaser.start();
      progressLoop.start();

      statusInterval = setInterval(() => {
        setStatusStep(prev => (prev + 1) % statusMessages.length);
      }, 1400);
    } else {
      radarAnim1.setValue(0);
      radarAnim2.setValue(0);
      verifyLaserAnim.setValue(0);
      progressBarAnim.setValue(0);
      setStatusStep(0);
    }

    return () => {
      radar1?.stop();
      radar2?.stop();
      verifyLaser?.stop();
      progressLoop?.stop();
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [processing, radarAnim1, radarAnim2, verifyLaserAnim, progressBarAnim, statusMessages.length]);

  const requestLocation = useCallback(async () => {
    if (mode === 'register') return;

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          title: 'Izin Lokasi Presensi',
          message: 'Aplikasi membutuhkan akses GPS untuk memverifikasi radius kantor cabang saat presensi.',
          buttonNeutral: 'Nanti',
          buttonNegative: 'Tolak',
          buttonPositive: 'Izinkan',
        });

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setLocationStatus('denied');
          return;
        }
      } catch (err) {
        console.warn('Location permission request error:', err);
      }
    }

    setLocationStatus('searching');
    Geolocation.getCurrentPosition(
      pos => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationStatus('ready');
      },
      err => {
        console.warn('Geolocation high accuracy error, trying fallback:', err);
        Geolocation.getCurrentPosition(
          fallbackPos => {
            setCoords({
              latitude: fallbackPos.coords.latitude,
              longitude: fallbackPos.coords.longitude,
            });
            setLocationStatus('ready');
          },
          finalErr => {
            console.error('Geolocation failed completely:', finalErr);
            setLocationStatus('error');
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );
  }, [mode]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (cameraRef.current?.checkDeviceCameraAuthorizationStatus) {
          const status = await cameraRef.current.checkDeviceCameraAuthorizationStatus();
          if (!status) {
            const requested = await cameraRef.current.requestDeviceCameraAuthorization();
            setHasPermission(requested);
          } else {
            setHasPermission(true);
          }
        }
      } catch (err) {
        console.warn('Camera permission check failed:', err);
      }
    };

    checkPermission();
  }, []);

  const getTitle = () => {
    switch (mode) {
      case 'register':
        return 'Pendaftaran Wajah Master';
      case 'clock-out':
        return 'Presensi Pulang';
      case 'clock-in':
      default:
        return 'Presensi Masuk';
    }
  };

  const handleCapture = async () => {
    try {
      if (!cameraRef.current) return;

      // Shutter flash animation
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const image = await cameraRef.current.capture();
      if (image && image.uri) {
        setCapturedUri(image.uri);
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
      modal.result.error('Gagal Mengambil Foto', 'Silakan periksa izin kamera dan coba lagi.');
    }
  };

  const handleSubmit = async () => {
    if (!capturedUri) return;

    if (mode !== 'register') {
      if (locationStatus === 'denied') {
        modal.result.error(
          'Izin Lokasi Diperlukan',
          'Presensi memerlukan koordinat GPS untuk memvalidasi radius kantor cabang. Mohon berikan izin lokasi di pengaturan HP.',
        );
        return;
      }

      if (!coords) {
        modal.confirm.show('Menunggu Lokasi GPS', 'Sedang mencari titik koordinat GPS. Pastikan GPS aktif di perangkat Anda lalu coba lagi.', () =>
          requestLocation(),
        );
        return;
      }
    }

    try {
      setProcessing(true);

      if (mode === 'register') {
        const res = await registerFace(capturedUri);
        modal.result.success('Berhasil', res.message || 'Wajah master berhasil didaftarkan!', () => {
          onSuccess?.();
          navigation.goBack();
        });
      } else if (mode === 'clock-in') {
        const res = await clockIn(capturedUri, coords!.latitude, coords!.longitude, isSimulated);
        modal.result.success('Presensi Berhasil', res.message || 'Presensi masuk berhasil dicatat.', () => {
          onSuccess?.();
          navigation.goBack();
        });
      } else if (mode === 'clock-out') {
        const res = await clockOut(capturedUri, coords!.latitude, coords!.longitude, isSimulated);
        modal.result.success('Presensi Berhasil', res.message || 'Presensi pulang berhasil dicatat.', () => {
          onSuccess?.();
          navigation.goBack();
        });
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorObj = error as Error;
      const msg = axiosError.response?.data?.message || errorObj?.message || 'Terjadi kesalahan saat memproses data wajah.';

      const title = mode === 'register' ? 'Pendaftaran Wajah Gagal' : 'Presensi Gagal';
      modal.result.error(title, msg, () => {
        setCapturedUri(null);
      });
    } finally {
      setProcessing(false);
    }
  };

  const renderGpsBadge = () => {
    if (mode === 'register') return null;

    return (
      <TouchableOpacity
        style={[
          styles.gpsBadge,
          locationStatus === 'ready' ? styles.gpsBadgeSuccess : locationStatus === 'searching' ? styles.gpsBadgeWarning : styles.gpsBadgeDanger,
        ]}
        onPress={requestLocation}
        activeOpacity={0.8}>
        <AppIcon
          name={locationStatus === 'ready' ? 'location-on' : locationStatus === 'searching' ? 'gps-fixed' : 'location-off'}
          size={13}
          color={locationStatus === 'ready' ? '#22c55e' : locationStatus === 'searching' ? '#f59e0b' : '#ef4444'}
          style={{ marginRight: 4 }}
        />
        <AppText style={styles.gpsBadgeText}>
          {locationStatus === 'ready' && coords
            ? `GPS Terkunci (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`
            : locationStatus === 'searching'
            ? 'Mencari koordinat GPS...'
            : 'GPS Tidak Aktif (Ketuk untuk Ulangi)'}
        </AppText>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} disabled={processing}>
          <AppIcon name="arrow-back" size={24} color={color.white} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>{getTitle()}</AppText>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Camera Viewfinder or Photo Preview */}
      <View style={styles.cameraContainer}>
        {capturedUri ? (
          <View style={StyleSheet.absoluteFill}>
            <Image source={{ uri: capturedUri }} style={styles.previewImage} resizeMode="cover" />
            <View style={styles.previewGpsContainer}>{renderGpsBadge()}</View>

            {/* Biometric Verification HUD Overlay during processing */}
            {processing && (
              <View style={styles.biometricOverlay} pointerEvents="none">
                {/* Dimmed backdrop for cybernetic biometric focus */}
                <View style={styles.biometricDimBackdrop} />

                {/* Biometric Focus Frame */}
                <View style={styles.biometricFocusContainer}>
                  {/* Expanding Radar Rings */}
                  <Animated.View
                    style={[
                      styles.radarCircle,
                      {
                        transform: [
                          {
                            scale: radarAnim1.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 1.4],
                            }),
                          },
                        ],
                        opacity: radarAnim1.interpolate({
                          inputRange: [0, 0.3, 0.8, 1],
                          outputRange: [0.1, 0.7, 0.3, 0],
                        }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.radarCircle,
                      {
                        transform: [
                          {
                            scale: radarAnim2.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 1.4],
                            }),
                          },
                        ],
                        opacity: radarAnim2.interpolate({
                          inputRange: [0, 0.3, 0.8, 1],
                          outputRange: [0.1, 0.7, 0.3, 0],
                        }),
                      },
                    ]}
                  />

                  {/* Corner Reticles */}
                  <View style={styles.biometricCornerTopLeft} />
                  <View style={styles.biometricCornerTopRight} />
                  <View style={styles.biometricCornerBottomLeft} />
                  <View style={styles.biometricCornerBottomRight} />

                  {/* Facial Landmark Target Dots (+) */}
                  <View style={[styles.landmarkCrosshair, { top: '30%', left: '26%' }]}>
                    <AppText style={styles.crosshairText}>+</AppText>
                  </View>
                  <View style={[styles.landmarkCrosshair, { top: '30%', right: '26%' }]}>
                    <AppText style={styles.crosshairText}>+</AppText>
                  </View>
                  <View style={[styles.landmarkCrosshair, { top: '50%', alignSelf: 'center' }]}>
                    <AppText style={styles.crosshairText}>+</AppText>
                  </View>
                  <View style={[styles.landmarkCrosshair, { top: '68%', alignSelf: 'center' }]}>
                    <AppText style={styles.crosshairText}>+</AppText>
                  </View>

                  {/* Biometric Laser Scanner Line */}
                  <Animated.View
                    style={[
                      styles.biometricLaserContainer,
                      {
                        transform: [
                          {
                            translateY: verifyLaserAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [12, OVAL_HEIGHT - 24],
                            }),
                          },
                        ],
                      },
                    ]}>
                    <View style={styles.biometricLaserGlow} />
                    <View style={styles.biometricLaserBeam} />
                    <View style={styles.biometricLaserDotLeft} />
                    <View style={styles.biometricLaserDotRight} />
                  </Animated.View>
                </View>

                {/* Floating Biometric HUD Status Card */}
                <View style={styles.biometricStatusCard}>
                  <View style={styles.statusHeaderRow}>
                    <View style={styles.statusIconPulse}>
                      <AppIcon name="fingerprint" size={20} color="#38bdf8" />
                    </View>
                    <AppText style={styles.statusCardTitle}>VERIFIKASI BIOMETRIK</AppText>
                  </View>
                  <AppText style={styles.statusCardSubtitle}>{statusMessages[statusStep]}</AppText>
                  <View style={styles.progressBarTrack}>
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        {
                          transform: [
                            {
                              translateX: progressBarAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-180, 180],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        ) : (
          <>
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              cameraType={CameraType.Front}
              flashMode="auto"
              focusMode="on"
              zoomMode="on"
              resizeMode="cover"
              onOrientationChange={() => {}}
            />

            {/* Oval Face Guide Overlay with Pulsing & Scanning Laser */}
            <View style={styles.overlayContainer} pointerEvents="box-none">
              <Animated.View
                style={[
                  styles.ovalFrame,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}>
                <View style={styles.scannerCornerTopLeft} />
                <View style={styles.scannerCornerTopRight} />
                <View style={styles.scannerCornerBottomLeft} />
                <View style={styles.scannerCornerBottomRight} />

                {/* Vertical Laser Scan Line */}
                <Animated.View
                  style={[
                    styles.laserContainer,
                    {
                      transform: [
                        {
                          translateY: scanAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [12, OVAL_HEIGHT - 24],
                          }),
                        },
                      ],
                    },
                  ]}>
                  <View style={styles.laserGlow} />
                  <View style={styles.laserLine} />
                  <View style={styles.laserDotLeft} />
                  <View style={styles.laserDotRight} />
                </Animated.View>
              </Animated.View>

              <View style={styles.guideBadge}>
                <AppIcon name="face" size={18} color={color.white} style={{ marginRight: 6 }} />
                <AppText style={styles.guideText}>Posisikan wajah tepat di dalam bingkai oval</AppText>
              </View>
              {renderGpsBadge()}
            </View>
          </>
        )}

        {/* Camera Shutter Flash Effect */}
        <Animated.View
          style={[
            styles.flashOverlay,
            {
              opacity: flashAnim,
            },
          ]}
          pointerEvents="none"
        />
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {capturedUri ? (
          <View style={styles.confirmRow}>
            <TouchableOpacity style={[styles.actionButton, styles.retakeButton]} onPress={() => setCapturedUri(null)} disabled={processing}>
              <AppIcon name="replay" size={20} color={color.white} />
              <AppText style={styles.actionButtonText}>Foto Ulang</AppText>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.submitButton]} onPress={handleSubmit} disabled={processing}>
              {processing ? (
                <ActivityIndicator color={color.white} size="small" />
              ) : (
                <>
                  <AppIcon name="check-circle" size={20} color={color.white} />
                  <AppText style={styles.actionButtonText}>{mode === 'register' ? 'Simpan' : 'Kirim'}</AppText>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.captureRow}>
            <TouchableOpacity style={styles.shutterButtonOuter} onPress={handleCapture} activeOpacity={0.8}>
              <View style={styles.shutterButtonInner} />
            </TouchableOpacity>
          </View>
        )}

        <AppText style={styles.bottomHint}>
          {mode === 'register'
            ? 'Foto ini akan digunakan sebagai patokan biometrik presensi Anda.'
            : 'Sistem mencocokkan biometrik wajah Anda dengan data master kantor.'}
        </AppText>
      </View>
    </SafeAreaView>
  );
};

export default FaceCameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerRightPlaceholder: {
    width: 40,
  },
  headerTitle: {
    color: color.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ovalFrame: {
    width: width * 0.72,
    height: height * 0.44,
    borderRadius: (width * 0.72) / 2,
    borderWidth: 2.5,
    borderColor: 'rgba(56, 189, 248, 0.85)',
    borderStyle: 'dashed',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  scannerCornerTopLeft: {
    position: 'absolute',
    top: -2,
    left: 20,
    width: 24,
    height: 4,
    backgroundColor: '#38bdf8',
    borderRadius: 2,
  },
  scannerCornerTopRight: {
    position: 'absolute',
    top: -2,
    right: 20,
    width: 24,
    height: 4,
    backgroundColor: '#38bdf8',
    borderRadius: 2,
  },
  scannerCornerBottomLeft: {
    position: 'absolute',
    bottom: -2,
    left: 20,
    width: 24,
    height: 4,
    backgroundColor: '#38bdf8',
    borderRadius: 2,
  },
  scannerCornerBottomRight: {
    position: 'absolute',
    bottom: -2,
    right: 20,
    width: 24,
    height: 4,
    backgroundColor: '#38bdf8',
    borderRadius: 2,
  },
  guideBadge: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  guideText: {
    color: color.white,
    fontSize: 12,
    fontWeight: '500',
  },
  previewGpsContainer: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
  },
  gpsBadgeSuccess: {
    backgroundColor: 'rgba(22, 163, 74, 0.25)',
    borderColor: '#22c55e',
  },
  gpsBadgeWarning: {
    backgroundColor: 'rgba(217, 119, 6, 0.25)',
    borderColor: '#f59e0b',
  },
  gpsBadgeDanger: {
    backgroundColor: 'rgba(220, 38, 38, 0.25)',
    borderColor: '#ef4444',
  },
  gpsBadgeText: {
    color: color.white,
    fontSize: 11,
    fontWeight: '600',
  },
  bottomControls: {
    backgroundColor: '#0f172a',
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  captureRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  shutterButtonOuter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: color.white,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shutterButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: color.primary,
  },
  confirmRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  retakeButton: {
    backgroundColor: '#475569',
  },
  submitButton: {
    backgroundColor: color.primary,
  },
  actionButtonText: {
    color: color.white,
    fontWeight: '700',
    fontSize: 14,
  },
  bottomHint: {
    color: '#94a3b8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  // Camera & Biometric Animations
  flashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#ffffff',
    zIndex: 50,
  },
  laserContainer: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  laserGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 6,
  },
  laserLine: {
    width: '100%',
    height: 2.5,
    backgroundColor: '#38bdf8',
    borderRadius: 1.5,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 4,
  },
  laserDotLeft: {
    position: 'absolute',
    left: 0,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#bae6fd',
  },
  laserDotRight: {
    position: 'absolute',
    right: 0,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#bae6fd',
  },
  biometricOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  biometricDimBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  biometricFocusContainer: {
    width: width * 0.72,
    height: height * 0.44,
    borderRadius: (width * 0.72) / 2,
    borderWidth: 2.5,
    borderColor: 'rgba(34, 197, 94, 0.9)',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  radarCircle: {
    position: 'absolute',
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: (width * 0.72) / 2,
    borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.8)',
    backgroundColor: 'rgba(56, 189, 248, 0.06)',
  },
  biometricCornerTopLeft: {
    position: 'absolute',
    top: 10,
    left: 24,
    width: 28,
    height: 4,
    backgroundColor: '#22c55e',
    borderRadius: 2,
  },
  biometricCornerTopRight: {
    position: 'absolute',
    top: 10,
    right: 24,
    width: 28,
    height: 4,
    backgroundColor: '#22c55e',
    borderRadius: 2,
  },
  biometricCornerBottomLeft: {
    position: 'absolute',
    bottom: 10,
    left: 24,
    width: 28,
    height: 4,
    backgroundColor: '#22c55e',
    borderRadius: 2,
  },
  biometricCornerBottomRight: {
    position: 'absolute',
    bottom: 10,
    right: 24,
    width: 28,
    height: 4,
    backgroundColor: '#22c55e',
    borderRadius: 2,
  },
  biometricLaserContainer: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricLaserGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: 'rgba(34, 197, 94, 0.35)',
    borderRadius: 7,
  },
  biometricLaserBeam: {
    width: '100%',
    height: 3,
    backgroundColor: '#4ade80',
    borderRadius: 1.5,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  biometricLaserDotLeft: {
    position: 'absolute',
    left: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#bbf7d0',
  },
  biometricLaserDotRight: {
    position: 'absolute',
    right: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#bbf7d0',
  },
  landmarkCrosshair: {
    position: 'absolute',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairText: {
    color: 'rgba(56, 189, 248, 0.75)',
    fontSize: 18,
    fontWeight: '300',
  },
  biometricStatusCard: {
    marginTop: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    alignItems: 'center',
    width: width * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusIconPulse: {
    marginRight: 8,
  },
  statusCardTitle: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  statusCardSubtitle: {
    color: color.white,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: 100,
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 2,
  },
});
