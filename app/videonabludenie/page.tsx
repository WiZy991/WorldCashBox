'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Video, HardDrive, Battery, Search, ShoppingCart } from 'lucide-react'
import { products } from '@/data/products'
import ProductCard from '@/components/ProductCard'
import RequestForm from '@/components/RequestForm'
import { useAssistant } from '@/contexts/AssistantContext'
import { formatPhoneNumber, getPhoneDigits } from '@/lib/phoneMask'

const videoProducts = products.filter(p => p.category === 'video')

const categories = [
  { id: 'all', name: 'Все', icon: Camera },
  { id: 'cameras', name: 'IP-камеры видеонаблюдения', icon: Video },
  { id: 'accessories', name: 'Расходники', icon: ShoppingCart },
  { id: 'mounting', name: 'Монтажные коробки', icon: Video },
  { id: 'brackets', name: 'Кронштейны', icon: Video },
  { id: 'ups', name: 'Бесперебойники', icon: Battery },
  { id: 'batteries', name: 'Аккумуляторы', icon: Battery },
  { id: 'storage', name: 'Жесткие диски', icon: HardDrive },
]

export default function VideoSurveillancePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [orderData, setOrderData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [selectedProduct, setSelectedProduct] = useState(products.find(p => p.category === 'video') || null)
  const [showForm, setShowForm] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const { openAssistant } = useAssistant()

  const filteredProducts = videoProducts.filter(product => {
    let matchesCategory = selectedCategory === 'all'
    
    if (selectedCategory === 'cameras') {
      matchesCategory = product.name.toLowerCase().includes('камера') || product.name.toLowerCase().includes('camera')
    } else if (selectedCategory === 'accessories') {
      matchesCategory = product.name.toLowerCase().includes('кабель') || 
                        product.name.toLowerCase().includes('разъем') || 
                        product.name.toLowerCase().includes('коннектор') ||
                        product.name.toLowerCase().includes('блок питания') ||
                        product.name.toLowerCase().includes('сплиттер')
    } else if (selectedCategory === 'mounting') {
      matchesCategory = product.name.toLowerCase().includes('монтажная коробка')
    } else if (selectedCategory === 'brackets') {
      matchesCategory = product.name.toLowerCase().includes('кронштейн')
    } else if (selectedCategory === 'ups') {
      matchesCategory = product.name.toLowerCase().includes('бесперебойник')
    } else if (selectedCategory === 'batteries') {
      matchesCategory = product.name.toLowerCase().includes('аккумулятор')
    } else if (selectedCategory === 'storage') {
      matchesCategory = product.name.toLowerCase().includes('жесткий диск') || product.name.toLowerCase().includes('hdd')
    }
    
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
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
          message: 'Заказ видеонаблюдения',
          product: 'Видеонаблюдение',
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
              Видеонаблюдение
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Установим видеонаблюдение для Вашего бизнеса. Мы предлагаем современные системы, которые обеспечат надежную защиту от несанкционированного доступа в офис или на предприятие.
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

      {/* Categories */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Категории</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-xl border-2 transition ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white border-primary-600 shadow-lg'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-primary-300'
                }`}
              >
                <category.icon className="w-6 h-6 mx-auto mb-2" />
                <p className="text-xs font-semibold text-center">{category.name}</p>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Search and Products */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Поиск по видеонаблюдению..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductCard 
                      product={product} 
                      onSelect={() => {
                        setSelectedProduct(product)
                        setShowForm(true)
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-xl">
                <Camera className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600 mb-4">Товары не найдены</p>
                <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
              </div>
            )}
          </div>

          {/* Order Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 h-fit sticky top-24">
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
            Свяжитесь с нами, и мы поможем подобрать и внедрить оптимальное решение индивидуально под Ваши потребности.
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

      {/* Contact Form Modal */}
      {showContactForm && (
        <RequestForm
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
  )
}

