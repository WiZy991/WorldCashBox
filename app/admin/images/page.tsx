'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Upload, Image as ImageIcon, X } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminImages() {
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; fileName: string }>>([])
  const [selectedCategory, setSelectedCategory] = useState('misc')

  const categories = [
    { value: 'misc', label: 'Разное' },
    { value: 'banners', label: 'Баннеры' },
    { value: 'pos', label: 'POS-системы' },
    { value: 'printers', label: 'Принтеры' },
    { value: 'terminals', label: 'Терминалы' },
    { value: 'cameras', label: 'Камеры' },
    { value: 'smart', label: 'Смарт-кассы' },
    { value: 'tsd', label: 'ТСД' },
  ]

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', selectedCategory)

      try {
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()
        if (data.success) {
          return { url: data.url, fileName: data.fileName }
        }
        return null
      } catch (error) {
        console.error('Error uploading file:', error)
        return null
      }
    })

    const results = await Promise.all(uploadPromises)
    const successful = results.filter((r) => r !== null) as Array<{ url: string; fileName: string }>
    setUploadedImages([...uploadedImages, ...successful])
    setUploading(false)
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    alert('URL скопирован в буфер обмена!')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Управление изображениями</h1>
          <p className="text-gray-600 mt-2">Загружайте и управляйте изображениями для товаров и акций</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория изображений
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Загрузить изображения
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="image-upload"
              disabled={uploading}
            />
            <label
              htmlFor="image-upload"
              className={`inline-flex items-center space-x-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="w-5 h-5" />
              <span>{uploading ? 'Загрузка...' : 'Выберите файлы'}</span>
            </label>
          </div>
        </div>

        {uploadedImages.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Загруженные изображения</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedImages.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={image.url}
                      alt={image.fileName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => copyToClipboard(image.url)}
                      className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Копировать URL
                    </button>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 truncate">{image.fileName}</p>
                    <p className="text-xs text-gray-400 truncate">{image.url}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {uploadedImages.length === 0 && !uploading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Загруженные изображения появятся здесь</p>
          </div>
        )}
      </div>
    </div>
  )
}



