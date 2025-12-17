import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { cookies } from 'next/headers'

interface Promotion {
  id: number
  title: string
  description: string
  date: string
  validUntil: string
  badge?: string
  image: string
  productName?: string
}

async function checkAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')
  return !!token
}

const promotionsFilePath = join(process.cwd(), 'data', 'promotions.json')

// Обновить акцию
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const updatedPromotion: Promotion = await request.json()
    const id = parseInt(params.id)
    
    let promotions: Promotion[] = []
    try {
      const content = await readFile(promotionsFilePath, 'utf-8')
      promotions = JSON.parse(content)
    } catch {
      return NextResponse.json({ error: 'Promotions not found' }, { status: 404 })
    }

    const index = promotions.findIndex(p => p.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }

    promotions[index] = { ...updatedPromotion, id }
    await writeFile(promotionsFilePath, JSON.stringify(promotions, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true, promotion: promotions[index] })
  } catch (error) {
    console.error('Error updating promotion:', error)
    return NextResponse.json({ error: 'Failed to update promotion' }, { status: 500 })
  }
}

// Удалить акцию
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const id = parseInt(params.id)
    
    let promotions: Promotion[] = []
    try {
      const content = await readFile(promotionsFilePath, 'utf-8')
      promotions = JSON.parse(content)
    } catch {
      return NextResponse.json({ error: 'Promotions not found' }, { status: 404 })
    }

    promotions = promotions.filter(p => p.id !== id)
    await writeFile(promotionsFilePath, JSON.stringify(promotions, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting promotion:', error)
    return NextResponse.json({ error: 'Failed to delete promotion' }, { status: 500 })
  }
}



