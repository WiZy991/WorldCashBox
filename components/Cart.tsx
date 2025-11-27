'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import RequestForm from './RequestForm'
import { useState } from 'react'

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice, isOpen, closeCart, clearCart } = useCart()
  const [showOrderForm, setShowOrderForm] = useState(false)

  const handleOrder = () => {
    setShowOrderForm(true)
    closeCart()
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Корзина {totalItems > 0 && `(${totalItems})`}
                  </h2>
                </div>
                <button
                  onClick={closeCart}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Корзина пуста</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <motion.div
                        key={item.product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.product.image ? (
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingCart className="w-8 h-8 text-primary-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {item.product.description}
                          </p>
                          <p className="text-lg font-bold text-primary-600 mt-1">
                            {item.product.price ? `${(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t p-6 space-y-4">
                  <div className="flex items-center justify-between text-xl font-bold">
                    <span>Итого:</span>
                    <span className="text-primary-600">
                      {totalPrice.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={clearCart}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                    >
                      Очистить
                    </button>
                    <button
                      onClick={handleOrder}
                      className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition"
                    >
                      Оформить заказ
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showOrderForm && (
        <RequestForm
          cartItems={items}
          onClose={() => {
            setShowOrderForm(false)
            clearCart()
          }}
        />
      )}
    </>
  )
}

