'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Search, CreditCard } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import RequestForm from '@/components/RequestForm'
import { useAssistant } from '@/contexts/AssistantContext'
import { formatPhoneNumber, getPhoneDigits } from '@/lib/phoneMask'

export default function OnlineCashRegistersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [orderData, setOrderData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const { openAssistant } = useAssistant()

  // Примерные товары для онлайн-касс
  const products = [
    {
      id: 'evotor-7-2',
      name: 'Эвотор 7.2',
      category: 'equipment',
      price: 25000,
      image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=300&fit=crop',
      description: 'Популярная облачная онлайн-касса для малого бизнеса',
      features: ['Мобильность', 'Облачная касса', 'Приложения для бизнеса', 'Простота использования'],
    },
    {
      id: 'evotor-7-3',
      name: 'Эвотор 7.3',
      category: 'equipment',
      price: 30000,
      image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=300&fit=crop',
      description: 'Новое поколение облачных онлайн-касс Эвотор',
      features: ['Улучшенная производительность', 'Больший экран', 'Расширенная функциональность', 'Облачные сервисы'],
    },
    {
      id: 'pos-center-pos101',
      name: 'POSCenter POS101',
      category: 'equipment',
      price: 35000,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      description: 'Компактная онлайн-касса для малого бизнеса',
      features: ['Компактный размер', 'Поддержка ОФД', 'Простое управление', 'Низкая цена'],
    },
  ]

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
          message: 'Заказ онлайн-касс',
          product: 'Онлайн-кассы',
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
              Онлайн-кассы
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Современные онлайн-кассы для автоматизации торговли
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
                  placeholder="Поиск онлайн-касс..."
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
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={() => {
                  setSelectedProduct(product)
                  setShowForm(true)
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-xl">
            <p className="text-gray-600 text-lg">Товары не найдены</p>
          </div>
        )}
      </section>

      {/* Request Form Modal */}
      {showForm && selectedProduct && (
        <RequestForm
          product={selectedProduct}
          onClose={() => {
            setShowForm(false)
            setSelectedProduct(null)
          }}
        />
      )}
    </div>
  )
}

