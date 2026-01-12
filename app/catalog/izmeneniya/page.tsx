'use client'

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, XCircle, PlusCircle } from 'lucide-react'
import { useAssistant } from '@/contexts/AssistantContext'

const changes = {
  removed: [
    {
      type: 'product',
      name: 'Принтер этикеток АТОЛ ВР41',
      article: '61887',
      price: '13 400 ₽',
    },
  ],
  removedModifications: [
    {
      name: 'Принтер этикеток АТОЛ ТТ44',
      article: '60110',
      description: '203 dpi',
      price: '32 500 ₽',
    },
    {
      name: 'Принтер этикеток АТОЛ ТТ44',
      article: '60112',
      description: '300 dpi',
      price: '34 850 ₽',
    },
  ],
  newProducts: [
    {
      name: 'АТОЛ Smart P20',
      articles: ['64399', '63258'],
      description: 'Планшет Android 13.0, GMS, MT6769, 6Gb/128Gb, Wi-Fi, BT, 4G, GPS, Camera',
      prices: ['37 300 ₽', '43 300 ₽'],
    },
    {
      name: 'АТОЛ Smart T20',
      articles: ['63257'],
      description: 'ТСД 5.5", Android 13.0, GMS, MT6769, 6Gb/64Gb, 2D N6602-W2, Wi-Fi, BT, NFC, 4G, GPS',
      prices: ['37 500 ₽'],
    },
    {
      name: 'АТОЛ Smart M20',
      articles: ['63256'],
      description: 'ТСД 4.2", Android 13.0, GMS, MT6769, 6Gb/64Gb, 2D N6602-W2, Wi-Fi, BT, NFC, 4G, GPS',
      prices: ['36 900 ₽'],
    },
    {
      name: 'АТОЛ DD340',
      articles: ['63656', '64562', '64563', '63657'],
      description: 'Принтер этикеток, термопечать, 203 dpi, USB, Ethernet, BT 5.2, ширина 108 мм',
      prices: ['10 550 ₽', '11 450 ₽', '12 450 ₽', '13 450 ₽'],
    },
  ],
  date: '03.10.2025',
}

export default function ChangesPage() {
  const { openAssistant } = useAssistant()

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
              Изменения в номенклатуре
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Актуальная информация об изменениях в каталоге продукции
            </p>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6">
              <p className="text-sm text-primary-100">
                📅 Изменения с {changes.date}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        {/* Удаленная номенклатура (товар) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Удаленная номенклатура (товар и все его модификации)</h2>
            </div>
            <div className="space-y-4">
              {changes.removed.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-red-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">Артикул: {item.article}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 line-through">{item.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Удаленная номенклатура (модификации) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">Удаленная номенклатура (отдельные модификации)</h2>
            </div>
            <div className="space-y-4">
              {changes.removedModifications.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-orange-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">Артикул: {item.article}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 line-through">{item.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Новая номенклатура */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <PlusCircle className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Новая номенклатура (товары и модификации)</h2>
            </div>
            <div className="space-y-6">
              {changes.newProducts.map((product, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-green-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {product.articles.map((article, artIndex) => (
                      <div key={artIndex} className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Артикул: <span className="font-mono font-bold">{article}</span></p>
                        <p className="text-lg font-bold text-green-700">{product.prices[artIndex]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
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
            Наши специалисты помогут подобрать оптимальное оборудование
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



