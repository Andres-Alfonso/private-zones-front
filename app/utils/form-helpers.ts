// app/utils/form-helpers.ts

/**
 * Convierte valores de FormData a boolean
 * - 'true' | 'on' | true → true
 * - 'false' | 'off' | false | undefined | null | '' → false
 */
export const formDataToBoolean = (value: FormDataEntryValue | null): boolean => {
  if (value === null || value === '') return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value === 'true' || value === 'on';
  }
  return false;
};

/**
 * Helper para extraer múltiples booleanos del FormData
 */
export const extractBooleanFields = (
  formData: FormData,
  fields: string[]
): Record<string, boolean> => {
  const result: Record<string, boolean> = {};
  
  for (const field of fields) {
    result[field] = formDataToBoolean(formData.get(field));
  }
  
  return result;
};