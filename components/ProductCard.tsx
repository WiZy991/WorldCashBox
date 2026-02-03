'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Sparkles, ArrowRight, RotateCw } from 'lucide-react'
import Link from 'next/link'
import { Product } from '@/data/products'
import { useState, useRef, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'

interface ProductCardProps {
  product: Product
  onSelect?: () => void
  addToCartMode?: boolean
}

const categoryIcons: Record<string, string> = {
  equipment: '🖥️',
  software: '💾',
  consumables: '📄',
  video: '📹',
  services: '🔧',
}

const categoryGradients: Record<string, string> = {
  equipment: 'from-primary-500 to-primary-400',
  software: 'from-primary-600 to-primary-500',
  consumables: 'from-primary-400 to-primary-300',
  video: 'from-primary-500 to-primary-600',
  services: 'from-primary-600 to-primary-400',
}

// Генерируем изображения для разных ракурсов, если их нет
const generateImageViews = (image?: string): string[] => {
  if (!image) return []
  
  // Если изображение уже имеет параметры, используем его как есть
  // Для 3D эффекта создаем варианты с небольшими изменениями параметров
  const hasParams = image.includes('?')
  
  if (hasParams) {
    // Если есть параметры, добавляем варианты с разными параметрами
    const baseUrl = image.split('?')[0]
    const existingParams = image.split('?')[1] || ''
    
    return [
      image, // Оригинальное изображение
      `${baseUrl}?${existingParams}&auto=format`, // С авто-форматом
      `${baseUrl}?${existingParams}&sharp=2`, // С улучшенной резкостью
    ]
  } else {
    // Если нет параметров, добавляем базовые
    return [
      `${image}?w=600&h=400&fit=crop&q=80`,
      `${image}?w=600&h=400&fit=crop&q=80&auto=format`,
      `${image}?w=600&h=400&fit=crop&q=80&sharp=2`,
    ]
  }
}

export default function ProductCard({ product, onSelect, addToCartMode = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const { addToCart } = useCart()
  const { showToast } = useToast()

  // Получаем массив изображений для 3D эффекта
  const images = product.images && product.images.length > 0 
    ? product.images 
    : (product.image ? generateImageViews(product.image) : [])
  
  // Определяем текущее изображение для отображения - приоритет product.image
  const currentImage = product.image || (images.length > 0 ? (images[currentImageIndex] || images[0]) : '')

  // Проверяем наличие изображения - учитываем ошибки загрузки
  // Поддерживаем как http/https URLs, так и локальные пути
  const hasImage = !!(currentImage && currentImage.trim() && (currentImage.startsWith('http') || currentImage.startsWith('/')) && !imageError)

  // Обработка движения мыши для 3D эффекта
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return
    
    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const relativeX = (x - centerX) / centerX // -1 до 1
    const relativeY = (y - centerY) / centerY // -1 до 1
    
    setMousePosition({ x: relativeX, y: relativeY })
    
    // Переключаем изображение в зависимости от позиции мыши (имитация разных ракурсов)
    if (images.length > 1) {
      const imageCount = images.length
      const normalizedX = (relativeX + 1) / 2 // 0 до 1
      const newIndex = Math.floor(normalizedX * imageCount)
      const clampedIndex = Math.max(0, Math.min(imageCount - 1, newIndex))
      if (clampedIndex !== currentImageIndex) {
        setCurrentImageIndex(clampedIndex)
      }
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setMousePosition({ x: 0, y: 0 })
    setCurrentImageIndex(0) // Возвращаем к исходному изображению
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1, (message) => {
      showToast(message, 3000)
    })
  }

  const handleOrderClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onSelect) {
      onSelect()
    }
  }

  // Вычисляем 3D трансформацию
  const rotateX = mousePosition.y * 15 // Наклон по Y
  const rotateY = mousePosition.x * 15 // Поворот по X
  const scale = isHovered ? 1.05 : 1

  return (
    <Link href={`/products/${product.id}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -10, scale: 1.02 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={handleMouseLeave}
        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 cursor-pointer"
      >
      {/* Градиентный фон при наведении */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradients[product.category]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
      
      {/* Блестящий эффект */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        initial={false}
        animate={{
          background: isHovered
            ? 'linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)'
            : 'transparent',
        }}
        transition={{ duration: 0.6 }}
        style={{
          backgroundPosition: isHovered ? '200% 0' : '-200% 0',
        }}
      />

      {/* Интерактивное изображение с 3D эффектом */}
      <div 
        ref={imageContainerRef}
        onMouseMove={handleMouseMove}
        className={`relative aspect-square bg-gradient-to-br ${categoryGradients[product.category]} flex items-center justify-center overflow-hidden`}
      >
        {hasImage && currentImage && !imageError ? (
          <motion.div
            style={{
              transformStyle: 'preserve-3d',
              transform: `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
              transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
            }}
            className="w-full h-full relative"
          >
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-contain pointer-events-none select-none"
              style={{ 
                objectFit: 'contain', 
                display: 'block', 
                width: '100%', 
                height: '100%',
                maxWidth: '100%',
                maxHeight: '100%',
                userSelect: 'none',
                backgroundColor: 'transparent'
              } as React.CSSProperties}
              onError={(e) => {
                // Если изображение не загрузилось, логируем ошибку и показываем fallback
                console.warn('❌ Изображение не загрузилось:', currentImage, 'для товара:', product.name)
                setImageError(true)
                setImageLoaded(false)
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
              onLoad={() => {
                // Изображение успешно загружено
                setImageLoaded(true)
                setImageError(false)
                console.log('✓ Изображение загружено:', product.name, currentImage)
              }}
              loading="lazy"
              decoding="async"
            />
            {/* Наложение для более реалистичного 3D эффекта */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity"
              style={{
                background: `linear-gradient(${45 + rotateY * 10}deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)`
              }}
            />
          </motion.div>
        ) : (
          // Fallback на иконку, если нет изображения или произошла ошибка загрузки
          <motion.div
            className="text-8xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 flex items-center justify-center"
            animate={isHovered ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              transformStyle: 'preserve-3d',
              transform: `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`,
            }}
          >
            {categoryIcons[product.category]}
            {imageError && (
              <div className="absolute bottom-2 left-2 right-2 text-xs text-gray-500 text-center opacity-50">
                Изображение недоступно
              </div>
            )}
          </motion.div>
        )}
        
        {/* Индикатор 3D просмотра */}
        {hasImage && images.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-2 z-10"
          >
            <RotateCw className="w-3 h-3" />
            <span>Поверните для просмотра</span>
          </motion.div>
        )}
        
        {/* Бейдж наличия товара в верхней части */}
        {product.inStock !== undefined && (
          <div className="absolute top-4 left-4 z-10">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg ${
                product.inStock ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {product.inStock ? (
                product.stock !== undefined && product.stock > 0 ? (
                  `✓ В наличии (${product.stock})`
                ) : (
                  '✓ В наличии'
                )
              ) : (
                '✗ Нет в наличии'
              )}
            </span>
          </div>
        )}

        {/* Декоративные элементы */}
        <div className="absolute top-4 right-4">
          <motion.div
            animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1 }}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
        </div>

        {/* Градиентная полоса внизу */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      </div>
      
      <div className="p-6 relative z-10">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.id === 'bitrix24' ? (
            <>
              CRM система для управления бизнесом.{' '}
              <a 
                href="https://worldcashbox24.ru" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline font-semibold"
              >
                Подробнее на worldcashbox24.ru
              </a>
            </>
          ) : (
            product.description
          )}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          {product.price !== undefined && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            >
              {product.id === 'bitrix24' ? 'От ' : ''}{product.price.toLocaleString('ru-RU')} ₽
            </motion.div>
          )}
          {/* Индикатор наличия товара */}
          {product.inStock !== undefined && (
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              product.inStock 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              {product.inStock ? (
                product.stock !== undefined && product.stock > 0 ? (
                  `✓ В наличии (${product.stock})`
                ) : (
                  '✓ В наличии'
                )
              ) : (
                '✗ Нет в наличии'
              )}
            </div>
          )}
        </div>

        <div className="space-y-2 mb-6">
          {product.features.slice(0, 2).map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center text-sm text-gray-600 group-hover:text-gray-700"
            >
              <motion.div
                whileHover={{ scale: 1.5 }}
                className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mr-3"
              ></motion.div>
              {feature}
            </motion.div>
          ))}
        </div>

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {onSelect && (
            <motion.button
              onClick={handleOrderClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white py-4 rounded-xl font-bold hover:from-primary-700 hover:to-primary-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl group/btn"
            >
              <span>Заказать</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </motion.button>
          )}
          <motion.button
            onClick={handleAddToCart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={onSelect ? "px-4 bg-white border-2 border-primary-600 text-primary-600 py-4 rounded-xl font-bold hover:bg-primary-50 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl group/btn" : "w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-4 rounded-xl font-bold hover:from-primary-700 hover:to-primary-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl group/btn"}
            title="Добавить в корзину"
          >
            <ShoppingCart className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
            {!onSelect && <span>В корзину</span>}
          </motion.button>
        </div>
      </div>

      {/* Декоративные углы */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary-500/20 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-primary-500/20 rounded-br-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </motion.div>
    </Link>
  )
}
