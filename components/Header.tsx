'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingCart, Phone } from 'lucide-react'
import { useAssistant } from '@/contexts/AssistantContext'
import { useCart } from '@/contexts/CartContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCatalogOpen, setIsCatalogOpen] = useState(false)
  const [isBusinessOpen, setIsBusinessOpen] = useState(false)
  const [catalogTimeout, setCatalogTimeout] = useState<NodeJS.Timeout | null>(null)
  const [businessTimeout, setBusinessTimeout] = useState<NodeJS.Timeout | null>(null)
  const { openAssistant } = useAssistant()
  const { totalItems, toggleCart } = useCart()

  const handleCatalogMouseEnter = () => {
    if (catalogTimeout) {
      clearTimeout(catalogTimeout)
      setCatalogTimeout(null)
    }
    setIsCatalogOpen(true)
  }

  const handleCatalogMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsCatalogOpen(false)
    }, 200) // Задержка 200ms перед закрытием
    setCatalogTimeout(timeout)
  }

  const handleBusinessMouseEnter = () => {
    if (businessTimeout) {
      clearTimeout(businessTimeout)
      setBusinessTimeout(null)
    }
    setIsBusinessOpen(true)
  }

  const handleBusinessMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsBusinessOpen(false)
    }, 200) // Задержка 200ms перед закрытием
    setBusinessTimeout(timeout)
  }

  return (
    <header className="bg-white shadow-md sticky top-0" style={{ zIndex: 1000, position: 'sticky' }}>
      <div className="container mx-auto px-4 relative" style={{ zIndex: 1001 }}>
        <div className="flex items-center justify-between h-20 relative" style={{ zIndex: 1002 }}>
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary-600">
              World<span className="text-primary-800">Cashbox</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 relative" style={{ zIndex: 1003 }}>
            <Link href="/about" className="text-gray-700 hover:text-primary-600 transition">
              О нас
            </Link>
            <div 
              className="relative"
              onMouseEnter={handleCatalogMouseEnter}
              onMouseLeave={handleCatalogMouseLeave}
            >
              <button 
                className={`text-gray-700 hover:text-primary-600 transition-colors duration-200 flex items-center ${isCatalogOpen ? 'text-primary-600' : ''}`}
                onClick={() => setIsCatalogOpen(!isCatalogOpen)}
              >
                Каталог
                <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isCatalogOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isCatalogOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200"
                  onMouseEnter={handleCatalogMouseEnter}
                  onMouseLeave={handleCatalogMouseLeave}
                  style={{ 
                    zIndex: 99999,
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.5rem',
                    opacity: 1,
                    visibility: 'visible',
                    transform: 'translateY(0)',
                    pointerEvents: 'auto',
                    minWidth: '240px',
                    width: 'max-content',
                    maxWidth: '320px',
                    padding: '0.5rem 0'
                  }}
                >
                <Link 
                  href="/oborudovaniekatalog" 
                  className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-150 whitespace-nowrap"
                  onClick={() => setIsCatalogOpen(false)}
                >
                  Оборудование
                </Link>
                <Link 
                  href="/catalog/raskhodnyematerialy" 
                  className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-150 whitespace-nowrap"
                  onClick={() => setIsCatalogOpen(false)}
                >
                  Расходные материалы
                </Link>
                <Link 
                  href="/videonabludenie" 
                  className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-150 whitespace-nowrap"
                  onClick={() => setIsCatalogOpen(false)}
                >
                  Видеонаблюдение
                </Link>
                <Link 
                  href="/programmnoeobespechenie" 
                  className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-150 whitespace-nowrap"
                  onClick={() => setIsCatalogOpen(false)}
                >
                  Программное обеспечение
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <Link 
                  href="/catalog" 
                  className="block px-4 py-3 text-primary-600 font-semibold hover:bg-primary-50 transition-colors duration-150 whitespace-nowrap"
                  onClick={() => setIsCatalogOpen(false)}
                >
                  Все категории
                </Link>
                </div>
              )}
            </div>
            <div 
              className="relative"
              onMouseEnter={handleBusinessMouseEnter}
              onMouseLeave={handleBusinessMouseLeave}
            >
              <button 
                className={`text-gray-700 hover:text-primary-600 transition-colors duration-200 flex items-center ${isBusinessOpen ? 'text-primary-600' : ''}`}
                onClick={() => setIsBusinessOpen(!isBusinessOpen)}
              >
                Бизнес
                <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isBusinessOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isBusinessOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200"
                  onMouseEnter={handleBusinessMouseEnter}
                  onMouseLeave={handleBusinessMouseLeave}
                  style={{ 
                    zIndex: 99999,
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.5rem',
                    opacity: 1,
                    visibility: 'visible',
                    transform: 'translateY(0)',
                    pointerEvents: 'auto',
                    minWidth: '200px',
                    width: 'max-content',
                    maxWidth: '280px',
                    padding: '0.5rem 0'
                  }}
                >
                <Link 
                  href="/business/restaurant" 
                  className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-150 whitespace-nowrap"
                  onClick={() => setIsBusinessOpen(false)}
                >
                  Общепит
                </Link>
                <Link 
                  href="/business/retail" 
                  className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-150 whitespace-nowrap"
                  onClick={() => setIsBusinessOpen(false)}
                >
                  Розничная торговля
                </Link>
                <Link 
                  href="/business/services" 
                  className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-150 whitespace-nowrap"
                  onClick={() => setIsBusinessOpen(false)}
                >
                  Услуги
                </Link>
                <Link 
                  href="/avtomatizatsciaobshepita" 
                  className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-150 whitespace-nowrap"
                  onClick={() => setIsBusinessOpen(false)}
                >
                  Автоматизация общепита
                </Link>
                </div>
              )}
            </div>
            <Link href="/spisokuslug" className="text-gray-700 hover:text-primary-600 transition">
              Услуги
            </Link>
            <Link href="/contacts" className="text-gray-700 hover:text-primary-600 transition">
              Контакты
            </Link>
            <Link href="/promotions" className="text-gray-700 hover:text-primary-600 transition">
              Акции
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <a href="tel:+74232799759" className="hidden md:flex items-center space-x-2 text-primary-600 hover:text-primary-700">
              <Phone className="w-5 h-5" />
              <span className="font-semibold">+7 (423) 2-799-759</span>
            </a>
            <button
              onClick={toggleCart}
              className="relative bg-white border-2 border-primary-600 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition font-semibold flex items-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              <span className="hidden md:inline">Корзина</span>
            </button>
            <button
              onClick={() => openAssistant(true)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Связаться
            </button>
            <button
              className="md:hidden text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t space-y-1">
            <Link href="/about" className="block py-2 text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>О нас</Link>
            <div className="py-2">
              <div className="text-sm font-semibold text-gray-500 mb-1">Каталог</div>
              <Link href="/oborudovaniekatalog" className="block py-1.5 pl-4 text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Оборудование</Link>
              <Link href="/catalog/raskhodnyematerialy" className="block py-1.5 pl-4 text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Расходные материалы</Link>
              <Link href="/videonabludenie" className="block py-1.5 pl-4 text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Видеонаблюдение</Link>
              <Link href="/programmnoeobespechenie" className="block py-1.5 pl-4 text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Программное обеспечение</Link>
              <Link href="/catalog" className="block py-1.5 pl-4 text-primary-600 font-semibold" onClick={() => setIsMenuOpen(false)}>Все категории</Link>
            </div>
            <div className="py-2">
              <div className="text-sm font-semibold text-gray-500 mb-1">Бизнес</div>
              <Link href="/business/restaurant" className="block py-1.5 pl-4 text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Общепит</Link>
              <Link href="/business/retail" className="block py-1.5 pl-4 text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Розничная торговля</Link>
              <Link href="/business/services" className="block py-1.5 pl-4 text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Услуги</Link>
              <Link href="/avtomatizatsciaobshepita" className="block py-1.5 pl-4 text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Автоматизация общепита</Link>
            </div>
            <Link href="/spisokuslug" className="block py-2 text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Услуги</Link>
            <Link href="/contacts" className="block py-2 text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Контакты</Link>
            <Link href="/promotions" className="block py-2 text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Акции</Link>
          </nav>
        )}
      </div>
    </header>
  )
}

