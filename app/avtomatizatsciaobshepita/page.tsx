'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Users, TrendingUp, Clock, Shield, Zap, ArrowRight } from 'lucide-react'
import { useAssistant } from '@/contexts/AssistantContext'
import Image from 'next/image'

const businessTypes = [
  'Сервисам доставки',
  'Столовым',
  'Ресторанам быстрого обслуживания',
  'Ресторанам',
  'Кофейням и пекарням',
  'Сети ресторанов',
]

const features = [
  {
    icon: Users,
    title: 'Управление сетью ресторанов',
    description: 'Управляйте централизованно всеми бизнес-процессами и регулируйте деятельность франчайзи',
  },
  {
    icon: Zap,
    title: 'Технологии искусственного интеллекта',
    description: 'Искусственный интеллект возьмет все операционные процессы на себя, чтобы Вы могли уделить больше времени гостям и развитию бизнеса',
  },
  {
    icon: TrendingUp,
    title: 'Управление бизнесом в режиме онлайн',
    description: 'Получайте информацию о выручке, прибыли, расходах, остатках, действиях сотрудников в режиме реального времени',
  },
]

export default function RestaurantAutomationPage() {
  const { openAssistant } = useAssistant()

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              Автоматизация общепита. iiko
            </h1>
            <p className="text-2xl md:text-3xl text-primary-100 mb-8">
              Умная облачная система управления бизнесом общественного питания.
            </p>
            <p className="text-xl text-primary-200 mb-10">
              Создана, чтобы приносить прибыль.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openAssistant(true)}
              className="bg-white text-primary-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition"
            >
              Получить предложение
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Business Types */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Подберем решение</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {businessTypes.map((type, index) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 text-center border-2 border-primary-200 hover:border-primary-400 transition"
              >
                <p className="font-bold text-primary-800">{type}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why iiko */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Почему стоит выбирать именно iiko?
            </h2>
          </motion.div>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Управление сетью ресторанов',
                'Технологии искусственного интеллекта',
                'Управление бизнесом в режиме онлайн',
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4 bg-primary-50 rounded-xl p-4"
                >
                  <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-800 font-semibold">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Оборудование для ресторанов, кафе и столовых
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { name: 'Пин-пад Pax SP30 CTLS', price: '17 790 рублей' },
              { name: 'ККТ АТОЛ 50Ф', price: '32 100 рублей' },
              { name: 'POS-моноблок POScenter POS100', price: '49 000 рублей' },
            ].map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-2xl font-bold text-primary-600 mb-4">{item.price}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openAssistant(true)}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
                >
                  Узнать больше
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Желаете увеличить прибыль?</h2>
            <p className="text-xl text-primary-100 mb-8">
              Просто оставьте свои контактные данные и менеджер с Вами свяжется!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openAssistant(true)}
              className="bg-white text-primary-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition"
            >
              Отправить
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

