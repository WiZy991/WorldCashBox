'use client'

import { useState, useEffect } from 'react'
import { X, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

interface PromotionFormProps {
  promotion?: Promotion | null
  onClose: () => void
  onSave: () => void
}

export default function PromotionForm({ promotion, onClose, onSave }: PromotionFormProps) {
  const [formData, setFormData] = useState<Partial<Promotion>>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    badge: '',
    image: '',
    productName: '',
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (promotion) {
      setFormData({
        ...promotion,
        date: promotion.date.split('T')[0],
        validUntil: promotion.validUntil.split('T')[0],
      })
    }
  }, [promotion])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = promotion?.id 
        ? `/api/admin/promotions/${promotion.id}`
        : '/api/admin/promotions'
      
      const method = promotion?.id ? 'PUT' : 'POST'
      
      // Проверяем и нормализуем даты
      const dateValue = formData.date || new Date().toISOString().split('T')[0]
      const validUntilValue = formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      // Преобразуем даты в ISO формат, проверяя валидность
      let dateISO: string
      let validUntilISO: string
      
      try {
        const dateObj = new Date(dateValue)
        if (isNaN(dateObj.getTime())) {
          throw new Error('Invalid date')
        }
        dateISO = dateObj.toISOString()
      } catch {
        dateISO = new Date().toISOString()
      }
      
      try {
        const validUntilObj = new Date(validUntilValue)
        if (isNaN(validUntilObj.getTime())) {
          throw new Error('Invalid date')
        }
        validUntilISO = validUntilObj.toISOString()
      } catch {
        validUntilISO = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: dateISO,
          validUntil: validUntilISO,
        }),
      })

      if (response.ok) {
        onSave()
      } else {
        alert('Ошибка при сохранении акции')
      }
    } catch (error) {
      console.error('Error saving promotion:', error)
      alert('Ошибка при сохранении акции')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'banners')

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setFormData({ ...formData, image: data.url })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Ошибка при загрузке изображения')
    } finally {
      setUploading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {promotion ? 'Редактировать акцию' : 'Создать акцию'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заголовок акции *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата начала *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Действует до *
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Бейдж (например: НОВИНКА, ВЫГОДА)
              </label>
              <input
                type="text"
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название товара (опционально)
              </label>
              <input
                type="text"
                value={formData.productName || ''}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Изображение *
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="promotion-image-upload"
                />
                <label
                  htmlFor="promotion-image-upload"
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span>{uploading ? 'Загрузка...' : 'Загрузить изображение'}</span>
                </label>
                {formData.image && (
                  <div className="relative">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="Или введите URL изображения"
                required
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Сохранить
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}


