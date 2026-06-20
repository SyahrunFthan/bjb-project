import { color } from '@/assets/color';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
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
  
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const dayListRef = useRef<FlatList>(null);
  const monthListRef = useRef<FlatList>(null);
  const yearListRef = useRef<FlatList>(null);

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInSelectedMonth = getDaysInMonth(selectedYear, selectedMonth);
  const daysData = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  const monthsData = months.map((name, index) => ({ label: name, value: index }));

  const currentYear = new Date().getFullYear();
  const yearsData = Array.from({ length: currentYear - 1930 + 6 }, (_, i) => currentYear + 5 - i);

  useEffect(() => {
    if (modalVisible) {
      const daysInSelected = getDaysInMonth(selectedYear, selectedMonth);
      if (selectedDay > daysInSelected) {
        setSelectedDay(daysInSelected);
      }
    }
  }, [selectedMonth, selectedYear, selectedDay, modalVisible]);

  useEffect(() => {
    if (modalVisible) {
      const dayIndex = selectedDay - 1;
      const monthIndex = selectedMonth;
      const yearIndex = yearsData.indexOf(selectedYear);

      setTimeout(() => {
        if (dayIndex >= 0 && dayListRef.current) {
          dayListRef.current.scrollToIndex({ index: dayIndex, animated: false, viewPosition: 0.5 });
        }
        if (monthIndex >= 0 && monthListRef.current) {
          monthListRef.current.scrollToIndex({ index: monthIndex, animated: false, viewPosition: 0.5 });
        }
        if (yearIndex >= 0 && yearListRef.current) {
          yearListRef.current.scrollToIndex({ index: yearIndex, animated: false, viewPosition: 0.5 });
        }
      }, 120);
    }
  }, [modalVisible, selectedDay, selectedMonth, selectedYear, yearsData]);

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

  const renderDayItem = useCallback(({ item }: { item: number }) => (
    <PickerItem
      label={item}
      isSelected={selectedDay === item}
      onPress={() => setSelectedDay(item)}
    />
  ), [selectedDay]);

  const renderMonthItem = useCallback(({ item }: { item: { label: string; value: number } }) => (
    <PickerItem
      label={item.label}
      isSelected={selectedMonth === item.value}
      onPress={() => setSelectedMonth(item.value)}
    />
  ), [selectedMonth]);

  const renderYearItem = useCallback(({ item }: { item: number }) => (
    <PickerItem
      label={item}
      isSelected={selectedYear === item}
      onPress={() => setSelectedYear(item)}
    />
  ), [selectedYear]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity activeOpacity={0.7} onPress={handleOpen} style={[styles.selectorContainer, error ? styles.inputError : null]}>
        <Text style={[styles.valueText, !value && styles.placeholderText]}>{value ? formatDate(value) : placeholder}</Text>
        <AppIcon name="calendar-today" size={20} color={color.neutral} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={handleCancel}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={handleCancel}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            
            <View style={styles.header}>
              <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>{label || 'Pilih Tanggal'}</Text>
              
              <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
                <Text style={styles.confirmText}>Selesai</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickersContainer}>
              
              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>Tanggal</Text>
                <FlatList
                  ref={dayListRef}
                  data={daysData}
                  keyExtractor={item => `day-${item}`}
                  showsVerticalScrollIndicator={false}
                  initialNumToRender={31}
                  maxToRenderPerBatch={31}
                  windowSize={3}
                  removeClippedSubviews={true}
                  getItemLayout={(_, index) => ({ length: 40, offset: 40 * index, index })}
                  renderItem={renderDayItem}
                />
              </View>

              <View style={[styles.pickerColumn, styles.borderHorizontal]}>
                <Text style={styles.columnLabel}>Bulan</Text>
                <FlatList
                  ref={monthListRef}
                  data={monthsData}
                  keyExtractor={item => `month-${item.value}`}
                  showsVerticalScrollIndicator={false}
                  initialNumToRender={12}
                  maxToRenderPerBatch={12}
                  windowSize={3}
                  removeClippedSubviews={true}
                  getItemLayout={(_, index) => ({ length: 40, offset: 40 * index, index })}
                  renderItem={renderMonthItem}
                />
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.columnLabel}>Tahun</Text>
                <FlatList
                  ref={yearListRef}
                  data={yearsData}
                  keyExtractor={item => `year-${item}`}
                  showsVerticalScrollIndicator={false}
                  initialNumToRender={20}
                  maxToRenderPerBatch={20}
                  windowSize={5}
                  removeClippedSubviews={true}
                  getItemLayout={(_, index) => ({ length: 40, offset: 40 * index, index })}
                  renderItem={renderYearItem}
                />
              </View>

            </View>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

interface PickerItemProps {
  label: string | number;
  isSelected: boolean;
  onPress: () => void;
}

const PickerItem = React.memo(({ label, isSelected, onPress }: PickerItemProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.pickerItem, isSelected && styles.selectedPickerItem]}
      onPress={onPress}>
      <Text style={[styles.pickerItemText, isSelected && styles.selectedPickerItemText]}>{label}</Text>
    </TouchableOpacity>
  );
});

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
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  selectedPickerItem: {
    backgroundColor: color.primary + '15',
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
