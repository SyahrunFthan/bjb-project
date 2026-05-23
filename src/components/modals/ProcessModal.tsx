import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

interface Props {
  visible: boolean;
  message: string;
  subMessage: string;
}

const ProcessModal = ({ message, subMessage, visible }: Props) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, styles.processContainer]}>
          <ActivityIndicator size="large" color="#1e3c72" />
          <Text style={[styles.title, styles.processTitle]}>{message}</Text>
          {subMessage ? <Text style={[styles.message, styles.processMessage]}>{subMessage}</Text> : null}
        </View>
      </View>
    </Modal>
  );
};

export default ProcessModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  processContainer: {
    paddingVertical: 32,
  },
  processTitle: {
    marginTop: 20,
    marginBottom: 8,
  },
  processMessage: {
    marginBottom: 0,
    fontSize: 13,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
});
