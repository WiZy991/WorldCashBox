'use client'

import { useEffect, useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Plus, Edit, Trash2, Search, RefreshCw } from 'lucide-react'
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

  const filteredProducts = products.filter(
    (p) =>
      (p.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (p.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      <AdminSidebar />
      <div className="flex-1 p-8 min-w-0 overflow-x-hidden">
        <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Товары</h1>
            <p className="text-gray-600 mt-2">Управление каталогом товаров</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={async () => {
                if (!confirm('Импортировать все товары со склада "Толстого 32А"? Это может занять некоторое время.')) {
                  return
                }
                setSyncing(true)
                try {
                  const response = await fetch('/api/sbis/products/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ force: false }),
                  })
                  const data = await response.json()
                  if (response.ok) {
                    const message = `Импорт завершен!\n` +
                      `Создано товаров: ${data.stats.created || 0}\n` +
                      `Обновлено товаров: ${data.stats.updated || 0}\n` +
                      `Всего обработано: ${data.stats.total || 0}\n\n` +
                      `Категории:\n${Object.entries(data.stats.categories || {}).map(([cat, count]) => `  ${cat}: ${count}`).join('\n')}`
                    alert(message)
                    loadProducts()
                  } else {
                    alert(`Ошибка импорта: ${data.error || 'Неизвестная ошибка'}\n\n${data.details || ''}`)
                  }
                } catch (error) {
                  console.error('Error importing products:', error)
                  alert('Ошибка при импорте товаров')
                } finally {
                  setSyncing(false)
                }
              }}
              disabled={syncing}
              className="bg-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${syncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{syncing ? 'Импорт...' : 'Импорт товаров'}</span>
              <span className="sm:hidden">{syncing ? '...' : 'Импорт'}</span>
            </button>
            <button
              onClick={handleSyncPrices}
              disabled={syncing}
              className="bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${syncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{syncing ? 'Синхронизация...' : 'Синхронизировать цены'}</span>
              <span className="sm:hidden">{syncing ? '...' : 'Синхронизация'}</span>
            </button>
            <button
              onClick={() => {
                setEditingProduct(null)
                setShowForm(true)
              }}
              className="bg-primary-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center space-x-2 text-sm sm:text-base whitespace-nowrap"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Добавить товар</span>
              <span className="sm:hidden">Добавить</span>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md w-full">
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
          <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full">
            <div className="w-full">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                      Название
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Категория
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Цена
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center min-w-0">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg mr-2 flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">{product.name || 'Без названия'}</div>
                            <div className="text-xs text-gray-500 truncate">
                              {product.description ? `${product.description.substring(0, 40)}...` : 'Нет описания'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {product.price ? `${product.price.toLocaleString()} ₽` : '—'}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
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
                    </tr>
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

