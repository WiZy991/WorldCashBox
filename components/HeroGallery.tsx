'use client'

import { motion } from 'framer-motion'

const images = [
  '/images/hero/WhatsApp Image 2025-11-24 at 15.39.07 (2).jpeg',
  '/images/hero/WhatsApp Image 2025-11-24 at 15.39.07 (3).jpeg',
  '/images/hero/WhatsApp Image 2025-11-24 at 15.39.08 (3).jpeg',
]

export default function HeroGallery() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {images.map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl group"
            >
              <img
                src={src}
                alt={`Галерея ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
