'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, FileText, CheckCircle } from 'lucide-react'
import RequestForm from '@/components/RequestForm'

const sections = [
  {
    icon: FileText,
    title: '1. Общие положения',
    content: [
      'Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта WorldCashbox (далее — Сайт).',
      'Использование Сайта означает безоговорочное согласие пользователя с настоящей Политикой и указанными в ней условиями обработки его персональной информации.',
      'В случае несогласия с условиями Политики конфиденциальности пользователь должен прекратить использование Сайта.',
    ],
  },
  {
    icon: Eye,
    title: '2. Собираемая информация',
    content: [
      'При использовании Сайта мы можем собирать следующую информацию:',
      '• Имя и контактные данные (телефон, email)',
      '• Название компании и ИНН (при указании)',
      '• Информация о запрашиваемых товарах и услугах',
      '• Техническая информация (IP-адрес, тип браузера, операционная система)',
      '• Данные о взаимодействии с Сайтом (страницы, которые вы посещаете, время посещения)',
    ],
  },
  {
    icon: Lock,
    title: '3. Цели обработки персональных данных',
    content: [
      'Персональные данные обрабатываются в следующих целях:',
      '• Обработка заявок и запросов пользователей',
      '• Предоставление информации о товарах и услугах',
      '• Связь с пользователями для консультаций и поддержки',
      '• Улучшение качества работы Сайта',
      '• Соблюдение требований законодательства Российской Федерации',
    ],
  },
  {
    icon: Shield,
    title: '4. Защита персональных данных',
    content: [
      'Мы применяем необходимые технические и организационные меры для защиты персональных данных от неправомерного доступа, уничтожения, изменения, блокирования, копирования, распространения.',
      'Доступ к персональным данным имеют только уполномоченные сотрудники, которые обязаны обеспечивать конфиденциальность этих данных.',
    ],
  },
  {
    icon: CheckCircle,
    title: '5. Права пользователей',
    content: [
      'Пользователь имеет право:',
      '• Получать информацию о своих персональных данных',
      '• Требовать уточнения, блокирования или уничтожения персональных данных',
      '• Отозвать согласие на обработку персональных данных',
      '• Обжаловать действия или бездействие оператора в уполномоченном органе по защите прав субъектов персональных данных',
    ],
  },
  {
    icon: FileText,
    title: '6. Передача персональных данных третьим лицам',
    content: [
      'Мы не передаем персональные данные третьим лицам, за исключением случаев:',
      '• Когда передача необходима для выполнения обязательств перед пользователем',
      '• Когда передача предусмотрена законодательством Российской Федерации',
      '• При передаче данных в CRM-системы для обработки заявок (Saby, СБИС)',
    ],
  },
  {
    icon: Lock,
    title: '7. Сроки хранения персональных данных',
    content: [
      'Персональные данные хранятся в течение срока, необходимого для достижения целей обработки, или в течение срока, установленного законодательством Российской Федерации.',
      'После достижения целей обработки или истечения срока хранения персональные данные подлежат уничтожению или обезличиванию.',
    ],
  },
  {
    icon: Shield,
    title: '8. Изменения в Политике конфиденциальности',
    content: [
      'Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности.',
      'При внесении существенных изменений мы уведомим пользователей путем размещения уведомления на Сайте.',
      'Продолжение использования Сайта после внесения изменений означает согласие с новой версией Политики.',
    ],
  },
]

export default function PrivacyPage() {
  const [showForm, setShowForm] = useState(false)

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
                Политика конфиденциальности и <span className="text-primary-300">обработки персональных данных</span>
              </h1>
              <p className="text-xl md:text-2xl text-primary-100">
                Защита ваших персональных данных — наш приоритет
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-12">
            {sections.map((section, index) => {
              const Icon = section.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-8 border-2 border-primary-100"
                >
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="bg-primary-100 p-3 rounded-xl">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                  <div className="space-y-3 text-gray-700">
                    {section.content.map((paragraph, pIndex) => (
                      <p key={pIndex} className="leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="max-w-4xl mx-auto mt-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-2xl p-8 text-white text-center"
          >
            <h3 className="text-3xl font-bold mb-4">Остались вопросы?</h3>
            <p className="text-xl text-primary-100 mb-6">
              Свяжитесь с нами, и мы ответим на все ваши вопросы о защите персональных данных
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-50 transition shadow-lg"
            >
              Написать нам
            </motion.button>
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

