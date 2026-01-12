'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface PartnerInfo {
  name: string
  color: string
  hoverColor: string
  textColor: string
  logo?: string
}

const partnersData: PartnerInfo[] = [
  {
    name: 'Эвотор',
    color: '#FF6B35',
    hoverColor: '#FF8555',
    textColor: '#FF6B35',
    logo: '/images/products/resources_logos/эвотор.png',
  },
  {
    name: 'АТОЛ',
    color: '#DC2626',
    hoverColor: '#EF4444',
    textColor: '#DC2626',
    logo: '/images/products/resources_logos/атол.png',
  },
  {
    name: 'POSCenter',
    color: '#6B46C1',
    hoverColor: '#7C3AED',
    textColor: '#6B46C1',
    logo: '/images/products/resources_logos/poscenter.png',
  },
  {
    name: 'iiko',
    color: '#FF6B35',
    hoverColor: '#FF8555',
    textColor: '#FF6B35',
    logo: '/images/products/resources_logos/iiko.png',
  },
  {
    name: 'Битрикс24',
    color: '#0066FF',
    hoverColor: '#3385FF',
    textColor: '#0066FF',
    logo: '/images/products/resources_logos/bitrix_24.jpg',
  },
  {
    name: 'Mindeo',
    color: '#4F46E5',
    hoverColor: '#6366F1',
    textColor: '#4F46E5',
    logo: '/images/products/resources_logos/mindeo.png',
  },
]

export default function Partners() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

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
          {partnersData.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring" }}
              whileHover={{ y: -8, scale: 1.05 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 overflow-hidden cursor-pointer"
              style={{
                borderColor: hoveredIndex === index ? partner.color : undefined,
              }}
            >
              {/* Градиентный фон при наведении с фирменным цветом */}
              <motion.div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background: hoveredIndex === index
                    ? `linear-gradient(135deg, ${partner.color}15, ${partner.hoverColor}25)`
                    : 'transparent',
                  opacity: hoveredIndex === index ? 1 : 0,
                }}
              />
              
              {/* Контент карточки */}
              <div className="relative z-10 flex flex-col items-center justify-center h-20">
                {hoveredIndex === index ? (
                  <>
                    {/* Пытаемся показать логотип при наведении */}
                    {partner.logo && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="mb-2 h-12 flex items-center justify-center"
                      >
                        <img
                          src={partner.logo}
                          alt={`${partner.name} logo`}
                          className="h-full w-auto object-contain max-w-[120px]"
                          onError={(e) => {
                            // Если логотип не найден, скрываем элемент
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      </motion.div>
                    )}
                    <motion.span
                      initial={{ opacity: hoveredIndex === index ? 0 : 1 }}
                      animate={{ opacity: 1 }}
                      className="text-lg md:text-xl font-bold transition-colors duration-300 text-center"
                      style={{ color: partner.color }}
                    >
                      {partner.name}
                    </motion.span>
                  </>
                ) : (
                  <motion.span
                    className="text-xl md:text-2xl font-bold text-gray-800 transition-colors duration-300 text-center"
                  >
                    {partner.name}
                  </motion.span>
                )}
              </div>
              
              {/* Декоративные углы с фирменным цветом */}
              <div
                className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-2xl transition-all duration-300"
                style={{
                  borderColor: hoveredIndex === index ? partner.color : 'transparent',
                }}
              />
              <div
                className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-2xl transition-all duration-300"
                style={{
                  borderColor: hoveredIndex === index ? partner.color : 'transparent',
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

