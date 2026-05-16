import { color } from '@/assets/color';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
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
  const [currentDate, setCurrentDate] = useState(value || new Date());

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateChange(selectedDate);
    setModalVisible(false);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayBox} />);
    }
    for (let i = 1; i <= totalDays; i++) {
      const isSelected = !!(value && value.getDate() === i && value.getMonth() === month && value.getFullYear() === year);

      days.push(
        <TouchableOpacity key={i} style={[styles.dayBox, isSelected && styles.selectedDay]} onPress={() => handleDateSelect(i)}>
          <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{i}</Text>
        </TouchableOpacity>,
      );
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
        style={[styles.selectorContainer, error ? styles.inputError : null]}>
        <Text style={[styles.valueText, !value && styles.placeholderText]}>{value ? formatDate(value) : placeholder}</Text>
        <AppIcon name="calendar-today" size={20} color={color.neutral} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={handlePrevMonth}>
                <AppIcon name="chevron-left" size={28} color={color.black} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Text>
              <TouchableOpacity onPress={handleNextMonth}>
                <AppIcon name="chevron-right" size={28} color={color.black} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysContainer}>
              {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((d, i) => (
                <Text key={i} style={styles.weekDayText}>
                  {d}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>{renderCalendar()}</View>
          </View>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: color.white,
    borderRadius: 20,
    padding: 15,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.black,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDayText: {
    fontSize: 12,
    color: color.neutral,
    width: '14%',
    textAlign: 'center',
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayBox: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    color: color.black,
  },
  selectedDay: {
    backgroundColor: color.primary,
  },
  selectedDayText: {
    color: color.white,
    fontWeight: 'bold',
  },
});
