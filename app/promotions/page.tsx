'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight, Tag, Clock } from 'lucide-react'
import RequestForm from '@/components/RequestForm'
import { Product } from '@/data/products'

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

export default function PromotionsPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    // Загружаем товары из API
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        setProducts(data.products || [])
      } catch (error) {
        console.error('Error loading products:', error)
        setProducts([])
      }
    }
    loadProducts()

    // Загружаем акции из API
    const loadPromotions = async () => {
      try {
        const response = await fetch('/api/promotions')
        const data = await response.json()
        if (data.promotions && data.promotions.length > 0) {
          setPromotions(data.promotions)
        } else {
          // Если акций нет, используем дефолтные
          const currentDate = new Date()
          const nextMonth = new Date(currentDate)
          nextMonth.setMonth(nextMonth.getMonth() + 1)
          const nextQuarter = new Date(currentDate)
          nextQuarter.setMonth(nextQuarter.getMonth() + 3)

          const formatDate = (date: Date) => {
            return date.toISOString().split('T')[0]
          }

          const currentPromotions: Promotion[] = [
            {
              id: 1,
              title: 'Эвотор 6 всего за 100 рублей!',
              description: 'Специальное предложение на популярную кассу Эвотор 6. Идеальное решение для малого бизнеса.',
              date: formatDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)),
              validUntil: formatDate(nextMonth),
              badge: 'НОВИНКА',
              image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
              productName: 'Эвотор 6',
            },
            {
              id: 2,
              title: 'Фискальный накопитель на 15 месяцев за 6 000 рублей!',
              description: 'Выгодное предложение на фискальный накопитель с увеличенным сроком службы.',
              date: formatDate(new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000)),
              validUntil: formatDate(nextQuarter),
              badge: 'ВЫГОДА',
              image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop',
              productName: 'Фискальный накопитель',
            },
            {
              id: 3,
              title: 'Эвотор 7.3 за 3 000 рублей!',
              description: 'Новое поколение касс по специальной цене. Современные технологии по доступной стоимости.',
              date: formatDate(new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000)),
              validUntil: formatDate(nextMonth),
              badge: 'ПОПУЛЯРНО',
              image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
              productName: 'Эвотор 7.3',
            },
          ]
          setPromotions(currentPromotions)
        }
      } catch (error) {
        console.error('Error loading promotions:', error)
      }
    }
    loadPromotions()
  }, [])

  const handleLearnMore = (promotion: Promotion) => {
    // Находим продукт по названию
    const product = products.find(p => 
      p.name.toLowerCase().includes(promotion.productName?.toLowerCase() || '') ||
      promotion.productName?.toLowerCase().includes(p.name.toLowerCase() || '')
    )
    
    setSelectedPromotion(promotion)
    setShowForm(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getDaysRemaining = (validUntil: string) => {
    const today = new Date()
    const until = new Date(validUntil)
    const diff = Math.ceil((until.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  const isActive = (validUntil: string) => {
    return new Date(validUntil) >= new Date()
  }

  return (
    <>
      <div className="min-h-screen pt-20 pb-20 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/30">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Акции и <span className="text-primary-300">специальные предложения</span>
              </h1>
              <p className="text-xl md:text-2xl text-primary-100">
                Выгодные условия на оборудование и услуги
              </p>
            </motion.div>
          </div>
        </section>

        {/* Promotions Grid */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promotions.map((promo, index) => {
              const daysRemaining = getDaysRemaining(promo.validUntil)
              const active = isActive(promo.validUntil)
              
              return (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100 hover:border-primary-300 transition-all"
                >
                  {/* Image Section */}
                  <div className="relative h-64 overflow-hidden bg-gray-200">
                    {promo.image ? (
                      <img
                        src={promo.image}
                        alt={promo.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        style={{ objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                          // Если изображение не загрузилось, показываем placeholder
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
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    
                    {/* Badge */}
                    {promo.badge && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                        className="absolute top-4 right-4 bg-primary-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center space-x-1 z-10"
                      >
                        <Tag className="w-4 h-4" />
                        <span>{promo.badge}</span>
                      </motion.div>
                    )}

                    {/* Title on Image */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                      <h2 className="text-2xl font-bold mb-2 leading-tight">{promo.title}</h2>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 space-y-4">
                    <p className="text-gray-700 leading-relaxed">{promo.description}</p>

                    {/* Date Info */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Calendar className="w-5 h-5 text-primary-600" />
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">Действует до:</p>
                          <p className={active ? 'text-green-600 font-bold' : 'text-red-600'}>
                            {formatDate(promo.validUntil)}
                          </p>
                        </div>
                      </div>
                      {active && daysRemaining > 0 && (
                        <div className="flex items-center space-x-1 text-primary-600 font-bold">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{daysRemaining} дн.</span>
                        </div>
                      )}
                    </div>

                    {/* Button */}
                    {active ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleLearnMore(promo)}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center space-x-2 group-hover:from-primary-700 group-hover:to-primary-600"
                      >
                        <span>Узнать подробнее</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 py-4 rounded-xl font-bold cursor-not-allowed"
                      >
                        Акция завершена
                      </button>
                    )}
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary-300/0 group-hover:border-primary-500 rounded-tl-2xl transition-all"></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary-300/0 group-hover:border-primary-500 rounded-br-2xl transition-all"></div>
                </motion.div>
              )
            })}
          </div>

          {promotions.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-600 text-xl">Актуальные акции появятся здесь в ближайшее время</p>
            </div>
          )}
        </section>
      </div>

      {/* Request Form Modal */}
      {showForm && selectedPromotion && (
        <RequestForm
          product={products.find(p => 
            p.name.toLowerCase().includes(selectedPromotion.productName?.toLowerCase() || '') ||
            selectedPromotion.productName?.toLowerCase().includes(p.name.toLowerCase() || '')
          )}
          onClose={() => {
            setShowForm(false)
            setSelectedPromotion(null)
          }}
        />
      )}
    </>
  )
}
