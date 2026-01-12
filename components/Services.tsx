'use client'

import { motion } from 'framer-motion'
import { Settings, Code, Wrench, Shield } from 'lucide-react'

const services = [
  {
    icon: Settings,
    title: 'Настройка оборудования',
    description: 'Профессиональная настройка и конфигурация POS-систем под ваши задачи',
  },
  {
    icon: Code,
    title: 'Интеграция систем',
    description: 'Подключение касс к товароучетным программам и внешним сервисам',
  },
  {
    icon: Wrench,
    title: 'Техническая поддержка',
    description: 'Круглосуточная поддержка и обслуживание вашего оборудования',
  },
  {
    icon: Shield,
    title: 'Маркировка товаров',
    description: 'Регистрация в системе "Честный знак" и ЕГАИС под ключ',
  },
]

export default function Services() {
  const iconGradients = [
    'from-primary-500 to-primary-400',
    'from-primary-600 to-primary-500',
    'from-primary-400 to-primary-300',
    'from-primary-500 to-primary-600',
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/30 relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-6xl inline-block mb-6"
          >
            
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              Наши услуги
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600">
            Комплексные решения для автоматизации вашего бизнеса
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, type: "spring" }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-transparent shadow-lg hover:shadow-2xl transition-all overflow-hidden"
            >
              {/* Градиентный фон при наведении */}
              <div className={`absolute inset-0 bg-gradient-to-br ${iconGradients[index]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              {/* Иконка */}
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className={`relative w-20 h-20 bg-gradient-to-br ${iconGradients[index]} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all`}
              >
                <service.icon className="w-10 h-10 text-white" />
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>
              
              <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary-600 group-hover:to-primary-500 group-hover:bg-clip-text transition-all">
                {service.title}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">{service.description}</p>
              
              {/* Декоративный элемент */}
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-primary-100/50 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

