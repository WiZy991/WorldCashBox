'use client'

import { useEffect, useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Plus, Edit, Trash2, Search, RefreshCw, CheckSquare, Square, Filter, Download, FileSpreadsheet } from 'lucide-react'
import { motion } from 'framer-motion'
import { Product } from '@/data/products'
import { categories } from '@/data/products'
import ProductForm from '@/components/admin/ProductForm'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  useEffect(() => {
    loadProducts()
  }, [])

  // Сбрасываем выделение при изменении фильтров
  useEffect(() => {
    setSelectedProducts(new Set())
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

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
        setSelectedProducts(new Set())
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      alert('Выберите товары для удаления')
      return
    }

    const count = selectedProducts.size
    if (!confirm(`Вы уверены, что хотите удалить ${count} ${count === 1 ? 'товар' : count < 5 ? 'товара' : 'товаров'}?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/products/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedProducts) }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Успешно удалено товаров: ${data.deletedCount}`)
        loadProducts()
        setSelectedProducts(new Set())
        setCurrentPage(1)
      } else {
        const error = await response.json()
        alert(`Ошибка удаления: ${error.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      console.error('Error deleting products:', error)
      alert('Ошибка при удалении товаров')
    }
  }

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)))
    }
  }

  const handleSelectProduct = (id: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedProducts(newSelected)
  }

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(products, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `products-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportExcel = async () => {
    try {
      // Динамический импорт xlsx для клиентской стороны
      const XLSX = await import('xlsx')
      
      // Подготавливаем данные для Excel
      const worksheetData = products.map(product => ({
        'ID': product.id || '',
        'Название': product.name || '',
        'Категория': getCategoryName(product.category),
        'Подкатегория': product.subcategory || '',
        'Цена': product.price || '',
        'Описание': product.description?.replace(/\n/g, ' ').replace(/\r/g, '') || '',
        'Наличие': product.inStock ? 'Да' : 'Нет',
        'Остаток': product.stock || '',
        'Изображение': product.image || '',
        'SBIS ID': product.sbisId || ''
      }))

      // Создаем рабочую книгу
      const workbook = XLSX.utils.book_new()
      
      // Создаем рабочий лист из данных
      const worksheet = XLSX.utils.json_to_sheet(worksheetData)
      
      // Настраиваем ширину столбцов для удобства чтения
      const columnWidths = [
        { wch: 15 }, // ID
        { wch: 50 }, // Название
        { wch: 25 }, // Категория
        { wch: 25 }, // Подкатегория
        { wch: 12 }, // Цена
        { wch: 60 }, // Описание
        { wch: 10 }, // Наличие
        { wch: 10 }, // Остаток
        { wch: 40 }, // Изображение
        { wch: 15 }  // SBIS ID
      ]
      worksheet['!cols'] = columnWidths
      
      // Добавляем рабочий лист в книгу
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Товары')
      
      // Генерируем Excel файл
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array',
        cellStyles: true
      })
      
      // Создаем Blob и скачиваем файл
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `products-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Ошибка при экспорте в Excel:', error)
      alert('Ошибка при экспорте в Excel. Убедитесь, что установлена библиотека xlsx: npm install xlsx')
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
    (p) => {
      const matchesSearch = 
        (p.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (p.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
      return matchesSearch && matchesCategory
    }
  )

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Получаем русские названия категорий
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : categoryId
  }

  const availableCategories = Array.from(new Set(products.map(p => p.category))).sort()

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

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
              >
                <option value="all">Все категории</option>
                {availableCategories.map(catId => {
                  const category = categories.find(c => c.id === catId)
                  return (
                    <option key={catId} value={catId}>
                      {category ? category.name : catId}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleExportExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
              title="Экспорт в Excel (CSV)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
              title="Экспорт в JSON"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">JSON</span>
            </button>
            {selectedProducts.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить ({selectedProducts.size})</span>
              </button>
            )}
          </div>
        </div>

        {filteredProducts.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            Показано {paginatedProducts.length} из {filteredProducts.length} товаров
            {selectedProducts.size > 0 && ` • Выбрано: ${selectedProducts.size}`}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full">
            <div className="w-full overflow-x-auto">
              <table className="w-full table-fixed min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <button
                        onClick={handleSelectAll}
                        className="text-gray-600 hover:text-gray-900"
                        title={selectedProducts.size === filteredProducts.length ? 'Снять выделение' : 'Выбрать все'}
                      >
                        {selectedProducts.size === filteredProducts.length && filteredProducts.length > 0 ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </th>
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
                  {paginatedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50 ${selectedProducts.has(product.id) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleSelectProduct(product.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {selectedProducts.has(product.id) ? (
                            <CheckSquare className="w-5 h-5 text-primary-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>
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
                          {getCategoryName(product.category)}
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
                            title="Редактировать"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Удалить"
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
            {totalPages > 1 && (
              <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Страница {currentPage} из {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Назад
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Вперед
                  </button>
                </div>
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

