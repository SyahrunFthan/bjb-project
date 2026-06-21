import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ValidationRule = (value: unknown) => string | boolean;

interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  rules: Record<string, ValidationRule[]>;
}

export function deepGet(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    const index = parseInt(part, 10);
    if (!isNaN(index) && Array.isArray(current)) {
      current = current[index];
    } else {
      current = current[part];
    }
  }
  return current;
}

export function deepSet(obj: any, path: string, value: any): any {
  const res = JSON.parse(JSON.stringify(obj));
  const parts = path.split('.');
  let current = res;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];

    const isNextArray = nextPart !== undefined && !isNaN(parseInt(nextPart, 10));
    const index = parseInt(part, 10);
    const key = !isNaN(index) ? index : part;

    if (i === parts.length - 1) {
      current[key] = value;
    } else {
      if (current[key] === undefined || current[key] === null) {
        current[key] = isNextArray ? [] : {};
      }
      current = current[key];
    }
  }
  return res;
}

export interface FormContextProps {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  register: (name: string, rules?: ValidationRule[]) => void;
  unregister: (name: string) => void;
  setValue: (name: string | Record<string, any>, value?: any) => void;
  getValue: (name: string) => unknown;
  validateField: (name: string, value: unknown) => boolean;
  validateForm: () => boolean;
  resetForm: (initialValues?: Record<string, any>) => void;
  setError: (name: string, error: string) => void;
  setErrors: (errors: Record<string, string>) => void;
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

  const unregister = useCallback((name: string) => {
    setFormState(prev => {
      const newRules = { ...prev.rules };
      delete newRules[name];
      const newErrors = { ...prev.errors };
      delete newErrors[name];
      return {
        ...prev,
        rules: newRules,
        errors: newErrors,
      };
    });
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
    (name: string | Record<string, any>, value?: any) => {
      if (typeof name === 'object' && name !== null) {
        setFormState(prev => {
          let newValues = { ...prev.values };
          Object.entries(name).forEach(([key, val]) => {
            newValues = deepSet(newValues, key, val);
          });
          return {
            ...prev,
            values: newValues,
          };
        });
      } else {
        setFormState(prev => ({
          ...prev,
          values: deepSet(prev.values, name, value),
        }));
        validateField(name, value);
      }
    },
    [validateField],
  );

  const getValue = useCallback(
    (name: string) => {
      return deepGet(formState.values, name);
    },
    [formState.values],
  );

  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    Object.keys(formState.rules).forEach(name => {
      const value = deepGet(formState.values, name);
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

  const resetForm = useCallback((initialValues?: Record<string, any>) => {
    setFormState(prev => {
      let newValues = {};
      if (initialValues) {
        Object.entries(initialValues).forEach(([key, val]) => {
          newValues = deepSet(newValues, key, val);
        });
      }
      return {
        ...prev,
        values: newValues,
        errors: {},
      };
    });
  }, []);

  const setError = useCallback((name: string, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
    }));
  }, []);

  const setErrors = useCallback((errors: Record<string, string>) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, ...errors },
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...formState,
      register,
      unregister,
      setValue,
      getValue,
      validateField,
      validateForm,
      resetForm,
      setError,
      setErrors,
    }),
    [formState, register, unregister, setValue, getValue, validateField, validateForm, resetForm, setError, setErrors],
  );

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
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
