'use client'

import { motion } from 'framer-motion'
import { Briefcase, Calendar, Users, TrendingUp, CheckCircle, Clock } from 'lucide-react'
import RequestForm from '@/components/RequestForm'
import { useState } from 'react'
import { useAssistant } from '@/contexts/AssistantContext'

const features = [
  {
    icon: Calendar,
    title: 'Онлайн-запись',
    description: 'Система онлайн-записи клиентов с интеграцией в календарь',
  },
  {
    icon: Users,
    title: 'Управление персоналом',
    description: 'График сотрудников, управление сменами и нагрузкой',
  },
  {
    icon: TrendingUp,
    title: 'Программы лояльности',
    description: 'Система скидок, бонусов и специальных предложений',
  },
  {
    icon: Briefcase,
    title: 'Бухгалтерский учет',
    description: 'Автоматизация финансового учета и отчетности',
  },
]

const solutions = [
  'Онлайн-запись клиентов',
  'Управление графиком сотрудников',
  'Программы лояльности и маркетинг',
  'Бухгалтерский учет',
  'POS-терминалы для приема платежей',
  'Интеграция с CRM системами',
]

export default function ServicesPage() {
  const [showForm, setShowForm] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const { openAssistant } = useAssistant()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          <motion.div
            className="absolute w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{
              x: [0, 100, 0],
              y: [0, 100, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{
              x: [0, -100, 0],
              y: [0, -100, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-8xl mb-6"
            >
              💼
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 mb-6"
            >
              <span className="text-sm font-semibold">Решения для сферы услуг</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-white via-primary-200 to-primary-300 bg-clip-text text-transparent">
                Автоматизация
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary-200 via-primary-300 to-white bg-clip-text text-transparent">
                услуг
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Комплексные решения для сервисных компаний
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowContactForm(true)}
              className="bg-white text-primary-700 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/50 transition"
            >
              Получить консультацию
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                Возможности для сервисных компаний
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Все необходимое для эффективной работы вашего бизнеса
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 border-2 border-primary-100 hover:border-primary-300 transition-all shadow-lg hover:shadow-xl"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-primary-50 to-primary-100 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Что мы предлагаем
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {solutions.map((solution, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4 bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition"
                >
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 font-medium">{solution}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Готовы автоматизировать ваш бизнес?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Свяжитесь с нами для получения персонального предложения
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowContactForm(true)}
                className="bg-white text-green-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl"
              >
                Получить консультацию
              </motion.button>
              <motion.a
                href="/catalog"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition"
              >
                Смотреть каталог
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {showForm && (
        <RequestForm
          businessType="services"
          onClose={() => setShowForm(false)}
        />
      )}

      {showContactForm && (
        <RequestForm
          businessType="services"
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
  )
}

