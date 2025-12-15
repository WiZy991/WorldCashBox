'use client'

import { useEffect, useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Plus, Edit, Trash2, Search, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import PromotionForm from '@/components/admin/PromotionForm'

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

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)

  useEffect(() => {
    loadPromotions()
  }, [])

  const loadPromotions = async () => {
    try {
      const response = await fetch('/api/admin/promotions')
      const data = await response.json()
      setPromotions(data.promotions || [])
    } catch (error) {
      console.error('Error loading promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту акцию?')) return

    try {
      const response = await fetch(`/api/admin/promotions/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        loadPromotions()
      }
    } catch (error) {
      console.error('Error deleting promotion:', error)
    }
  }

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingPromotion(null)
    loadPromotions()
  }

  const filteredPromotions = promotions.filter(
    (p) => {
      const title = (p.title || '').toLowerCase()
      const description = (p.description || '').toLowerCase()
      const query = searchQuery.toLowerCase()
      return title.includes(query) || description.includes(query)
    }
  )

  const isActive = (validUntil: string) => {
    return new Date(validUntil) >= new Date()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Акции</h1>
            <p className="text-gray-600 mt-2">Управление акциями и специальными предложениями</p>
          </div>
          <button
            onClick={() => {
              setEditingPromotion(null)
              setShowForm(true)
            }}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Создать акцию</span>
          </button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск акций..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromotions.map((promotion, index) => (
              <motion.div
                key={promotion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="relative h-48 bg-gray-200">
                  {promotion.image ? (
                    <img
                      src={promotion.image}
                      alt={promotion.title || 'Акция'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent && !parent.querySelector('.image-placeholder')) {
                          const placeholder = document.createElement('div')
                          placeholder.className = 'image-placeholder w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 text-white text-2xl font-bold'
                          placeholder.textContent = '📷'
                          parent.appendChild(placeholder)
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 text-white text-4xl">
                      📷
                    </div>
                  )}
                  {promotion.badge && (
                    <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {promotion.badge}
                    </div>
                  )}
                  {promotion.validUntil && (
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold ${
                      isActive(promotion.validUntil) 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}>
                      {isActive(promotion.validUntil) ? 'Активна' : 'Завершена'}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{promotion.title || 'Без названия'}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{promotion.description || 'Нет описания'}</p>
                  
                  {promotion.validUntil && (
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>До: {new Date(promotion.validUntil).toLocaleDateString('ru-RU')}</span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(promotion)}
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Редактировать</span>
                    </button>
                    <button
                      onClick={() => handleDelete(promotion.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredPromotions.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            Акции не найдены
          </div>
        )}

        {showForm && (
          <PromotionForm
            promotion={editingPromotion}
            onClose={handleFormClose}
            onSave={handleFormClose}
          />
        )}
      </div>
    </div>
  )
}


