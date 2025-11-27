'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  Users, 
  Award, 
  Target, 
  Heart, 
  Shield, 
  Zap, 
  TrendingUp,
  CheckCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ArrowRight
} from 'lucide-react'
import RequestForm from '@/components/RequestForm'

const statistics = [
  {
    icon: Calendar,
    value: '10+',
    label: 'Лет на рынке',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Users,
    value: '500+',
    label: 'Довольных клиентов',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Building2,
    value: '1000+',
    label: 'Реализованных проектов',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Award,
    value: '24/7',
    label: 'Техническая поддержка',
    color: 'from-orange-500 to-orange-600',
  },
]

const values = [
  {
    icon: Target,
    title: 'Надежность',
    description: 'Мы гарантируем стабильную работу оборудования и программного обеспечения, обеспечивая непрерывность вашего бизнеса.',
    color: 'from-primary-500 to-primary-600',
  },
  {
    icon: Heart,
    title: 'Клиентоориентированность',
    description: 'Каждый клиент важен для нас. Мы находим индивидуальный подход и предлагаем решения, подходящие именно вам.',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: Shield,
    title: 'Профессионализм',
    description: 'Наша команда состоит из опытных специалистов с глубокими знаниями в сфере автоматизации бизнеса.',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: Zap,
    title: 'Инновации',
    description: 'Мы следим за последними тенденциями и внедряем современные технологии для повышения эффективности вашего бизнеса.',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    icon: TrendingUp,
    title: 'Развитие',
    description: 'Мы постоянно развиваемся, расширяем ассортимент и улучшаем качество обслуживания наших клиентов.',
    color: 'from-teal-500 to-teal-600',
  },
  {
    icon: CheckCircle,
    title: 'Качество',
    description: 'Мы работаем только с проверенными поставщиками и гарантируем высокое качество всех наших решений.',
    color: 'from-emerald-500 to-emerald-600',
  },
]

const advantages = [
  'Широкий ассортимент оборудования и ПО',
  'Индивидуальный подход к каждому клиенту',
  'Полный цикл: от консультации до установки',
  'Обучение персонала работе с оборудованием',
  'Гарантийное и постгарантийное обслуживание',
  'Гибкие условия оплаты',
  'Оперативная техническая поддержка',
  'Интеграция с существующими системами',
]

export default function AboutPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      <div className="min-h-screen pt-20 pb-20 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/30">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-block mb-6"
              >
                <Building2 className="w-16 h-16 text-primary-300" />
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                О компании <span className="text-primary-300">WorldCashbox</span>
              </h1>
              <p className="text-xl md:text-2xl text-primary-100">
                Ведущий поставщик решений для автоматизации бизнес-процессов
              </p>
            </motion.div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statistics.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100 hover:border-primary-300 transition-all"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* About Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border-2 border-primary-100"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Кто мы такие
              </h2>
              <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                <p>
                  <strong className="text-primary-600">WorldCashbox</strong> — ведущий поставщик решений для автоматизации бизнес-процессов в регионе. Мы работаем с компаниями различных масштабов: от небольших стартапов до крупных сетей.
                </p>
                <p>
                  Наша команда имеет многолетний опыт работы в сфере автоматизации и готова предложить индивидуальные решения для каждого клиента. Мы помогаем бизнесу оптимизировать процессы, повышать эффективность и увеличивать прибыль.
                </p>
                <p>
                  Мы гордимся тем, что наши клиенты доверяют нам самое важное — автоматизацию своих бизнес-процессов. Наша миссия — сделать работу вашего бизнеса максимально эффективной и современной.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Наши <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">ценности</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Принципы, которыми мы руководствуемся в работе каждый день
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-primary-300 transition-all"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Advantages Section */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border-2 border-primary-100"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Почему выбирают нас
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advantages.map((advantage, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center space-x-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 text-lg">{advantage}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Contact CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-2xl p-8 md:p-12 text-white text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Готовы начать сотрудничество?
              </h2>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                Свяжитесь с нами, и мы поможем подобрать оптимальное решение для вашего бизнеса
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <div className="flex items-center space-x-2 text-primary-100">
                  <Phone className="w-5 h-5" />
                  <a href="tel:+74232799759" className="hover:text-white transition">
                    +7 (423) 2-799-759
                  </a>
                </div>
                <div className="flex items-center space-x-2 text-primary-100">
                  <Mail className="w-5 h-5" />
                  <a href="mailto:vl@worldcashbox.ru" className="hover:text-white transition">
                    vl@worldcashbox.ru
                  </a>
                </div>
                <div className="flex items-center space-x-2 text-primary-100">
                  <MapPin className="w-5 h-5" />
                  <span>г. Владивосток, ул. Толстого 32а, офис 308</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-50 transition shadow-lg flex items-center space-x-2 mx-auto"
              >
                <span>Связаться с нами</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <RequestForm
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  )
}
