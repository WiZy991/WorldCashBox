'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Image as ImageIcon, 
  LogOut,
  Settings
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const menuItems = [
    { href: '/admin', label: 'Дашборд', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Товары', icon: Package },
    { href: '/admin/promotions', label: 'Акции', icon: Tag },
    { href: '/admin/images', label: 'Изображения', icon: ImageIcon },
  ]

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Админ-панель</h1>
        <p className="text-gray-400 text-sm">WorldCashBox</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 5 }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <button
        onClick={logout}
        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors w-full"
      >
        <LogOut className="w-5 h-5" />
        <span>Выйти</span>
      </button>
    </div>
  )
}



