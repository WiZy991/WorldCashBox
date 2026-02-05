'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ShoppingCart, 
  ArrowLeft, 
  Check, 
  Star,
  Package,
  Truck,
  Shield,
  RotateCw
} from 'lucide-react'
import { Product, categories } from '@/data/products'
import { loadProducts } from '@/lib/products'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import RequestForm from '@/components/RequestForm'

const categoryIcons: Record<string, string> = {
  equipment: '',
  software: '',
  consumables: '',
  video: '',
  services: '',
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const { addToCart } = useCart()
  const { showToast } = useToast()

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const products = await loadProducts()
        const foundProduct = products.find(p => p.id === productId)
        if (foundProduct) {
          setProduct(foundProduct)
        } else {
          // Товар не найден
          setProduct(null)
        }
      } catch (error) {
        console.error('Error loading product:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      loadProduct()
    }
  }, [productId])

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 1, (message) => {
        showToast(message, 3000)
      })
    }
  }

  const handleOrder = () => {
    setShowForm(true)
  }

  // Получаем все изображения товара
  // Объединяем все изображения: сначала основное (image), затем остальные из массива images
  const allImages = product 
    ? (() => {
        const images: string[] = []
        // Добавляем основное изображение первым, если оно есть
        if (product.image) {
          images.push(product.image)
        }
        // Добавляем остальные изображения из массива, исключая дубликаты
        if (product.images && product.images.length > 0) {
          product.images.forEach(img => {
            if (img && !images.includes(img)) {
              images.push(img)
            }
          })
        }
        return images
      })()
    : []

  const currentImage = allImages[selectedImageIndex] || allImages[0] || ''

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Загрузка товара...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Товар не найден</h1>
          <p className="text-gray-600 mb-8">Товар с указанным ID не существует</p>
          <Link
            href="/catalog"
            className="inline-block bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition"
          >
            Вернуться в каталог
          </Link>
        </div>
      </div>
    )
  }

  const category = categories.find(c => c.id === product.category)

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/30">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center space-x-2 text-sm text-gray-600"
        >
          <Link href="/" className="hover:text-primary-600 transition">Главная</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-primary-600 transition">Каталог</Link>
          {category && (
            <>
              <span>/</span>
              <span className="text-gray-900">{category.name}</span>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-semibold">{product.name}</span>
        </motion.div>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="mb-6 flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Назад</span>
        </motion.button>

        {/* Product Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl opacity-20">
                  {categoryIcons[product.category] || '📦'}
                </div>
              )}
            </div>

            {/* Thumbnails - показываем всегда, если есть хотя бы одно изображение */}
            {allImages.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Всего изображений: {allImages.length}
                </p>
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition ${
                        selectedImageIndex === index
                          ? 'border-primary-600 ring-2 ring-primary-200 scale-105'
                          : 'border-gray-200 hover:border-primary-300 hover:scale-105'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - вид ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Category Badge */}
            {category && (
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{category.icon}</span>
                <span className="text-primary-600 font-semibold">{category.name}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              {product.name}
            </h1>

            {/* Price and Stock */}
            <div className="space-y-4">
              {product.price !== undefined && (
                <div className="text-5xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  {product.id === 'bitrix24' ? 'От ' : ''}{product.price.toLocaleString('ru-RU')} ₽
                </div>
              )}
              
              {/* Stock Status */}
              {/* Не показываем наличие для услуг */}
              {product.category !== 'services' && product.inStock !== undefined && (
                <div className="flex items-center space-x-4">
                  <div className={`px-4 py-2 rounded-xl font-semibold text-lg ${
                    product.inStock 
                      ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                      : 'bg-red-100 text-red-700 border-2 border-red-300'
                  }`}>
                    {product.inStock ? (
                      <>
                        <span className="flex items-center space-x-2">
                          <Check className="w-5 h-5" />
                          <span>
                            {product.stock !== undefined && product.stock > 0 
                              ? `В наличии: ${product.stock} шт.`
                              : 'В наличии'
                            }
                          </span>
                        </span>
                      </>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <span>✗</span>
                        <span>Нет в наличии</span>
                      </span>
                    )}
                  </div>
                  
                  {product.stockUpdatedAt && (
                    <span className="text-sm text-gray-500">
                      Обновлено: {new Date(product.stockUpdatedAt).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed">
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
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="bg-primary-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Особенности</h3>
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Характеристики</h3>
                <dl className="space-y-3">
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="flex flex-col sm:flex-row sm:items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                    >
                      <dt className="font-semibold text-gray-700 sm:w-1/3 mb-1 sm:mb-0">{key}:</dt>
                      <dd className="text-gray-600 sm:w-2/3">{value}</dd>
                    </motion.div>
                  ))}
                </dl>
              </div>
            )}

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 text-center">
                <Package className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">Оригинальная продукция</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 text-center">
                <Truck className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">Быстрая доставка</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 text-center">
                <Shield className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">Гарантия качества</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOrder}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
              >
                <span>Заказать</span>
                <Star className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="px-6 bg-white border-2 border-primary-600 text-primary-600 py-4 rounded-xl font-bold hover:bg-primary-50 transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>В корзину</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Request Form Modal */}
      {showForm && product && (
        <RequestForm
          product={product}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
