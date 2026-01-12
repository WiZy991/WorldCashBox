import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">
              World<span className="text-primary-400">Cashbox</span>
            </h3>
            <p className="text-gray-400">
              Автоматизация бизнес-процессов. Современные решения для вашего бизнеса.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Компания</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-white transition">О нас</Link></li>
              <li><Link href="/services" className="hover:text-white transition">Услуги</Link></li>
              <li><Link href="/contacts" className="hover:text-white transition">Контакты</Link></li>
              <li><Link href="/promotions" className="hover:text-white transition">Акции</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Решения</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/business/restaurant" className="hover:text-white transition">Общепит</Link></li>
              <li><Link href="/business/services" className="hover:text-white transition">Услуги</Link></li>
              <li><Link href="/business/retail" className="hover:text-white transition">Розничная торговля</Link></li>
              <li><Link href="/catalog" className="hover:text-white transition">Каталог</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+74232799759" className="hover:text-white transition">+7 (423) 2-799-759</a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:vl@worldcashbox.ru" className="hover:text-white transition">vl@worldcashbox.ru</a>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1" />
                <span>г. Владивосток, ул. Толстого 32а, офис 308</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2026 WorldCashbox. Все права защищены.</p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-end mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition">
              Политика конфиденциальности и обработки персональных данных
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

