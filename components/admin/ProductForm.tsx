'use client'

import { useState, useEffect } from 'react'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Product } from '@/data/products'

interface ProductFormProps {
  product?: Product | null
  onClose: () => void
  onSave: () => void
}

// Маппинг категорий на подкатегории
const subcategoriesByCategory: Record<string, { value: string; label: string }[]> = {
  equipment: [
    { value: 'drawers', label: 'Денежные ящики' },
    { value: 'fiscal_registrars', label: 'Фискальные регистраторы' },
    { value: 'smart_cash_registers', label: 'Онлайн-кассы / Смарт-кассы' },
    { value: 'printers', label: 'Принтеры чеков и этикеток' },
    { value: 'scanners', label: 'Сканеры штрих-кода' },
    { value: 'weights', label: 'Весы' },
    { value: 'pos', label: 'POS-системы' },
    { value: 'terminals', label: 'Банковские терминалы / Пинпады' },
    { value: 'tsd', label: 'ТСД (Терминалы сбора данных)' },
    { value: 'ups', label: 'ИБП / Блоки питания' },
    { value: 'rfid', label: 'RFID-считыватели' },
    { value: 'rf_modules', label: 'POS-коммутаторы' },
    { value: 'pos_keyboards', label: 'POS-клавиатуры' },
  ],
  consumables: [
    { value: 'printers', label: 'Расходные материалы для принтеров' },
  ],
  software: [
    { value: 'software_ofd', label: 'ОФД / Фискальные сервисы' },
    { value: 'software_box', label: 'Коробочное ПО' },
    { value: 'datamobile', label: 'DataMobile' },
    { value: '1c', label: '1С' },
    { value: 'kleverens', label: 'Клеверенс' },
    { value: 'dalion', label: 'Далион' },
    { value: 'frontol', label: 'Frontol' },
    { value: 'electronic_delivery', label: 'Электронная поставка' },
  ],
  video: [
    { value: 'cameras', label: 'Камеры видеонаблюдения' },
  ],
  services: [],
}

export default function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'equipment',
    subcategory: undefined,
    price: undefined,
    description: '',
    features: [],
    image: '',
    images: [],
    sbisId: undefined,
  })
  const [featureInput, setFeatureInput] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        features: product.features || [],
        images: product.images || [],
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Валидация обязательных полей
    if (!formData.name || !formData.name.trim()) {
      alert('Пожалуйста, укажите название товара')
      return
    }
    
    if (!formData.description || !formData.description.trim()) {
      alert('Пожалуйста, укажите описание товара')
      return
    }
    
    if (!formData.category) {
      alert('Пожалуйста, выберите категорию товара')
      return
    }
    
    try {
      const url = product?.id 
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products'
      
      const method = product?.id ? 'PUT' : 'POST'
      
      // Подготавливаем данные для отправки
      const productData = {
        ...formData,
        name: formData.name?.trim() || '',
        description: formData.description?.trim() || '',
        category: formData.category || 'equipment',
        subcategory: formData.subcategory && formData.subcategory.trim() !== '' 
          ? formData.subcategory.trim() 
          : undefined,
        price: formData.price !== undefined && formData.price !== null && !isNaN(Number(formData.price))
          ? Number(formData.price) 
          : undefined,
        features: Array.isArray(formData.features) ? formData.features : [],
        images: Array.isArray(formData.images) ? formData.images : [],
        image: formData.image || undefined,
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Product saved successfully:', result)
        onSave()
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error response:', errorData)
        alert(errorData.error || 'Ошибка при сохранении товара')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Ошибка при сохранении товара: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('category', 'misc')

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await response.json()
      if (data.success && data.url) {
        // Добавляем изображение в массив images
        setFormData(prev => {
          const currentImages = prev.images || []
          // Если это первое изображение, также устанавливаем его как основное
          if (currentImages.length === 0) {
            return { ...prev, image: data.url, images: [data.url] }
          }
          return { ...prev, images: [...currentImages, data.url] }
        })
      } else {
        alert(data.error || 'Ошибка при загрузке изображения')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Ошибка при загрузке изображения')
    } finally {
      setUploading(false)
      // Сбрасываем input для возможности загрузки того же файла снова
      e.target.value = ''
    }
  }

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const uploadPromises: Promise<string>[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('category', 'misc')

      const promise = fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      })
        .then(response => response.json())
        .then(data => {
          if (data.success && data.url) {
            return data.url
          } else {
            throw new Error(data.error || 'Ошибка при загрузке изображения')
          }
        })

      uploadPromises.push(promise)
    }

    try {
      const uploadedUrls = await Promise.all(uploadPromises)
      setFormData(prev => {
        const currentImages = prev.images || []
        // Если это первое изображение, также устанавливаем его как основное
        if (currentImages.length === 0 && uploadedUrls.length > 0) {
          return { ...prev, image: uploadedUrls[0], images: uploadedUrls }
        }
        return { ...prev, images: [...currentImages, ...uploadedUrls] }
      })
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Ошибка при загрузке изображений: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'))
    } finally {
      setUploading(false)
      // Сбрасываем input
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => {
      const currentImages = prev.images || []
      const newImages = currentImages.filter((_, i) => i !== index)
      // Если удаляем основное изображение, устанавливаем первое из оставшихся
      const newMainImage = index === 0 && newImages.length > 0 ? newImages[0] : (index !== 0 ? prev.image : undefined)
      return { ...prev, images: newImages, image: newMainImage }
    })
  }

  const setMainImage = (index: number) => {
    setFormData(prev => {
      const currentImages = prev.images || []
      if (currentImages[index]) {
        return { ...prev, image: currentImages[index] }
      }
      return prev
    })
  }

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), featureInput.trim()],
      })
      setFeatureInput('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features?.filter((_, i) => i !== index) || [],
    })
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {product ? 'Редактировать товар' : 'Добавить товар'}
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
                Название товара *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория *
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const newCategory = e.target.value as Product['category']
                  setFormData({ 
                    ...formData, 
                    category: newCategory,
                    subcategory: undefined // Сбрасываем подкатегорию при смене категории
                  })
                }}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="equipment">Оборудование</option>
                <option value="consumables">Расходные материалы</option>
                <option value="software">Программное обеспечение</option>
                <option value="video">Видеонаблюдение</option>
                <option value="services">Услуги</option>
              </select>
            </div>

            {subcategoriesByCategory[formData.category || 'equipment']?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Подкатегория
                </label>
                <select
                  value={formData.subcategory || ''}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value || undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Не выбрано</option>
                  {subcategoriesByCategory[formData.category || 'equipment'].map((subcat) => (
                    <option key={subcat.value} value={subcat.value}>
                      {subcat.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Выберите подкатегорию для более точной классификации товара
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена (₽)
              </label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {formData.priceUpdatedAt && (
                <p className="mt-1 text-xs text-gray-500">
                  Обновлено: {new Date(formData.priceUpdatedAt).toLocaleString('ru-RU')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID товара в СБИС (артикул)
              </label>
              <input
                type="text"
                value={formData.sbisId || ''}
                onChange={(e) => setFormData({ ...formData, sbisId: e.target.value || undefined })}
                placeholder="Введите ID или артикул товара из СБИС"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Укажите ID или артикул товара из СБИС для автоматической синхронизации цен
              </p>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Изображения товара
              </label>
              
              {/* Загрузка множественных изображений */}
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleImageUpload}
                  className="hidden"
                  id="multiple-image-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="multiple-image-upload"
                  className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors inline-block ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-5 h-5" />
                  <span>{uploading ? 'Загрузка...' : 'Загрузить несколько изображений'}</span>
                </label>
              </div>

              {/* Загрузка одного изображения */}
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="image-upload"
                  className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors inline-block ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ImageIcon className="w-5 h-5" />
                  <span>{uploading ? 'Загрузка...' : 'Загрузить одно изображение'}</span>
                </label>
              </div>

              {/* URL изображения */}
              <input
                type="text"
                value={formData.image || ''}
                onChange={(e) => {
                  const url = e.target.value
                  setFormData(prev => {
                    const currentImages = prev.images || []
                    // Если URL добавляется и его нет в массиве, добавляем
                    if (url && !currentImages.includes(url)) {
                      return { ...prev, image: url, images: currentImages.length === 0 ? [url] : [url, ...currentImages] }
                    }
                    return { ...prev, image: url }
                  })
                }}
                placeholder="Или введите URL изображения"
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              {/* Галерея загруженных изображений */}
              {formData.images && formData.images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Загруженные изображения ({formData.images.length}):
                  </p>
                  <div className="grid grid-cols-4 gap-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className={`w-full h-24 object-cover rounded-lg border-2 ${
                            formData.image === img ? 'border-primary-600' : 'border-gray-200'
                          }`}
                        />
                        {formData.image === img && (
                          <div className="absolute top-1 left-1 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                            Основное
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMainImage(index)}
                            className="opacity-0 group-hover:opacity-100 bg-white text-primary-600 px-2 py-1 rounded text-xs font-semibold hover:bg-primary-50 transition-opacity"
                            title="Сделать основным"
                          >
                            Основное
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="opacity-0 group-hover:opacity-100 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-red-700 transition-opacity"
                            title="Удалить"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Особенности
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="Добавить особенность"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Добавить
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features?.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
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


