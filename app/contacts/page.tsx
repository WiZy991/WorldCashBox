'use client'

import { Phone, Mail, MapPin } from 'lucide-react'
import RequestForm from '@/components/RequestForm'
import { useState } from 'react'
import { useAssistant } from '@/contexts/AssistantContext'

export default function ContactsPage() {
  const [showForm, setShowForm] = useState(false)
  const { openAssistant } = useAssistant()

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">Контакты</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Свяжитесь с нами</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Телефон</h3>
                    <a href="tel:+74232799759" className="text-primary-600 hover:underline">
                      +7 (423) 2-799-759
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a href="mailto:vl@worldcashbox.ru" className="text-primary-600 hover:underline">
                      vl@worldcashbox.ru
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Адрес</h3>
                    <p className="text-gray-600">
                      г. Владивосток, ул. Толстого 32а, офис 308
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Оставить заявку</h2>
              <p className="text-gray-600 mb-6">
                Заполните форму, и наш специалист свяжется с вами в ближайшее время.
              </p>
              <button
                onClick={() => openAssistant(true)}
                className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Получить консультацию ассистента
              </button>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <RequestForm onClose={() => setShowForm(false)} />
      )}
    </div>
  )
}

