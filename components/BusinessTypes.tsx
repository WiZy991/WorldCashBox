'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import RequestForm from './RequestForm'
import { useState } from 'react'
import { useAssistant } from '@/contexts/AssistantContext'

const businessTypes = [
  {
    id: 'restaurant',
    title: 'Кафе, рестораны, общепит',
    description: 'Автоматизация ресторанов, кафе и прочих объектов общественного питания',
    features: [
      'Работа зала и кухни',
      'Учет продуктов',
      'Калькуляция блюд',
      'Система лояльности',
    ],
    image: '🍽️',
  },
  {
    id: 'services',
    title: 'Предоставление услуг',
    description: 'Онлайн-запись, график сотрудников, программы лояльности',
    features: [
      'Онлайн-запись',
      'График сотрудников',
      'Программы лояльности',
      'Бухучет',
    ],
    image: '💼',
  },
  {
    id: 'retail',
    title: 'Розничные продажи',
    description: 'Автоматизация магазинов и аптек с поддержкой ОФД, ЕГАИС, Меркурий',
    features: [
      'Поддержка ОФД, ЕГАИС',
      'Маркировка товаров',
      'Складской учет',
      'Аналитика продаж',
    ],
    image: '🛒',
  },
]

export default function BusinessTypes() {
  const [showForm, setShowForm] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState<string>('')
  const { openAssistant } = useAssistant()

  const handleGetOffer = (businessId: string) => {
    // Открываем ассистента, который начнет работу как менеджер
    openAssistant(true)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/30 relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-block mb-6"
          >
            <span className="text-7xl">🚀</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 bg-clip-text text-transparent">
              Решения для вашего бизнеса
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            Мы подберем оборудование и систему учета индивидуально под ваш бизнес
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {businessTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -15, scale: 1.02 }}
              className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border-2 border-transparent hover:border-purple-200 overflow-hidden"
            >
              {/* Градиентный фон при наведении */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-primary-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="text-7xl mb-6 inline-block"
                >
                  {type.image}
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary-600 group-hover:to-primary-500 group-hover:bg-clip-text transition-all duration-300">
                  {type.title}
                </h3>
                <p className="text-gray-600 mb-6 text-lg">{type.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {type.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-center text-gray-700 font-medium"
                    >
                      <motion.div
                        whileHover={{ scale: 1.5 }}
                        className="w-2.5 h-2.5 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full mr-3"
                      ></motion.div>
                      {feature}
                    </motion.li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/business/${type.id}`}
                    className="flex-1 text-center border-2 border-primary-600 text-primary-600 py-4 rounded-xl font-bold hover:bg-primary-50 transition-all hover:scale-105"
                  >
                    Подробнее
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGetOffer(type.id)}
                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Получить предложение</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
              
              {/* Декоративные углы */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-200/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </motion.div>
          ))}
        </div>
      </div>

      {showForm && (
        <RequestForm
          businessType={selectedBusiness}
          onClose={() => {
            setShowForm(false)
            setSelectedBusiness('')
          }}
        />
      )}
    </section>
  )
}

