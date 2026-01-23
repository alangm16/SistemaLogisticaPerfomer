// src/hooks/useForm.js
import { useState } from 'react';

/**
 * Hook personalizado para manejar formularios
 * Elimina la necesidad de handleInputChange repetido
 */
export default function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = (newValues = initialValues) => {
    setValues(newValues);
  };

  const setFieldValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  return {
    values,
    handleChange,
    resetForm,
    setFieldValue,
    setValues
  };
}