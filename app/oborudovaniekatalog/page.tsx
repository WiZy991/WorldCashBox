'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ShoppingCart, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Product } from '@/data/products'
import ProductCard from '@/components/ProductCard'
import { useAssistant } from '@/contexts/AssistantContext'

const categories = [
  { id: 'all', name: 'Все категории' },
  { id: 'equipment', name: 'Оборудование' },
  { id: 'consumables', name: 'Расходные материалы' },
  { id: 'video', name: 'Видеонаблюдение' },
  { id: 'software', name: 'Программное обеспечение' },
]

const equipmentSubcategories = [
  'Онлайн-кассы',
  'Фискальные регистраторы',
  'Сканеры штрих-кода',
  'Принтеры этикеток и чеков',
  'Денежные ящики',
  'Весы',
  'POS-оборудование',
  'Эквайринг',
  'ТСД',
  'Детекторы и счетчики банкнот',
  'Системы вызова персонала',
]

export default function EquipmentCatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('equipment')
  const [searchQuery, setSearchQuery] = useState('')
  const { openAssistant } = useAssistant()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        setProducts(data.products || [])
      } catch (error) {
        console.error('Error loading products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen pt-20 pb-20 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/30">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              Каталог оборудования
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Полный ассортимент оборудования для автоматизации вашего бизнеса
            </p>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6">
              <p className="text-sm text-primary-100">
                ⚠️ Цены в каталоге не являются окончательными и могут меняться в зависимости от курса доллара
              </p>
              <p className="text-sm text-primary-100 mt-2">
                📞 Наши менеджеры подберут для Вас лучшее предложение по телефону{' '}
                <a href="tel:+74232799759" className="font-bold underline">+7 (423) 2-799-759</a>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск по каталогу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openAssistant(true)}
              className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl transition flex items-center justify-center space-x-2"
            >
              <span>Получить консультацию</span>
            </motion.button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-xl font-semibold transition ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Equipment Subcategories */}
        {selectedCategory === 'equipment' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Категории оборудования:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {equipmentSubcategories.map((subcat) => {
                const subcatLinks: Record<string, string> = {
                  'Онлайн-кассы': '/catalog/onlainkassy',
                  'Фискальные регистраторы': '/catalog/fiscalnyeregistratory',
                  'Сканеры штрих-кода': '/catalog/skaneryshtrikhkoda',
                  'Принтеры этикеток и чеков': '/catalog/printerchekov',
                  'Денежные ящики': '/catalog/denezhnyiyaschik',
                  'Весы': '/catalog/scales',
                  'POS-оборудование': '/catalog/posoborudovaniye',
                  'Эквайринг': '/catalog/acquiring',
                  'ТСД': '/catalog/terminalsboradannykh',
                  'Детекторы и счетчики банкнот': '/catalog/banknote',
                  'Системы вызова персонала': '/catalog/sistemyvyzovapersonala',
                }
                const link = subcatLinks[subcat]
                return link ? (
                  <Link key={subcat} href={link}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 text-center font-semibold text-primary-700 hover:bg-primary-100 transition cursor-pointer"
                    >
                      {subcat}
                    </motion.div>
                  </Link>
                ) : (
                  <motion.div
                    key={subcat}
                    whileHover={{ scale: 1.05 }}
                    className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 text-center font-semibold text-primary-700 hover:bg-primary-100 transition cursor-pointer"
                  >
                    {subcat}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка товаров...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 mb-4">Товары не найдены</p>
            <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-12 text-white text-center shadow-2xl"
        >
          <h2 className="text-4xl font-bold mb-4">Нужна помощь с выбором?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Наши специалисты подберут оптимальное решение для вашего бизнеса
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openAssistant(true)}
            className="bg-white text-primary-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition"
          >
            Получить консультацию
          </motion.button>
        </motion.div>
      </section>
    </div>
  )
}

