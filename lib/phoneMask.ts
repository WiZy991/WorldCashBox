/**
 * Утилита для форматирования номера телефона
 * Формат: +7 (999) 123-45-67
 */

export function formatPhoneNumber(value: string): string {
  // Удаляем все нецифровые символы
  const numbers = value.replace(/\D/g, '')
  
  // Если номер начинается с 8, заменяем на 7
  let formatted = numbers.startsWith('8') ? '7' + numbers.slice(1) : numbers
  formatted = formatted.startsWith('7') ? formatted : '7' + formatted
  
  // Ограничиваем длину (7 + 10 цифр)
  formatted = formatted.slice(0, 11)
  
  // Форматируем по маске +7 (XXX) XXX-XX-XX
  if (formatted.length === 0) {
    return ''
  }
  
  if (formatted.length <= 1) {
    return `+${formatted}`
  }
  
  if (formatted.length <= 4) {
    return `+${formatted.slice(0, 1)} (${formatted.slice(1)}`
  }
  
  if (formatted.length <= 7) {
    return `+${formatted.slice(0, 1)} (${formatted.slice(1, 4)}) ${formatted.slice(4)}`
  }
  
  if (formatted.length <= 9) {
    return `+${formatted.slice(0, 1)} (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}-${formatted.slice(7)}`
  }
  
  return `+${formatted.slice(0, 1)} (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}-${formatted.slice(7, 9)}-${formatted.slice(9, 11)}`
}

export function getPhoneDigits(phone: string): string {
  // Извлекаем только цифры из номера
  const digits = phone.replace(/\D/g, '')
  // Если начинается с 8, заменяем на 7
  if (digits.startsWith('8')) {
    return '7' + digits.slice(1)
  }
  // Если не начинается с 7, добавляем 7
  if (!digits.startsWith('7') && digits.length > 0) {
    return '7' + digits
  }
  return digits
}

