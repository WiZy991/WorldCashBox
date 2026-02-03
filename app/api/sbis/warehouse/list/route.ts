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
    return NextResponse.json(
      { 
        error: 'Произошла ошибка при получении списка складов',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    )
  }
}
