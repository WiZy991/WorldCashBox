'use client'

import { motion } from 'framer-motion'

const partners = [
  'Эвотор',
  'АТОЛ',
  'POSCenter',
  'iiko',
  'Битрикс24',
  'Mindeo',
]

export default function Partners() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-primary-50/30 relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      
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
            🤝
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              Официально представляем
            </span>
            <br />
            <span className="text-gray-900">ведущие бренды</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, index) => (
            <motion.div
              key={partner}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring" }}
              whileHover={{ y: -8, scale: 1.05 }}
              className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-blue-200 overflow-hidden"
            >
              {/* Градиентный фон при наведении */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10 flex items-center justify-center h-20">
                <span className="text-xl md:text-2xl font-bold text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary-600 group-hover:to-primary-500 group-hover:bg-clip-text transition-all">
                  {partner}
                </span>
              </div>
              
              {/* Декоративные углы */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary-300/0 group-hover:border-primary-500 rounded-tl-2xl transition-all"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary-300/0 group-hover:border-primary-500 rounded-br-2xl transition-all"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

