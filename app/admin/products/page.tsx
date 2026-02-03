'use client'

import { useEffect, useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Plus, Edit, Trash2, Search, RefreshCw, Warehouse } from 'lucide-react'
import { motion } from 'framer-motion'
import { Product } from '@/data/products'
import ProductForm from '@/components/admin/ProductForm'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        loadProducts()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingProduct(null)
    loadProducts()
  }

  const handleSyncPrices = async () => {
    if (!confirm('Синхронизировать цены и остатки из СБИС? Это может занять некоторое время.')) {
      return
    }

    setSyncing(true)
    try {
      const response = await fetch('/api/sbis/prices/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: false, syncStock: true }),
      })

      const data = await response.json()
      
      if (response.ok) {
        const message = `Синхронизация завершена!\n` +
          `Всего товаров: ${data.stats.total || 0}\n` +
          `С sbisId: ${data.stats.withSBISId || 0}\n` +
          `Обновлено цен: ${data.stats.pricesUpdated || 0}\n` +
          `Обновлено остатков: ${data.stats.stockUpdated || 0}\n` +
          `Не найдено: ${data.stats.notFound || 0}\n` +
          `Товаров в СБИС: ${data.stats.totalPricesInSBIS || 0}`
        alert(message)
        loadProducts()
      } else {
        let errorMessage = `Ошибка синхронизации: ${data.error || 'Неизвестная ошибка'}`
        if (data.details) {
          errorMessage += `\n\nДетали: ${data.details}`
        }
        if (data.hint) {
          errorMessage += `\n\nПодсказка: ${data.hint}`
        }
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Error syncing prices:', error)
      alert('Ошибка при синхронизации цен и остатков')
    } finally {
      setSyncing(false)
    }
  }

  const handleCheckWarehouse = async () => {
    // Метод получения списка складов не поддерживается в СБИС API
    // Показываем информацию о текущей настройке
    alert('Метод получения списка складов не поддерживается в СБИС API.\n\n' +
      'Используйте переменную SBIS_WAREHOUSE_ID в ecosystem.config.js на сервере для указания склада.\n\n' +
      'Текущий склад указан в переменных окружения PM2.\n\n' +
      'Для проверки выполните на сервере: pm2 env 0 | grep SBIS_WAREHOUSE_ID')
  }

  const filteredProducts = products.filter(
    (p) =>
      (p.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (p.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Товары</h1>
            <p className="text-gray-600 mt-2">Управление каталогом товаров</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCheckWarehouse}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
              title="Проверить склад в СБИС"
            >
              <Warehouse className="w-5 h-5" />
              <span>Проверить склад</span>
            </button>
            <button
              onClick={handleSyncPrices}
              disabled={syncing}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Синхронизация...' : 'Синхронизировать цены'}</span>
            </button>
            <button
              onClick={() => {
                setEditingProduct(null)
                setShowForm(true)
              }}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Добавить товар</span>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск товаров..."
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
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Название
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Категория
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Цена
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name || 'Без названия'}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description ? `${product.description.substring(0, 50)}...` : 'Нет описания'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.price ? `${product.price.toLocaleString()} ₽` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Товары не найдены
              </div>
            )}
          </div>
        )}

        {showForm && (
          <ProductForm
            product={editingProduct}
            onClose={handleFormClose}
            onSave={handleFormClose}
          />
        )}
      </div>
    </div>
  )
}

