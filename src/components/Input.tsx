import { color } from '@/assets/color';
import { verticalScale } from '@/lib/responsive';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
}

const Input = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputContainerStyle,
  onFocus,
  onBlur,
  style,
  multiline,
  ...rest
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          multiline ? styles.inputContainerMultiline : null,
          isFocused ? styles.inputFocused : null,
          error ? styles.inputError : null,
          inputContainerStyle,
        ]}>
        {leftIcon && <View style={[styles.iconLeft, multiline ? styles.iconLeftMultiline : null]}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, multiline ? styles.inputMultiline : null, style]}
          placeholderTextColor={color.border}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          {...rest}
        />

        {rightIcon && <View style={[styles.iconRight, multiline ? styles.iconRightMultiline : null]}>{rightIcon}</View>}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default Input;

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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.white,
    borderWidth: 1.5,
    borderColor: color.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: verticalScale(45),
  },
  inputContainerMultiline: {
    height: undefined,
    minHeight: verticalScale(90),
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  inputFocused: {
    borderColor: color.primary,
  },
  inputError: {
    borderColor: color.tertiary,
  },
  input: {
    flex: 1,
    height: '100%',
    color: color.black,
    fontSize: 16,
    paddingVertical: 0,
  },
  inputMultiline: {
    height: undefined,
    minHeight: verticalScale(70),
    textAlignVertical: 'top',
  },
  errorText: {
    color: color.tertiary,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  iconLeft: {
    marginRight: 10,
  },
  iconLeftMultiline: {
    marginTop: 2,
  },
  iconRight: {
    marginLeft: 10,
  },
  iconRightMultiline: {
    marginTop: 2,
  },
});
