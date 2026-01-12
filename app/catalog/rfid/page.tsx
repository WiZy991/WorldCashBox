'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Radio, CheckCircle } from 'lucide-react'
import { useAssistant } from '@/contexts/AssistantContext'

const rfidCategories = [
  {
    name: 'RFID считыватели и терминалы сбора данных',
    brands: ['Chainway', 'iData', 'Urovo', 'Point Mobile', 'Newland'],
  },
  {
    name: 'RFID-принтеры',
    brands: ['POSTEK', 'Bixolon'],
  },
  {
    name: 'RFID-метки',
    brands: ['TwinTag/CandyTag (цена за метку)', 'ISBC (цена за метку)'],
  },
]

export default function RFIDPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { openAssistant } = useAssistant()

  const filteredCategories = rfidCategories.map(category => ({
    ...category,
    brands: category.brands.filter(brand => 
      brand.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.brands.length > 0)

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
              RFID-ОБОРУДОВАНИЕ
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Принтеры, ТСД, считыватели, RFID-метки
            </p>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6">
              <p className="text-sm text-primary-100">
                ⚠️ Цены в каталоге не являются окончательными и могут меняться в зависимости от курса доллара
              </p>
              <p className="text-sm text-primary-100 mt-2">
                📞 Наши менеджеры подберут для Вас лучшее предложение по телефону{' '}
                <a href="tel:+74232799759" className="font-bold underline">+7 (423) 2-799-759</a>
              </p>
              <p className="text-sm text-primary-100 mt-2">
                📅 Изменения с 30.09.2025
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск RFID оборудования..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        {filteredCategories.map((category, catIndex) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: catIndex * 0.1 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {category.brands.map((brand, index) => (
                <motion.div
                  key={brand}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (catIndex * 0.1) + (index * 0.05) }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition text-center"
                >
                  <Radio className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{brand}</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openAssistant(true)}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    Узнать цену
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-12 text-white text-center shadow-2xl"
        >
          <h2 className="text-4xl font-bold mb-4">Нужна помощь с выбором RFID оборудования?</h2>
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



