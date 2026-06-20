import React, { useCallback, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { color } from '@/assets/color';
import { Option } from '@/types/global';
import AppIcon from './Icon';

interface Props {
  label?: string;
  placeholder?: string;
  value?: string | number;
  onValueChange: (value: string | number) => void;
  options: Option[];
  error?: string;
  containerStyle?: ViewStyle;
  disabled?: boolean;
}

const Select = ({ label, placeholder = 'Pilih salah satu', value, onValueChange, options, error, containerStyle, disabled = false }: Props) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (item: Option) => {
    onValueChange(item.value);
    setModalVisible(false);
  };

  const renderItem = useCallback(
    ({ item }: { item: Option }) => (
      <OptionItem
        item={item}
        isSelected={item.value === value}
        onPress={handleSelect}
      />
    ),
    [value, handleSelect],
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        activeOpacity={0.7}
        disabled={disabled}
        onPress={() => setModalVisible(true)}
        style={[styles.selectorContainer, error ? styles.inputError : null, disabled ? styles.disabledSelector : null]}>
        <Text style={[styles.valueText, !selectedOption && styles.placeholderText]}>{selectedOption ? selectedOption.label : placeholder}</Text>
        <AppIcon name="keyboard-arrow-down" size={24} color={color.neutral} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Pilih Opsi'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <AppIcon name="close" size={24} color={color.black} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={item => item.value.toString()}
              renderItem={renderItem}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={true}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

interface OptionItemProps {
  item: Option;
  isSelected: boolean;
  onPress: (item: Option) => void;
}

const OptionItem = React.memo(({ item, isSelected, onPress }: OptionItemProps) => {
  return (
    <TouchableOpacity
      style={[styles.optionItem, isSelected && styles.optionSelected]}
      onPress={() => onPress(item)}>
      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{item.label}</Text>
      {isSelected && <AppIcon name="check" size={20} color={color.primary} />}
    </TouchableOpacity>
  );
});


export default Select;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: color.black,
    marginBottom: 8,
    marginLeft: 4,
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: color.white,
    borderWidth: 1.5,
    borderColor: color.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  inputError: {
    borderColor: color.tertiary,
  },
  disabledSelector: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E5E5E5',
    opacity: 0.7,
  },
  valueText: {
    fontSize: 16,
    color: color.black,
  },
  placeholderText: {
    color: color.neutral,
  },
  errorText: {
    color: color.tertiary,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: color.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.black,
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  optionSelected: {
    backgroundColor: '#F0F7FF',
  },
  optionText: {
    fontSize: 16,
    color: color.black,
  },
  optionTextSelected: {
    color: color.primary,
    fontWeight: '600',
  },
});
