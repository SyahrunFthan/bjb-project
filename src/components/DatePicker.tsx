import { color } from '@/assets/color';
import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, ViewStyle, FlatList } from 'react-native';
import AppIcon from './Icon';

interface Props {
  label?: string;
  placeholder?: string;
  value?: Date;
  onDateChange: (date: Date) => void;
  error?: string;
  containerStyle?: ViewStyle;
}

const DatePicker = ({ label, placeholder = 'Pilih Tanggal', value, onDateChange, error, containerStyle }: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Temporary states for selections inside bottom sheet
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(0); // 0-11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Adjust selected day if it exceeds the number of days in the newly selected month/year
  useEffect(() => {
    if (modalVisible) {
      const daysInSelected = getDaysInMonth(selectedYear, selectedMonth);
      if (selectedDay > daysInSelected) {
        setSelectedDay(daysInSelected);
      }
    }
  }, [selectedMonth, selectedYear, selectedDay, modalVisible]);

  const handleOpen = () => {
    const initialDate = value || new Date();
    setSelectedDay(initialDate.getDate());
    setSelectedMonth(initialDate.getMonth());
    setSelectedYear(initialDate.getFullYear());
    setModalVisible(true);
  };

  const handleConfirm = () => {
    const daysInSelected = getDaysInMonth(selectedYear, selectedMonth);
    const day = Math.min(selectedDay, daysInSelected);
    const date = new Date(selectedYear, selectedMonth, day);
    onDateChange(date);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const formatDate = (date: Date) => {
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Days list dynamically adjusts to month/year selection
  const daysInSelectedMonth = getDaysInMonth(selectedYear, selectedMonth);
  const daysData = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  // Month data
  const monthsData = months.map((name, index) => ({ label: name, value: index }));

  // Years list (from currentYear + 5 down to 1930)
  const currentYear = new Date().getFullYear();
  const yearsData = Array.from({ length: currentYear - 1930 + 6 }, (_, i) => currentYear + 5 - i);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleOpen}
        style={[styles.selectorContainer, error ? styles.inputError : null]}>
        <Text style={[styles.valueText, !value && styles.placeholderText]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <AppIcon name="calendar-today" size={20} color={color.neutral} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={handleCancel}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={handleCancel}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            
            {/* Header / Actions */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>{label || 'Pilih Tanggal'}</Text>
              
              <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
                <Text style={styles.confirmText}>Selesai</Text>
              </TouchableOpacity>
            </View>

            {/* Scroll Pickers */}
            <View style={styles.pickersContainer}>
              
              {/* Day Column */}
              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>Tanggal</Text>
                <FlatList
                  data={daysData}
                  keyExtractor={item => `day-${item}`}
                  showsVerticalScrollIndicator={false}
                  initialNumToRender={31}
                  renderItem={({ item }) => {
                    const isSelected = selectedDay === item;
                    return (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.pickerItem, isSelected && styles.selectedPickerItem]}
                        onPress={() => setSelectedDay(item)}>
                        <Text style={[styles.pickerItemText, isSelected && styles.selectedPickerItemText]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>

              {/* Month Column */}
              <View style={[styles.pickerColumn, styles.borderHorizontal]}>
                <Text style={styles.columnLabel}>Bulan</Text>
                <FlatList
                  data={monthsData}
                  keyExtractor={item => `month-${item.value}`}
                  showsVerticalScrollIndicator={false}
                  initialNumToRender={12}
                  renderItem={({ item }) => {
                    const isSelected = selectedMonth === item.value;
                    return (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.pickerItem, isSelected && styles.selectedPickerItem]}
                        onPress={() => setSelectedMonth(item.value)}>
                        <Text style={[styles.pickerItemText, isSelected && styles.selectedPickerItemText]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>

              {/* Year Column */}
              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>Tahun</Text>
                <FlatList
                  data={yearsData}
                  keyExtractor={item => `year-${item}`}
                  showsVerticalScrollIndicator={false}
                  initialNumToRender={20}
                  renderItem={({ item }) => {
                    const isSelected = selectedYear === item;
                    return (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.pickerItem, isSelected && styles.selectedPickerItem]}
                        onPress={() => setSelectedYear(item)}>
                        <Text style={[styles.pickerItemText, isSelected && styles.selectedPickerItemText]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>

            </View>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default DatePicker;

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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
    elevation: 5,
    shadowColor: color.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 16,
    color: color.neutral,
    fontWeight: '500',
  },
  confirmText: {
    fontSize: 16,
    color: color.primary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: color.black,
  },
  pickersContainer: {
    flexDirection: 'row',
    height: 260,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  pickerColumn: {
    flex: 1,
  },
  borderHorizontal: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F3F4F6',
  },
  columnLabel: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: color.neutral,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  selectedPickerItem: {
    backgroundColor: color.primary + '15', // light primary highlight
  },
  pickerItemText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '400',
  },
  selectedPickerItemText: {
    color: color.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
