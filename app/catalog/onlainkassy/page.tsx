'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Search, CreditCard } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import RequestForm from '@/components/RequestForm'
import { useAssistant } from '@/contexts/AssistantContext'
import { formatPhoneNumber, getPhoneDigits } from '@/lib/phoneMask'
import { Product } from '@/data/products'

export default function OnlineCashRegistersPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [orderData, setOrderData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
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
    // Фильтруем по категории equipment и подкатегории smart_cash_registers, или по ключевым словам
    const isOnlineCashRegister = product.category === 'equipment' && (
      product.subcategory === 'smart_cash_registers' ||
      product.name.toLowerCase().includes('онлайн-касс') ||
      product.name.toLowerCase().includes('онлайн касс') ||
      product.name.toLowerCase().includes('эвотор') ||
      product.description.toLowerCase().includes('онлайн-касс') ||
      product.description.toLowerCase().includes('онлайн касс') ||
      product.description.toLowerCase().includes('облачная касс')
    )
    
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return isOnlineCashRegister && matchesSearch
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
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка товаров...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
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

