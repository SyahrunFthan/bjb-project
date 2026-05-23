import { color } from '@/assets/color';
import { Option } from '@/types/global';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import AppIcon from './Icon';

interface Props {
  label?: string;
  placeholder?: string;
  value?: string | number;
  onValueChange: (value: string | number) => void;
  fetchOptions: (search: string) => Promise<Option[]>;
  error?: string;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  debounceTimeout?: number;
}

const DebounceSelect = ({
  label,
  placeholder = 'Pilih salah satu',
  value,
  onValueChange,
  fetchOptions,
  error,
  containerStyle,
  disabled = false,
  debounceTimeout = 600,
}: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(undefined);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadOptions = useCallback(
    async (query: string) => {
      setFetching(true);
      try {
        const results = await fetchOptions(query);
        setOptions(results);

        if (value) {
          const matched = results.find(opt => opt.value === value);
          if (matched) {
            setSelectedOption(matched);
          }
        }
      } catch (err) {
        console.error('DebounceSelect loadOptions error:', err);
      } finally {
        setFetching(false);
      }
    },
    [fetchOptions, value],
  );

  useEffect(() => {
    if (value) {
      const matched = options.find(opt => opt.value === value);
      if (matched) {
        setSelectedOption(matched);
      } else {
        loadOptions('');
      }
    } else {
      setSelectedOption(undefined);
    }
  }, [value]);

  const handleSelect = (item: Option) => {
    setSelectedOption(item);
    onValueChange(item.value);
    setModalVisible(false);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadOptions(text);
    }, debounceTimeout);
  };

  const handleOpenModal = () => {
    if (disabled) return;
    setModalVisible(true);
    setSearchQuery('');
    loadOptions('');
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        activeOpacity={0.7}
        disabled={disabled}
        onPress={handleOpenModal}
        style={[styles.selectorContainer, error ? styles.inputError : null, disabled ? styles.disabledSelector : null]}>
        <Text style={[styles.valueText, !selectedOption && styles.placeholderText]}>{selectedOption ? selectedOption.label : placeholder}</Text>
        <AppIcon name="keyboard-arrow-down" size={24} color={color.neutral} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={handleCloseModal}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={handleCloseModal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Pilih Opsi'}</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <AppIcon name="close" size={24} color={color.black} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <AppIcon name="search" size={20} color={color.neutral} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cari..."
                  placeholderTextColor={color.neutral}
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {fetching ? (
                  <ActivityIndicator size="small" color={color.neutral} />
                ) : searchQuery.length > 0 ? (
                  <TouchableOpacity onPress={() => handleSearchChange('')}>
                    <AppIcon name="clear" size={20} color={color.neutral} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <FlatList
              data={options}
              keyExtractor={item => item.value.toString()}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Tidak ada data ditemukan</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.optionItem, item.value === value && styles.optionSelected]} onPress={() => handleSelect(item)}>
                  <Text style={[styles.optionText, item.value === value && styles.optionTextSelected]}>{item.label}</Text>
                  {item.value === value && <AppIcon name="check" size={20} color={color.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default DebounceSelect;

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
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: color.black,
    fontSize: 14,
    paddingVertical: 0,
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: color.neutral,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: color.neutral,
    fontSize: 14,
  },
});
