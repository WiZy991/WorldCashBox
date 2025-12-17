'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Search, Package, CheckCircle } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import RequestForm from '@/components/RequestForm'
import { useAssistant } from '@/contexts/AssistantContext'
import { Product } from '@/data/products'
import { formatPhoneNumber, getPhoneDigits } from '@/lib/phoneMask'

export default function ConsumablesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [orderData, setOrderData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [showContactForm, setShowContactForm] = useState(false)
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

  const consumables = products.filter(p => p.category === 'consumables')

  const filteredProducts = consumables.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Отправка заказа напрямую, без открытия ассистента
    try {
      const response = await fetch('/api/sbis/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: orderData.name,
          phone: getPhoneDigits(orderData.phone), // Отправляем только цифры
          email: orderData.email,
          message: 'Заказ расходных материалов',
          product: 'Расходные материалы',
        }),
      })
      
      if (response.ok) {
        alert('Спасибо за заказ! Наш менеджер свяжется с вами в ближайшее время.')
        setOrderData({ name: '', email: '', phone: '' })
      } else {
        alert('Произошла ошибка при отправке заказа. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.')
      }
    } catch (error) {
      console.error('Ошибка отправки заказа:', error)
      alert('Произошла ошибка при отправке заказа. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.')
    }
  }

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
              Расходные материалы
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Все необходимое для бесперебойной работы вашего оборудования
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

      {/* Search and Order Form */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Поиск расходных материалов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ваш заказ</h3>
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Имя"
                  value={orderData.name}
                  onChange={(e) => setOrderData({ ...orderData, name: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="E-mail"
                  value={orderData.email}
                  onChange={(e) => setOrderData({ ...orderData, email: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={orderData.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    setOrderData({ ...orderData, phone: formatted })
                  }}
                  onBlur={(e) => {
                    const digits = getPhoneDigits(e.target.value)
                    if (digits.length >= 11) {
                      setOrderData({ ...orderData, phone: formatPhoneNumber(digits) })
                    }
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  maxLength={18}
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
              >
                Оформить заказ
              </motion.button>
              <p className="text-xs text-gray-500 text-center">
                Нажимая кнопку «Оформить заказ» вы соглашаетесь с политикой в отношении обработки персональных данных
              </p>
            </form>
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
          <div className="text-center py-20">
            <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-4">Расходные материалы не найдены</p>
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
          <h2 className="text-4xl font-bold mb-4">Нужна помощь?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Для этого мы и нужны! Свяжитесь с нами, и мы подберем, интегрируем и настроим именно то, что наилучшим образом поможет вашему бизнесу.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowContactForm(true)}
            className="bg-white text-primary-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition"
          >
            Свяжитесь с нами!
          </motion.button>
        </motion.div>
      </section>

      {/* Contact Form Modal */}
      {showContactForm && (
        <RequestForm
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
  )
}

