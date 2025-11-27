'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const news = [
  {
    id: 1,
    title: 'Эвотор 6 всего за 100 рублей!',
    date: '2024-01-15',
    category: 'Акция',
  },
  {
    id: 2,
    title: 'Фискальный накопитель на 15 месяцев за 6 000 рублей!',
    date: '2024-01-10',
    category: 'Акция',
  },
  {
    id: 3,
    title: 'Эвотор 7.3 за 3 000 рублей!',
    date: '2024-01-05',
    category: 'Акция',
  },
]

export default function News() {
  const gradients = [
    'from-orange-500 to-red-500',
    'from-primary-500 to-primary-600',
    'from-primary-600 to-primary-500',
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-white via-primary-50/20 to-primary-100/20 relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-center md:text-left mb-6 md:mb-0"
          >
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-6xl inline-block mb-4"
            >
              📰
            </motion.span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                Новости
              </span>
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              href="/promotions"
              className="group inline-flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105"
            >
              <span>Больше новостей</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, type: "spring" }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-transparent shadow-lg hover:shadow-2xl transition-all overflow-hidden"
            >
              {/* Градиентный фон */}
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${gradients[index]} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              
              {/* Бейдж категории */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`inline-block mb-4 px-4 py-2 bg-gradient-to-r ${gradients[index]} text-white rounded-full text-sm font-bold shadow-md`}
              >
                {item.category}
              </motion.div>
              
              <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary-600 group-hover:to-primary-500 group-hover:bg-clip-text transition-all leading-tight">
                {item.title}
              </h3>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>📅</span>
                <span>{new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              
              {/* Декоративный элемент */}
              <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl ${gradients[index]} opacity-0 group-hover:opacity-5 rounded-tl-full transition-opacity`}></div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

