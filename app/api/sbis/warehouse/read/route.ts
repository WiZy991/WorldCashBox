import { NextRequest, NextResponse } from 'next/server'
import { readSBISWarehouse, getSBISWarehouseById, getSBISWarehouseByName, SBISWarehouseRequisites } from '@/lib/sbis-stock'

// Помечаем route как динамический
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * API endpoint для получения информации о складе из СБИС
 * 
 * Использование:
 * POST /api/sbis/warehouse/read
 * 
 * Body:
 * {
 *   "id": "284a42ba-97cc-4d9c-98af-00000000100a",  // UUID склада (опционально)
 *   "name": "Склад32",                              // Название склада (опционально)
 *   "code": "WH001",                                // Код склада (опционально)
 *   "organization": {                               // Реквизиты организации (опционально)
 *     "inn": "4804948184",
 *     "kpp": "480494818",
 *     "branchCode": "001"
 *   }
 * }
 * 
 * Для поиска склада необходимо указать хотя бы один параметр: id, name, code или organization
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    
    // Формируем реквизиты для поиска
    const requisites: SBISWarehouseRequisites = {}
    
    if (body.id) {
      requisites.id = body.id
    }
    if (body.name) {
      requisites.name = body.name
    }
    if (body.code) {
      requisites.code = body.code
    }
    if (body.organization) {
      requisites.organization = {
        inn: body.organization.inn,
        kpp: body.organization.kpp,
        branchCode: body.organization.branchCode,
      }
    }

    // Проверяем, что указан хотя бы один реквизит
    if (!requisites.id && !requisites.name && !requisites.code && !requisites.organization) {
      return NextResponse.json(
        { error: 'Необходимо указать хотя бы один реквизит для поиска склада: id, name, code или organization' },
        { status: 400 }
      )
    }

    // Получаем информацию о складе
    const warehouse = await readSBISWarehouse(requisites)

    return NextResponse.json({
      success: true,
      warehouse: warehouse,
    })
  } catch (error) {
    console.error('Ошибка получения информации о складе:', error)
    return NextResponse.json(
      { 
        error: 'Произошла ошибка при получении информации о складе',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint для получения информации о складе по ID из query параметров
 * 
 * Использование:
 * GET /api/sbis/warehouse/read?id=284a42ba-97cc-4d9c-98af-00000000100a
 * GET /api/sbis/warehouse/read?name=Склад32
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const name = searchParams.get('name')
    const code = searchParams.get('code')

    if (!id && !name && !code) {
      return NextResponse.json(
        { error: 'Необходимо указать параметр id, name или code в query string' },
        { status: 400 }
      )
    }

    let warehouse
    if (id) {
      warehouse = await getSBISWarehouseById(id)
    } else if (name) {
      warehouse = await getSBISWarehouseByName(name)
    } else if (code) {
      warehouse = await readSBISWarehouse({ code })
    } else {
      return NextResponse.json(
        { error: 'Неверные параметры запроса' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      warehouse: warehouse,
    })
  } catch (error) {
    console.error('Ошибка получения информации о складе:', error)
    return NextResponse.json(
      { 
        error: 'Произошла ошибка при получении информации о складе',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    )
  }
}
