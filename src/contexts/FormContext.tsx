import React, { createContext, useCallback, useContext, useState } from 'react';

export type ValidationRule = (value: unknown) => string | boolean;

interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  rules: Record<string, ValidationRule[]>;
}

interface FormContextProps {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  register: (name: string, rules?: ValidationRule[]) => void;
  setValue: (name: string, value: unknown) => void;
  validateField: (name: string, value: unknown) => boolean;
  validateForm: () => boolean;
  resetForm: () => void;
}

const FormContext = createContext<FormContextProps | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formState, setFormState] = useState<FormState>({
    values: {},
    errors: {},
    rules: {},
  });

  const register = useCallback((name: string, rules: ValidationRule[] = []) => {
    setFormState(prev => ({
      ...prev,
      rules: { ...prev.rules, [name]: rules },
    }));
  }, []);

  const validateField = useCallback(
    (name: string, value: unknown): boolean => {
      const fieldRules = formState.rules[name] || [];
      for (const rule of fieldRules) {
        const result = rule(value);
        if (typeof result === 'string') {
          setFormState(prev => ({
            ...prev,
            errors: { ...prev.errors, [name]: result },
          }));
          return false;
        }
      }
      setFormState(prev => {
        const newErrors = { ...prev.errors };
        delete newErrors[name];
        return { ...prev, errors: newErrors };
      });
      return true;
    },
    [formState.rules],
  );

  const setValue = useCallback(
    (name: string, value: unknown) => {
      setFormState(prev => ({
        ...prev,
        values: { ...prev.values, [name]: value },
      }));
      validateField(name, value);
    },
    [validateField],
  );

  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    Object.keys(formState.rules).forEach(name => {
      const value = formState.values[name];
      const fieldRules = formState.rules[name];

      for (const rule of fieldRules) {
        const result = rule(value);
        if (typeof result === 'string') {
          newErrors[name] = result;
          isValid = false;
          break;
        }
      }
    });

    setFormState(prev => ({ ...prev, errors: newErrors }));
    return isValid;
  }, [formState.values, formState.rules]);

  const resetForm = useCallback(() => {
    setFormState(prev => ({ ...prev, values: {}, errors: {} }));
  }, []);

  return <FormContext.Provider value={{ ...formState, register, setValue, validateField, validateForm, resetForm }}>{children}</FormContext.Provider>;
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};

export const Rules = {
  required:
    (msg = 'Field ini wajib diisi'): ValidationRule =>
    val =>
      val !== undefined && val !== null && val !== '' ? true : msg,
  email:
    (msg = 'Format email tidak valid'): ValidationRule =>
    val =>
      !val || (typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) ? true : msg,
  minLength:
    (min: number, msg?: string): ValidationRule =>
    val =>
      !val || (typeof val === 'string' && val.length >= min) ? true : msg || `Minimal ${min} karakter`,
  pattern:
    (regex: RegExp, msg = 'Format tidak valid'): ValidationRule =>
    val =>
      !val || (typeof val === 'string' && regex.test(val)) ? true : msg,
};
