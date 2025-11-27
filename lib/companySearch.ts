/**
 * Утилита для поиска компании по ИНН
 * Использует DaData API для получения данных о компании
 */

interface CompanyData {
  name: string
  inn?: string
  kpp?: string
  address?: string
  ogrn?: string
}

/**
 * Поиск компании по ИНН через DaData API
 */
export async function findCompanyByINN(inn: string): Promise<CompanyData | null> {
  // Удаляем все нецифровые символы
  const cleanINN = inn.replace(/\D/g, '')
  
  // Валидация ИНН (10 или 12 цифр)
  if (cleanINN.length !== 10 && cleanINN.length !== 12) {
    return null
  }

  try {
    // Используем наш API endpoint для поиска компании
    const response = await fetch('/api/company/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inn: cleanINN }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Ошибка HTTP при поиске компании:', response.status, errorText)
      throw new Error(`Ошибка поиска компании: ${response.status}`)
    }

    const data = await response.json()
    console.log('Ответ от API поиска компании:', data)
    
    if (data.success && data.company && data.company.name) {
      return {
        name: data.company.name,
        inn: data.company.inn || cleanINN,
        kpp: data.company.kpp,
        address: data.company.address,
        ogrn: data.company.ogrn,
      }
    }

    console.warn('Компания не найдена или API ключи не настроены:', data)
    return null
  } catch (error) {
    console.error('Ошибка поиска компании по ИНН:', error)
    return null
  }
}

/**
 * Валидация ИНН
 */
export function validateINN(inn: string): boolean {
  const cleanINN = inn.replace(/\D/g, '')
  return cleanINN.length === 10 || cleanINN.length === 12
}

/**
 * Извлечение ИНН из строки
 */
export function extractINN(value: string): string {
  return value.replace(/\D/g, '')
}

