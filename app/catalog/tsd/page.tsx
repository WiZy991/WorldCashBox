'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Package, CheckCircle } from 'lucide-react'
import { useAssistant } from '@/contexts/AssistantContext'

const tsdBrands = [
  'Zebra',
  'Zebra PS20',
  'Chainway',
  'iData',
  'АТОЛ SMART',
  'Meferi',
  'Urovo',
  'Point Mobile',
  'Mindeo',
  'Newland',
  'M3 Mobile',
  'SUNMI',
  'Honeywell',
  'Cipher',
  'UNITECH',
]

export default function TSDPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { openAssistant } = useAssistant()

  const filteredBrands = tsdBrands.filter(brand => 
    brand.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
              ТЕРМИНАЛЫ СБОРА ДАННЫХ
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Современные ТСД для автоматизации складских операций и учета
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
                📅 Изменения с 30.09.2025, 03.10.2025
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
              placeholder="Поиск ТСД по производителю..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Brands Grid */}
        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBrands.map((brand, index) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition text-center"
              >
                <Package className="w-12 h-12 text-primary-600 mx-auto mb-4" />
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
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-xl">
            <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-4">ТСД не найдены</p>
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
          <h2 className="text-4xl font-bold mb-4">Нужна помощь с выбором ТСД?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Наши специалисты подберут оптимальный терминал сбора данных для вашего бизнеса
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



