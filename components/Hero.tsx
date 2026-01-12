'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Sparkles, Zap } from 'lucide-react'
import { useAssistant } from '@/contexts/AssistantContext'

export default function Hero() {
  const { openAssistant } = useAssistant()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden text-white">
      {/* Фоновые изображения */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 relative">
          <img 
            src="/images/hero/WhatsApp Image 2025-11-24 at 15.39.06 (1).jpeg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="flex-1 relative">
          <img 
            src="/images/hero/WhatsApp Image 2025-11-24 at 15.39.08 (2).jpeg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      </div>
      
      {/* Overlay для лучшей читаемости текста */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50"></div>

      {/* Плавающие элементы */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => {
          const randomX = Math.random() * 100
          const randomY = Math.random() * 100
          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              style={{
                left: `${randomX}%`,
                top: `${randomY}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          )
        })}
      </div>

      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center"
        >
          {/* Бейдж */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 mb-8"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-semibold">Инновационные решения для бизнеса</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-primary-200 to-primary-300 bg-clip-text text-transparent">
              Автоматизация
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary-200 via-primary-300 to-white bg-clip-text text-transparent">
              бизнес-процессов
            </span>
            <br />

          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl lg:text-3xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Современные решения для оптимизации и роста вашего бизнеса
            <span className="block mt-2 text-lg md:text-xl text-white/60">
              Индивидуальный подход • Полная интеграция • Техническая поддержка
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <motion.button
              onClick={() => openAssistant(true)}
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,255,255,0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="group relative bg-white text-primary-700 px-10 py-5 rounded-2xl font-bold text-lg flex items-center space-x-3 shadow-2xl overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative z-10 flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Получить консультацию</span>
                <ArrowRight className="w-5 h-5" />
              </span>
            </motion.button>
            <motion.a
              href="/catalog"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group glass border-2 border-white/30 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-md"
            >
              Смотреть каталог
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
          >
            {[
              { text: 'Индивидуальный подбор оборудования',},
              { text: 'Решаем все в режиме одного окна',},
              { text: 'Настройка и интеграция под ключ'},
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                  <span className="text-left font-medium">{item.text}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Скролл индикатор */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/50 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

