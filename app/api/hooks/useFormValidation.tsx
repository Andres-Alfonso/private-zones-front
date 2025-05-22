// app/hooks/useFormValidation.ts

import { useState, useCallback } from 'react';
import { 
  validateEmail, 
  validatePassword, 
  validateName, 
  validateConfirmPassword,
  ValidationError 
} from '~/utils/validation';

interface UseFormValidationProps {
  initialValues: Record<string, any>;
  validationRules: Record<string, (value: any, allValues?: Record<string, any>) => string | null>;
}

interface FormState {
  values: Record<string, any>;
  errors: Record<string, string | null>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

export function useFormValidation({ initialValues, validationRules }: UseFormValidationProps) {
  const [formState, setFormState] = useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: false,
    isSubmitting: false,
  });

  const validateField = useCallback((name: string, value: any, allValues?: Record<string, any>) => {
    const validator = validationRules[name];
    if (!validator) return null;
    
    return validator(value, allValues || formState.values);
  }, [validationRules, formState.values]);

  const validateAllFields = useCallback(() => {
    const errors: Record<string, string | null> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formState.values[fieldName], formState.values);
      errors[fieldName] = error;
      if (error) isValid = false;
    });

    return { errors, isValid };
  }, [formState.values, validateField, validationRules]);

  const setValue = useCallback((name: string, value: any) => {
    setFormState(prev => {
      const newValues = { ...prev.values, [name]: value };
      const error = validateField(name, value, newValues);
      
      return {
        ...prev,
        values: newValues,
        errors: { ...prev.errors, [name]: error },
        touched: { ...prev.touched, [name]: true },
      };
    });
  }, [validateField]);

  const setFieldTouched = useCallback((name: string, touched = true) => {
    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: touched },
    }));
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState(prev => ({ ...prev, isSubmitting }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: false,
      isSubmitting: false,
    });
  }, [initialValues]);

  const validateForm = useCallback(() => {
    const { errors, isValid } = validateAllFields();
    
    setFormState(prev => ({
      ...prev,
      errors,
      isValid,
      touched: Object.keys(prev.values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>),
    }));

    return isValid;
  }, [validateAllFields]);

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isValid: formState.isValid,
    isSubmitting: formState.isSubmitting,
    setValue,
    setFieldTouched,
    setSubmitting,
    resetForm,
    validateForm,
    getFieldProps: (name: string) => ({
      value: formState.values[name] || '',
      error: formState.touched[name] ? formState.errors[name] : null,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(name, e.target.value),
      onBlur: () => setFieldTouched(name, true),
    }),
  };
}

// Hook específico para formulario de login
export function useLoginForm() {
  return useFormValidation({
    initialValues: {
      email: '',
      password: '',
    },
    validationRules: {
      email: validateEmail,
      password: validatePassword,
    },
  });
}

// Hook específico para formulario de registro
export function useRegisterForm() {
  return useFormValidation({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationRules: {
      firstName: validateName,
      lastName: validateName,
      email: validateEmail,
      password: validatePassword,
      confirmPassword: (value: string, allValues?: Record<string, any>) => 
        validateConfirmPassword(allValues?.password || '', value),
    },
  });
}