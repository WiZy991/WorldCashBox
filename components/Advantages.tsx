'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Users, Award, Headphones } from 'lucide-react'

const advantages = [
  {
    icon: Users,
    title: 'Опыт работы с крупными компаниями',
    description: 'Более 10 лет на рынке автоматизации бизнеса',
  },
  {
    icon: Award,
    title: 'Официальный партнер',
    description: 'Представляем ведущие бренды оборудования и ПО',
  },
  {
    icon: CheckCircle,
    title: 'Решаем все в одном окне',
    description: 'От подбора до настройки и интеграции',
  },
  {
    icon: Headphones,
    title: 'Техническая поддержка',
    description: 'Круглосуточная поддержка вашего бизнеса',
  },
]

export default function Advantages() {
  return (
    <section className="py-20 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-6xl inline-block mb-6"
          >
            
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              Почему выбирают нас
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, type: "spring" }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="text-center group"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="relative w-28 h-28 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <advantage.icon className="w-14 h-14 text-white relative z-10" />
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>
              <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary-600 group-hover:to-primary-500 group-hover:bg-clip-text transition-all">
                {advantage.title}
              </h3>
              <p className="text-gray-600 text-lg">{advantage.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

