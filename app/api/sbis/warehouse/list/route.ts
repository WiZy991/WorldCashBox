import { NextRequest, NextResponse } from 'next/server'
import { getSBISWarehouses, getFirstSBISWarehouse } from '@/lib/sbis-stock'

/**
 * API endpoint для получения списка складов из СБИС
 * 
 * Использование:
 * GET /api/sbis/warehouse/list
 * GET /api/sbis/warehouse/list?preferredName=Склад32
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const preferredName = searchParams.get('preferredName')

    let warehouses
    if (preferredName) {
      // Получаем первый склад с предпочтительным названием
      const warehouse = await getFirstSBISWarehouse(preferredName)
      warehouses = warehouse ? [warehouse] : []
    } else {
      // Получаем все склады
      warehouses = await getSBISWarehouses()
    }

    return NextResponse.json({
      success: true,
      warehouses: warehouses,
      count: warehouses.length,
    })
  } catch (error) {
    console.error('Ошибка получения списка складов:', error)
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
    
    // Метод sabyWarehouse.List не поддерживается в СБИС API
    if (errorMessage.includes('not found') || errorMessage.includes('404') || errorMessage.includes('sabyWarehouse.List')) {
      return NextResponse.json(
        { 
          error: 'Метод получения списка складов не поддерживается',
          details: 'Метод sabyWarehouse.List недоступен в СБИС API. Используйте переменную SBIS_WAREHOUSE_ID для указания склада напрямую.',
          hint: 'Укажите SBIS_WAREHOUSE_ID=284a42ba-97cc-4d9c-98af-00000000100a в ecosystem.config.js или .env.production на сервере.'
        },
        { status: 500 }
      )
    }
    
    // Если это ошибка авторизации
    if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('Unauthorized')) {
      return NextResponse.json(
        { 
          error: 'Ошибка авторизации при получении списка складов',
          details: 'Метод может требовать авторизацию через сессию. Используйте переменную SBIS_WAREHOUSE_ID для указания склада напрямую.',
          hint: 'Укажите SBIS_WAREHOUSE_ID в ecosystem.config.js на сервере.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Произошла ошибка при получении списка складов',
        details: errorMessage,
        hint: 'Используйте переменную SBIS_WAREHOUSE_ID в ecosystem.config.js для указания склада напрямую.'
      },
      { status: 500 }
    )
  }
}
