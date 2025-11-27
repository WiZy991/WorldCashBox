'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Code, Wrench, Shield, CheckCircle, ArrowRight, Phone, Mail, MapPin } from 'lucide-react'
import RequestForm from '@/components/RequestForm'
import { useAssistant } from '@/contexts/AssistantContext'

const services = [
  {
    icon: Settings,
    title: 'Настройка оборудования',
    description: 'Профессиональная настройка и конфигурация POS-систем под ваши задачи. Мы настроим все оборудование так, чтобы оно работало максимально эффективно для вашего бизнеса.',
    features: [
      'Настройка кассовых терминалов',
      'Конфигурация программного обеспечения',
      'Подключение периферийных устройств',
      'Обучение персонала',
    ],
  },
  {
    icon: Code,
    title: 'Интеграция систем',
    description: 'Подключение касс к товароучетным программам и внешним сервисам. Обеспечим бесшовную интеграцию всех систем вашего бизнеса.',
    features: [
      'Интеграция с товароучетными системами',
      'Подключение к CRM',
      'Интеграция с системами доставки',
      'Синхронизация с облачными сервисами',
    ],
  },
  {
    icon: Wrench,
    title: 'Техническая поддержка',
    description: 'Круглосуточная поддержка и обслуживание вашего оборудования. Мы всегда на связи и готовы помочь в любой момент.',
    features: [
      'Круглосуточная поддержка',
      'Выезд специалиста на объект',
      'Дистанционная диагностика',
      'Гарантийное обслуживание',
    ],
  },
  {
    icon: Shield,
    title: 'Маркировка товаров',
    description: 'Регистрация в системе "Честный знак" и ЕГАИС под ключ. Поможем с полной регистрацией и настройкой всех необходимых систем.',
    features: [
      'Регистрация в системе "Честный знак"',
      'Подключение к ЕГАИС',
      'Настройка маркировки',
      'Обучение работе с системами',
    ],
  },
  {
    icon: Settings,
    title: 'Установка и монтаж',
    description: 'Профессиональная установка оборудования на вашем объекте. Обеспечим правильный монтаж и подключение всех систем.',
    features: [
      'Выезд специалиста',
      'Монтаж оборудования',
      'Прокладка кабелей',
      'Пусконаладочные работы',
    ],
  },
  {
    icon: Code,
    title: 'Консультации',
    description: 'Экспертные консультации по выбору и использованию оборудования. Поможем найти оптимальное решение для вашего бизнеса.',
    features: [
      'Консультации по выбору оборудования',
      'Анализ бизнес-процессов',
      'Рекомендации по оптимизации',
      'Подбор оптимальных решений',
    ],
  },
]

export default function ServicesListPage() {
  const [showContactForm, setShowContactForm] = useState(false)
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
              Наши услуги
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Полный спектр услуг по автоматизации и обслуживанию вашего бизнеса
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6">
                <service.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowContactForm(true)}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center space-x-2"
              >
                <span>Узнать больше</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          ))}
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
            Для этого мы и нужны! Свяжитесь с нами, и мы подберем, интегрируем и настроим именно то, что наилучшим образом поможет вашему бизнесу.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowContactForm(true)}
              className="bg-white text-primary-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition"
            >
              Получить консультацию
            </motion.button>
            <a
              href="tel:+74232799759"
              className="flex items-center space-x-2 text-white hover:text-primary-200 transition"
            >
              <Phone className="w-5 h-5" />
              <span className="text-lg font-semibold">+7 (423) 2-799-759</span>
            </a>
          </div>
          <div className="mt-8 flex flex-col md:flex-row gap-6 justify-center items-center text-primary-100">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>г. Владивосток, ул. Толстого 32а, офис 308</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>vl@worldcashbox.ru</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Contact Form Modal */}
      {showContactForm && (
        <RequestForm
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
  )
}

