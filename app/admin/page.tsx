'use client'

import { useEffect, useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Package, Tag, TrendingUp, Users } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    promotions: 0,
    totalViews: 0,
    activeUsers: 0,
  })

  useEffect(() => {
    // Загружаем статистику
    Promise.all([
      fetch('/api/admin/products').then(r => r.json()),
      fetch('/api/admin/promotions').then(r => r.json()),
    ]).then(([productsRes, promotionsRes]) => {
      setStats({
        products: productsRes.products?.length || 0,
        promotions: promotionsRes.promotions?.length || 0,
        totalViews: 0, // Можно добавить аналитику
        activeUsers: 0, // Можно добавить аналитику
      })
    })
  }, [])

  const statCards = [
    { label: 'Товары', value: stats.products, icon: Package, color: 'bg-blue-500' },
    { label: 'Акции', value: stats.promotions, icon: Tag, color: 'bg-green-500' },
    { label: 'Просмотры', value: stats.totalViews, icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Пользователи', value: stats.activeUsers, icon: Users, color: 'bg-orange-500' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Дашборд</h1>
          <p className="text-gray-600 mt-2">Добро пожаловать в админ-панель</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Быстрые действия</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/products"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
            >
              <Package className="w-6 h-6 text-primary-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Добавить товар</h3>
              <p className="text-sm text-gray-600 mt-1">Создать новый товар в каталоге</p>
            </a>
            <a
              href="/admin/promotions"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
            >
              <Tag className="w-6 h-6 text-primary-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Создать акцию</h3>
              <p className="text-sm text-gray-600 mt-1">Добавить новую акцию или предложение</p>
            </a>
            <a
              href="/admin/images"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
            >
              <Package className="w-6 h-6 text-primary-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Загрузить изображение</h3>
              <p className="text-sm text-gray-600 mt-1">Добавить изображение для товаров</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}


