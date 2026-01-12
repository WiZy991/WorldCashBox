'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Package } from 'lucide-react'
import { useAssistant } from '@/contexts/AssistantContext'

const readyKits = [
  {
    id: 'kit-t1pro',
    article: 'T1PRO-5891_DMOnline12m-Promo',
    name: 'Комплект "Склад Online": ТСД T1pro',
    description: 'Терминал сбора данных ТСД iData T1pro + DMcloud: DataMobile Online - подписка на 12 месяцев',
    price: '41 294 ₽',
    isPromo: true,
    features: [
      'ТСД iData T1pro',
      'DataMobile Online',
      'Подписка на 12 месяцев',
      'Готовое решение под ключ',
    ],
  },
  {
    id: 'kit-k3s-sr',
    article: 'K3S-6466_DMOnline12m-Promo',
    name: 'Комплект "Склад Online": ТСД K3S SR',
    description: 'Терминал сбора данных ТСД iData K3S SR + DMcloud: DataMobile Online - подписка на 12 месяцев',
    price: '43 904 ₽',
    isPromo: true,
    features: [
      'ТСД iData K3S SR',
      'DataMobile Online',
      'Подписка на 12 месяцев',
      'Готовое решение под ключ',
    ],
  },
  {
    id: 'kit-k3s-hd',
    article: 'K3S-6852_DMOnline12m-Promo',
    name: 'Комплект "Склад Online": ТСД K3S HD',
    description: 'Терминал сбора данных ТСД iData K3S HD + DMcloud: DataMobile Online - подписка на 12 месяцев',
    price: '43 904 ₽',
    isPromo: true,
    features: [
      'ТСД iData K3S HD',
      'DataMobile Online',
      'Подписка на 12 месяцев',
      'Готовое решение под ключ',
    ],
  },
  {
    id: 'kit-k8',
    article: 'K8-7317_DMOnline12m-Promo',
    name: 'Комплект "Склад Online": ТСД K8',
    description: 'Терминал сбора данных ТСД iData K8 + DMcloud: DataMobile Online - подписка на 12 месяцев',
    price: '79 074 ₽',
    isPromo: true,
    features: [
      'ТСД iData K8',
      'DataMobile Online',
      'Подписка на 12 месяцев',
      'Готовое решение под ключ',
    ],
  },
]

export default function ReadyKitsPage() {
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
              Готовые комплекты для мобильной автоматизации
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Комплекты "Склад Online" с ТСД iData и DataMobile Online
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-xl"
              >
                🔥 Акция до 31.12.25
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Комплекты */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🔥</span>
              <h2 className="text-2xl font-bold text-red-700">СУПЕРЦЕНА! АКЦИЯ!</h2>
            </div>
            <p className="text-center text-gray-700">
              Все комплекты включают ТСД iData и DataMobile Online с подпиской на 12 месяцев по специальной цене!
            </p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {readyKits.map((kit, index) => (
            <motion.div
              key={kit.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-xl border-2 border-primary-200 hover:shadow-2xl transition relative overflow-hidden flex flex-col"
            >
              {kit.isPromo && (
                <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 text-xs font-bold transform rotate-12 translate-x-2 -translate-y-1 z-10">
                  АКЦИЯ!
                </div>
              )}
              <div className="mb-4 flex-1">
                <p className="text-xs text-gray-500 mb-2 font-mono">{kit.article}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{kit.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{kit.description}</p>
                {kit.features && (
                  <ul className="space-y-2 mb-4">
                    {kit.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-bold text-lg">
                    {kit.price}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openAssistant(true)}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Узнать больше
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Преимущества */}
      <section className="container mx-auto px-4 py-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Почему выбирают наши комплекты?</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-6 shadow-lg border border-primary-100"
          >
            <Package className="w-12 h-12 text-primary-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Готовое решение</h3>
            <p className="text-gray-600">
              Все необходимое оборудование и ПО уже включены в комплект. Не нужно ничего докупать отдельно.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-6 shadow-lg border border-primary-100"
          >
            <CheckCircle className="w-12 h-12 text-primary-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Специальная цена</h3>
            <p className="text-gray-600">
              Выгодное предложение по акции. Экономия при покупке комплекта вместо отдельных компонентов.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-6 shadow-lg border border-primary-100"
          >
            <Package className="w-12 h-12 text-primary-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Под ключ</h3>
            <p className="text-gray-600">
              Полная настройка и обучение персонала. Мы обеспечиваем полную поддержку при внедрении.
            </p>
          </motion.div>
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
          <h2 className="text-4xl font-bold mb-4">Нужна помощь с выбором комплекта?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Наши специалисты подберут оптимальный комплект для вашего бизнеса
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

