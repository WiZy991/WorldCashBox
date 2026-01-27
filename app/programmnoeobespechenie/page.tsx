'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Code, Cloud, Shield, BarChart3, CheckCircle, Search, ArrowRight } from 'lucide-react'
import { Product } from '@/data/products'
import ProductCard from '@/components/ProductCard'
import { useAssistant } from '@/contexts/AssistantContext'

const softwareCategories = [
  { id: 'all', name: 'Все программы' },
  { id: 'accounting', name: 'Товароучетные системы' },
  { id: 'crm', name: 'CRM системы' },
  { id: 'restaurant', name: 'Для ресторанов' },
  { id: 'cloud', name: 'Облачные решения' },
  { id: 'datamobile', name: 'DataMobile' },
  { id: '1c', name: '1С' },
  { id: 'kleverens', name: 'Клеверенс' },
  { id: 'dalion', name: 'Далион' },
  { id: 'frontol', name: 'Frontol' },
  { id: 'electronic_delivery', name: 'Электронная поставка' },
]

const features = [
  {
    icon: Cloud,
    title: 'Облачные решения',
    description: 'Работайте из любой точки мира с доступом через интернет',
  },
  {
    icon: Shield,
    title: 'Безопасность данных',
    description: 'Защита ваших данных с использованием современных технологий',
  },
  {
    icon: BarChart3,
    title: 'Аналитика и отчеты',
    description: 'Детальная аналитика для принятия обоснованных решений',
  },
  {
    icon: Code,
    title: 'Интеграции',
    description: 'Легкая интеграция с другими системами и сервисами',
  },
]

export default function SoftwarePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { openAssistant } = useAssistant()

  useEffect(() => {
    const loadProductsData = async () => {
      try {
        const { loadProducts } = await import('@/lib/products')
        const productsData = await loadProducts()
        setProducts(productsData)
      } catch (error) {
        console.error('Error loading products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    loadProductsData()
  }, [])

  const softwareProducts = products.filter(p => p.category === 'software')

  const filteredProducts = softwareProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.subcategory === selectedCategory
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
              Программное обеспечение
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Современные программные решения для автоматизации вашего бизнеса
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

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
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
                placeholder="Поиск программного обеспечения..."
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
            {softwareCategories.map((category) => (
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
          <div className="text-center py-20 bg-white rounded-2xl shadow-xl">
            <Code className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-4">Программное обеспечение не найдено</p>
            <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </section>

      {/* Popular Software */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Популярные решения</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { name: 'iiko', description: 'Система управления рестораном' },
            { name: 'Битрикс24', description: 'CRM система для бизнеса. От 3 000 ₽. Подробнее на worldcashbox24.ru' },
          ].map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-6">
                {item.name === 'Битрикс24' ? (
                  <>
                    CRM система для бизнеса. От 3 000 ₽.{' '}
                    <a 
                      href="https://worldcashbox24.ru" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 underline font-semibold"
                    >
                      Подробнее на worldcashbox24.ru
                    </a>
                  </>
                ) : (
                  item.description
                )}
              </p>
              {item.name === 'Битрикс24' && (
                <div className="flex flex-col gap-3">
                  <a 
                    href="https://worldcashbox24.ru" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition text-center"
                  >
                    Подробнее на worldcashbox24.ru →
                  </a>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openAssistant(true)}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition"
                  >
                    Узнать больше →
                  </motion.button>
                </div>
              )}
              {item.name !== 'Битрикс24' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openAssistant(true)}
                  className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center space-x-2"
                >
                  <span>Узнать больше</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
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
            Наши специалисты подберут оптимальное программное решение для вашего бизнеса
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

