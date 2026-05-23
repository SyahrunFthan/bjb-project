import React, { useEffect } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import AppIcon from '../Icon';

type ResultType = 'success' | 'error';

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: ResultType;
  autoClose?: boolean;
  autoCloseDuration?: number;
}

const ResultModal = ({ visible, onClose, title, message, type, autoClose = true, autoCloseDuration = 2000 }: Props) => {
  useEffect(() => {
    if (visible && autoClose) {
      const timer = setTimeout(onClose, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, autoCloseDuration, onClose]);

  const config = {
    success: {
      icon: 'check-circle',
      bg: '#D4EDDA',
      color: '#28A745',
    },
    error: {
      icon: 'close',
      bg: '#edd8d4',
      color: '#a74628',
    },
  } as const;

  const current = config[type];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={[styles.iconCircle, { backgroundColor: current.bg }]}>
            <AppIcon name={current.icon} size={40} color={current.color} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ResultModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 340,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  message: {
    fontSize: 12,
    color: '#666',
    lineHeight: 22,
  },
});
