import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { cookies } from 'next/headers'

async function checkAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')
  return !!token
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'misc'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Создаем директорию если не существует
    const uploadDir = join(process.cwd(), 'public', 'images', 'products', category)
    await mkdir(uploadDir, { recursive: true })

    // Генерируем уникальное имя файла
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${originalName}`
    const filePath = join(uploadDir, fileName)

    // Записываем файл
    await writeFile(filePath, buffer)

    // Проверяем, что файл действительно создан
    const { access } = await import('fs/promises')
    try {
      await access(filePath)
    } catch {
      console.error('File was not created successfully:', filePath)
      return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
    }

    const url = `/images/products/${category}/${fileName}`
    
    console.log('File uploaded successfully:', {
      url,
      fileName,
      filePath,
      size: buffer.length,
      category
    })
    
    return NextResponse.json({ 
      success: true, 
      url,
      fileName 
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}



