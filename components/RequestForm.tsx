'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, CheckCircle } from 'lucide-react'
import { Product } from '@/data/products'
import { submitToSBIS } from '@/lib/sbis'
import { formatPhoneNumber, getPhoneDigits } from '@/lib/phoneMask'
import { findCompanyByINN, validateINN, extractINN } from '@/lib/companySearch'

interface AssistantData {
  name?: string
  phone?: string
  email?: string
  company?: string
  selectedProducts?: string[]
  needs?: string[]
  size?: string
  budget?: string
}

interface CartItem {
  product: Product
  quantity: number
}

interface RequestFormProps {
  product?: Product
  cartItems?: CartItem[]
  onClose: () => void
  businessType?: string
  assistantData?: AssistantData
}

export default function RequestForm({ product, cartItems, onClose, businessType, assistantData }: RequestFormProps) {
  // Формируем список товаров для заявки
  const getProductsList = () => {
    if (cartItems && cartItems.length > 0) {
      return cartItems.map(item => `${item.product.name} (${item.quantity} шт.)`).join(', ')
    }
    if (product) {
      return product.name
    }
    if (assistantData?.selectedProducts) {
      return assistantData.selectedProducts.join(', ')
    }
    return ''
  }

  const getProductsMessage = () => {
    if (cartItems && cartItems.length > 0) {
      const itemsList = cartItems.map(item => 
        `- ${item.product.name} (${item.quantity} шт.)${item.product.price ? ` - ${(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽` : ''}`
      ).join('\n')
      return `Заявка из корзины:\n\nТовары:\n${itemsList}\n\nОбщая сумма: ${cartItems.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0).toLocaleString('ru-RU')} ₽`
    }
    if (assistantData) {
      return `Заявка от ассистента подбора:
Сфера бизнеса: ${businessType || 'Не указана'}
Потребности: ${assistantData.needs?.join(', ') || 'Не указаны'}
Масштаб: ${assistantData.size || 'Не указан'}
Бюджет: ${assistantData.budget || 'Не указан'}
Подобранные товары: ${assistantData.selectedProducts?.join(', ') || 'Не указаны'}`
    }
    return ''
  }

  const [formData, setFormData] = useState({
    name: assistantData?.name || '',
    phone: assistantData?.phone || '',
    email: assistantData?.email || '',
    company: assistantData?.company || '',
    message: getProductsMessage(),
    businessType: businessType || '',
    product: getProductsList(),
    additionalServices: assistantData?.needs || [] as string[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSearchingCompany, setIsSearchingCompany] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const companySearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSearchedINNRef = useRef<string>('') // Храним последний найденный ИНН

  // Определяем, является ли это упрощенной формой (для "Написать нам")
  const isSimpleForm = !product && (!cartItems || cartItems.length === 0) && !assistantData

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (companySearchTimeoutRef.current) {
        clearTimeout(companySearchTimeoutRef.current)
      }
    }
  }, [])

  const additionalServicesOptions = [
    'ЕГАИС',
    'Меркурий',
    'Маркировка',
    'Торги',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Проверяем согласие с политикой
    if (!privacyAccepted) {
      alert('Пожалуйста, примите политику обработки персональных данных.')
      setIsSubmitting(false)
      return
    }
    
    setIsSubmitting(true)

    try {
      // Формируем данные для отправки
      // Нормализуем телефон (убираем форматирование, оставляем только цифры)
      const phoneDigits = getPhoneDigits(formData.phone)
      const submitData = {
        ...formData,
        phone: phoneDigits, // Отправляем только цифры
        // Если это упрощенная форма, убеждаемся что есть сообщение
        message: isSimpleForm && !formData.message.trim() ? 'Заявка без указания сообщения' : formData.message,
        cartItems: cartItems?.map(item => ({
          product: {
            name: item.product.name,
            price: item.product.price,
          },
          quantity: item.quantity,
        })),
      }

      // Определяем, куда отправлять (Saby CRM или СБИС)
      const USE_SABY_CRM = process.env.NEXT_PUBLIC_USE_SABY_CRM === 'true'
      const API_ENDPOINT = USE_SABY_CRM ? '/api/saby/lead' : '/api/sbis/submit'

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: 'Неизвестная ошибка',
          details: `HTTP ${response.status} ${response.statusText}`
        }))
        const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}`
        const errorDetails = errorData.details ? `\nДетали: ${errorData.details}` : ''
        throw new Error(`${errorMessage}${errorDetails}`)
      }

      const result = await response.json()
      
      // Если есть предупреждение (например, использован fallback), показываем его
      if (result.warning) {
        console.warn('Предупреждение при отправке заявки:', result.warning)
      }
      
      setIsSuccess(true)
      setTimeout(() => {
        onClose()
        setIsSuccess(false)
        setFormData({
          name: '',
          phone: '',
          email: '',
          company: '',
          message: isSimpleForm ? '' : getProductsMessage(), // Для упрощенной формы очищаем
          businessType: businessType || '',
          product: product?.name || '',
          additionalServices: [],
        })
        setPrivacyAccepted(false) // Сбрасываем галочку
      }, 2000)
    } catch (error: any) {
      console.error('Ошибка отправки заявки:', error)
      alert(`Произошла ошибка при отправке заявки: ${error.message || 'Попробуйте позже или свяжитесь с нами по телефону'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(service)
        ? prev.additionalServices.filter((s) => s !== service)
        : [...prev.additionalServices, service],
    }))
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isSuccess ? 'Заявка отправлена!' : isSimpleForm ? 'Написать нам' : cartItems && cartItems.length > 0 ? 'Заявка на товары из корзины' : assistantData ? 'Консультация менеджера' : 'Оставить заявку'}
              </h2>
              {cartItems && cartItems.length > 0 && !isSuccess && (
                <p className="text-sm text-gray-500 mt-1">В корзине {cartItems.length} {cartItems.length === 1 ? 'товар' : cartItems.length < 5 ? 'товара' : 'товаров'}</p>
              )}
              {assistantData && !isSuccess && !cartItems && (
                <p className="text-sm text-gray-500 mt-1">Ассистент собрал информацию, осталось оставить контакты</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {isSuccess ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <p className="text-xl text-gray-700 mb-2">Спасибо за вашу заявку!</p>
              <p className="text-gray-600 mb-4">
                Наш менеджер свяжется с вами в течение 15 минут для консультации.
              </p>
              {assistantData && (
                <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 mt-4 text-left">
                  <p className="text-sm font-semibold text-primary-700 mb-2">
                    📋 Информация передана менеджеру:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {assistantData.selectedProducts && assistantData.selectedProducts.length > 0 && (
                      <li>• Подобранные товары: {assistantData.selectedProducts.join(', ')}</li>
                    )}
                    {assistantData.needs && assistantData.needs.length > 0 && (
                      <li>• Потребности: {assistantData.needs.join(', ')}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {assistantData && (
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-300 rounded-xl p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">🤖</span>
                    <p className="text-sm font-bold text-primary-700">Заявка от ассистента-менеджера</p>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    {assistantData.selectedProducts && assistantData.selectedProducts.length > 0 && (
                      <div>• Подобранные товары: <span className="font-semibold">{assistantData.selectedProducts.length} шт.</span></div>
                    )}
                    {assistantData.needs && assistantData.needs.length > 0 && (
                      <div>• Потребности: <span className="font-semibold">{assistantData.needs.length} выбрано</span></div>
                    )}
                    {assistantData.size && (
                      <div>• Масштаб бизнеса: <span className="font-semibold">{assistantData.size}</span></div>
                    )}
                    {assistantData.budget && (
                      <div>• Бюджет: <span className="font-semibold">{assistantData.budget}</span></div>
                    )}
                  </div>
                </div>
              )}
              
              {cartItems && cartItems.length > 0 && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Товары в корзине:</p>
                  <ul className="space-y-1">
                    {cartItems.map((item, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        • {item.product.name} {item.quantity > 1 && `(×${item.quantity})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {product && !assistantData && !cartItems && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Выбранный товар:</p>
                  <p className="font-semibold text-primary-700">{product.name}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Иван Иванов"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value)
                      setFormData({ ...formData, phone: formatted })
                    }}
                    onBlur={(e) => {
                      // При потере фокуса нормализуем номер
                      const digits = getPhoneDigits(e.target.value)
                      if (digits.length >= 11) {
                        setFormData({ ...formData, phone: formatPhoneNumber(digits) })
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="+7 (999) 123-45-67"
                    maxLength={18}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="example@mail.ru"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Компания
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.company}
                      onChange={async (e) => {
                        const value = e.target.value
                        
                        // Очищаем предыдущий таймер
                        if (companySearchTimeoutRef.current) {
                          clearTimeout(companySearchTimeoutRef.current)
                        }
                        
                        // Извлекаем ИНН из введенного значения
                        const innDigits = extractINN(value)
                        
                        // Если введен ИНН (10 или 12 цифр), ищем компанию с задержкой
                        if (innDigits.length === 10 || innDigits.length === 12) {
                          // Если это тот же ИНН, который мы уже успешно нашли, не ищем снова
                          // Но если пользователь изменил значение, сбрасываем флаг
                          if (lastSearchedINNRef.current === innDigits && formData.company !== value) {
                            lastSearchedINNRef.current = ''
                          }
                          
                          if (lastSearchedINNRef.current === innDigits) {
                            // Уже искали этот ИНН и нашли - не ищем снова
                            return
                          }
                          
                          // Показываем ИНН во время поиска
                          setFormData({ ...formData, company: value })
                          setIsSearchingCompany(true)
                          
                          // Debounce: ждем 500ms после последнего ввода
                          companySearchTimeoutRef.current = setTimeout(async () => {
                            try {
                              console.log('Поиск компании по ИНН:', innDigits)
                              const companyData = await findCompanyByINN(innDigits)
                              console.log('Результат поиска:', companyData)
                              
                              if (companyData && companyData.name && companyData.name.trim() !== '') {
                                // Заменяем ИНН на название компании
                                console.log('Заменяем ИНН на название:', companyData.name)
                                setFormData((prev) => {
                                  lastSearchedINNRef.current = innDigits
                                  return { ...prev, company: companyData.name }
                                })
                              } else {
                                // Если компания не найдена, оставляем ИНН
                                console.warn('Компания не найдена для ИНН:', innDigits)
                                setFormData((prev) => ({ ...prev, company: value }))
                                lastSearchedINNRef.current = '' // Сбрасываем, чтобы можно было попробовать снова
                              }
                            } catch (error) {
                              console.error('Ошибка поиска компании:', error)
                              // При ошибке оставляем то, что ввел пользователь
                              setFormData((prev) => ({ ...prev, company: value }))
                              lastSearchedINNRef.current = '' // Сбрасываем при ошибке
                            } finally {
                              setIsSearchingCompany(false)
                            }
                          }, 500)
                        } else {
                          // Если это не ИНН, просто обновляем значение
                          setFormData({ ...formData, company: value })
                          setIsSearchingCompany(false)
                          lastSearchedINNRef.current = '' // Сбрасываем последний найденный ИНН
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Название компании или ИНН"
                    />
                    {isSearchingCompany && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Введите название компании или ИНН (10 или 12 цифр) для автоматического поиска
                  </p>
                </div>
              </div>

              {/* Для упрощенной формы показываем только сообщение */}
              {isSimpleForm ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Сообщение *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Опишите ваш вопрос или предложение..."
                  />
                </div>
              ) : (
                <>
                  {!product && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Сфера бизнеса
                      </label>
                      <select
                        value={formData.businessType}
                        onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Выберите сферу</option>
                        <option value="restaurant">Общепит</option>
                        <option value="retail">Розничная торговля</option>
                        <option value="services">Услуги</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Дополнительные услуги
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {additionalServicesOptions.map((service) => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => toggleService(service)}
                          className={`px-4 py-2 rounded-lg border transition ${
                            formData.additionalServices.includes(service)
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
                          }`}
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Сообщение
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Расскажите о ваших потребностях..."
                    />
                  </div>
                </>
              )}

              <div className="flex items-start space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  required
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-1 rounded text-primary-600 focus:ring-primary-500"
                />
                <span>
                  Нажимая на кнопку "{isSimpleForm ? 'Отправить сообщение' : 'Отправить заявку'}", вы соглашаетесь с{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    политикой обработки персональных данных
                  </a>
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !privacyAccepted}
                className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Отправка...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>{isSimpleForm ? 'Отправить сообщение' : 'Отправить заявку'}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

