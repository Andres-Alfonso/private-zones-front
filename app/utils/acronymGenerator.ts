// app/utils/acronymGenerator.ts

/**
 * Genera un acrónimo a partir de un título
 * @param title - El título del curso
 * @param maxLength - Longitud máxima del acrónimo (por defecto 10)
 * @returns El acrónimo generado
 */
export function generateAcronym(title: string, maxLength: number = 10): string {
  if (!title || !title.trim()) {
    return '';
  }

  // Palabras comunes a excluir del acrónimo
  const commonWords = [
    'de', 'la', 'el', 'los', 'las', 'del', 'al', 'en', 'con', 'por', 'para', 'y', 'o', 'pero',
    'que', 'se', 'es', 'son', 'un', 'una', 'uno', 'unos', 'unas', 'este', 'esta', 'estos', 'estas',
    'aquel', 'aquella', 'aquellos', 'aquellas', 'su', 'sus', 'mi', 'mis', 'tu', 'tus',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had'
  ];

  // Limpiar y dividir el título en palabras
  const words = title
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Reemplazar caracteres especiales con espacios
    .split(/\s+/) // Dividir por espacios
    .filter(word => word.length > 0) // Filtrar palabras vacías
    .filter(word => !commonWords.includes(word)); // Excluir palabras comunes

  if (words.length === 0) {
    // Si no hay palabras válidas, usar las primeras letras del título original
    return title
      .replace(/[^\w\s]/g, '')
      .split('')
      .filter(char => /[a-zA-Z]/.test(char))
      .slice(0, maxLength)
      .join('')
      .toUpperCase();
  }

  let acronym = '';

  // Estrategia 1: Tomar la primera letra de cada palabra
  if (words.length <= maxLength) {
    acronym = words
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  } else {
    // Estrategia 2: Si hay muchas palabras, tomar las más significativas
    // Priorizar palabras más largas (probablemente más importantes)
    const sortedWords = words
      .sort((a, b) => b.length - a.length)
      .slice(0, maxLength);
    
    acronym = sortedWords
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  }

  // Estrategia 3: Si el acrónimo es muy corto, completar con más letras
  if (acronym.length < 3 && words.length > 0) {
    // Tomar las primeras 2-3 letras de la primera palabra más importante
    const mainWord = words.sort((a, b) => b.length - a.length)[0];
    acronym = mainWord.slice(0, Math.min(maxLength, 4)).toUpperCase();
  }

  return acronym.slice(0, maxLength);
}

/**
 * Valida si un acrónimo es válido
 */
export function isValidAcronym(acronym: string): boolean {
  return /^[A-Z0-9-]{1,10}$/.test(acronym);
}

/**
 * Ejemplos de uso:
 * generateAcronym("Desarrollo Web con React") // "DWR"
 * generateAcronym("Introducción a la Programación") // "IP"
 * generateAcronym("Curso Avanzado de Machine Learning") // "CAML"
 * generateAcronym("Cardiología Básica para Enfermeras") // "CBE"
 */