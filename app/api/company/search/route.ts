import { NextRequest, NextResponse } from 'next/server'

/**
 * API endpoint для поиска компании по ИНН
 * Использует бесплатный API ФНС (egrul.nalog.ru)
 */
export async function POST(request: NextRequest) {
  try {
    const { inn } = await request.json()

    if (!inn || typeof inn !== 'string') {
      return NextResponse.json(
        { error: 'ИНН не указан' },
        { status: 400 }
      )
    }

    // Очищаем ИНН от нецифровых символов
    const cleanINN = inn.replace(/\D/g, '')
    
    // Валидация ИНН
    if (cleanINN.length !== 10 && cleanINN.length !== 12) {
      return NextResponse.json(
        { error: 'ИНН должен содержать 10 или 12 цифр' },
        { status: 400 }
      )
    }

    try {
      // Используем бесплатный API ФНС для поиска по ИНН
      // Шаг 1: Отправляем POST запрос на главную страницу для получения токена
      const searchResponse = await fetch('https://egrul.nalog.ru/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': '*/*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Origin': 'https://egrul.nalog.ru',
          'Referer': 'https://egrul.nalog.ru/',
        },
        body: new URLSearchParams({
          query: cleanINN,
        }),
      })

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text()
        console.error('ФНС API - ошибка поиска:', searchResponse.status, errorText)
        throw new Error(`ФНС API вернул ошибку: ${searchResponse.status}`)
      }

      const searchData = await searchResponse.json()
      console.log('ФНС API - ответ поиска:', searchData)
      
      // Если получили токен, делаем второй запрос для получения данных
      if (searchData.t) {
        // Ждем немного перед вторым запросом (API ФНС требует задержку)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const detailsResponse = await fetch(`https://egrul.nalog.ru/search-result/${searchData.t}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        })
        
        if (detailsResponse.ok) {
          const details = await detailsResponse.json()
          console.log('ФНС API - данные получены:', details)
          
          if (details.rows && details.rows.length > 0) {
            const company = details.rows[0]
            
            // Используем сокращенное название (поле 'c'), если оно есть
            // Если нет, формируем из полного названия
            let companyName = company.c || company['c'] || ''
            
            // Если сокращенного названия нет, берем полное и сокращаем его
            if (!companyName || companyName.trim() === '') {
              const fullName = company.n || company['n'] || company.НаимПолн || ''
              
              if (fullName) {
                // Определяем тип организации и формируем сокращенное название
                const isIP = company.k === 'ip' || company['k'] === 'ip' || cleanINN.length === 12
                
                if (isIP) {
                  // Для ИП берем ФИО из полного названия
                  // Обычно формат: "ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ ИВАНОВ ИВАН ИВАНОВИЧ"
                  const ipMatch = fullName.match(/ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ\s+(.+)/i)
                  if (ipMatch) {
                    companyName = `ИП ${ipMatch[1].trim()}`
                  } else {
                    // Если не нашли, просто убираем "ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ"
                    companyName = fullName.replace(/ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ\s*/i, 'ИП ').trim()
                  }
                } else {
                  // Для ООО и других организаций
                  // Ищем сокращения в полном названии
                  const orgTypes = [
                    { full: /ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ/i, short: 'ООО' },
                    { full: /АКЦИОНЕРНОЕ ОБЩЕСТВО/i, short: 'АО' },
                    { full: /ПУБЛИЧНОЕ АКЦИОНЕРНОЕ ОБЩЕСТВО/i, short: 'ПАО' },
                    { full: /НЕПУБЛИЧНОЕ АКЦИОНЕРНОЕ ОБЩЕСТВО/i, short: 'НАО' },
                    { full: /ЗАКРЫТОЕ АКЦИОНЕРНОЕ ОБЩЕСТВО/i, short: 'ЗАО' },
                    { full: /ОТКРЫТОЕ АКЦИОНЕРНОЕ ОБЩЕСТВО/i, short: 'ОАО' },
                  ]
                  
                  let found = false
                  for (const orgType of orgTypes) {
                    if (orgType.full.test(fullName)) {
                      // Извлекаем название после типа организации
                      const nameMatch = fullName.match(new RegExp(orgType.full.source + '\\s*[""]?([^""]+)[""]?', 'i'))
                      if (nameMatch) {
                        companyName = `${orgType.short} ${nameMatch[1].trim()}`
                      } else {
                        // Если не нашли в кавычках, берем все после типа
                        companyName = fullName.replace(orgType.full, orgType.short).trim()
                      }
                      found = true
                      break
                    }
                  }
                  
                  // Если не нашли известный тип, используем как есть
                  if (!found) {
                    companyName = fullName
                  }
                }
              }
            }
            
            if (companyName && companyName.trim() !== '') {
              console.log('ФНС API - найдена компания (сокращенное название):', companyName.trim())
              return NextResponse.json({
                success: true,
                company: {
                  name: companyName.trim(),
                  inn: cleanINN,
                  kpp: company.k || company.КПП || company['k'] || '',
                  address: company.a || company.АдресПолн || company['a'] || '',
                  ogrn: company.o || company.ОГРН || company['o'] || '',
                },
              })
            }
          }
        } else {
          const errorText = await detailsResponse.text()
          console.error('ФНС API - ошибка получения данных:', detailsResponse.status, errorText)
        }
      } else {
        console.warn('ФНС API - токен не получен в ответе:', searchData)
      }
    } catch (fnsError: any) {
      console.error('Ошибка при использовании API ФНС:', fnsError.message)
      throw fnsError
    }
    
    // Если компания не найдена
    return NextResponse.json({
      success: false,
      message: 'Компания не найдена по указанному ИНН',
    })
  } catch (error: any) {
    console.error('Ошибка поиска компании:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Произошла ошибка при поиске компании',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
