'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Smartphone, 
  Package, 
  CheckCircle, 
  Download, 
  ExternalLink,
  ArrowRight,
  Shield,
  Zap,
  BarChart3
} from 'lucide-react'
import { useAssistant } from '@/contexts/AssistantContext'

const datamobileProducts = [
  {
    id: 'datamobile-standard',
    name: 'DataMobile Стандарт',
    price: 'от 936 ₽',
    description: 'Начальная версия программы DataMobile для терминалов сбора данных и мобильных устройств. ПО предназначено для автоматизации учета товаров на складе, в магазине, учреждениях и организациях разного профиля.',
    features: [
      'Автоматизация учета товаров',
      'Работа на складе и в магазине',
      'Для ТСД и мобильных устройств',
      'Простота использования',
    ],
  },
  {
    id: 'datamobile-standard-pro',
    name: 'DataMobile Стандарт Pro',
    price: 'от 1 716 ₽',
    description: 'Специализированное ПО для ТСД и мобильных устройств, которое автоматизирует учет товаров. Версия Стандарт Pro расширяет функционал DataMobile и позволяет работать по заданию, загружать в терминал шаблоны этикеток и печатать их на мобильном принтере и другое. Имеет возможность подключения модулей: Маркировка, RFID.',
    features: [
      'Работа по заданию',
      'Шаблоны этикеток',
      'Печать на мобильном принтере',
      'Модули: Маркировка, RFID',
    ],
  },
  {
    id: 'datamobile-online-lite',
    name: 'DataMobile Online Lite',
    price: '2 496 ₽',
    description: 'Программное обеспечение для терминалов сбора данных и мобильных устройств, обладающее широкими функциональными возможностями для работы на складе и в торговом зале. Версия Online Lite расширяет DataMobile возможностью работать в режиме реального времени. Имеет защиту от потери связи и позволяет использовать модули: Маркировка, RFID.',
    features: [
      'Режим реального времени',
      'Защита от потери связи',
      'Работа на складе и в торговом зале',
      'Модули: Маркировка, RFID',
    ],
  },
  {
    id: 'datamobile-online',
    name: 'DataMobile Online',
    price: 'от 3 120 ₽',
    description: 'Специализированное программное обеспечение для терминалов сбора данных и мобильных устройств. ПО предназначено для автоматизации складского учета. Версия Online расширяет функционал DataMobile и позволяет работать в полноценном online-режиме, генерировать новые штрихкоды на ТСД, отображать картинки из товароучетной системы и другое.',
    features: [
      'Полноценный online-режим',
      'Генерация штрихкодов на ТСД',
      'Отображение картинок товаров',
      'Автоматизация складского учета',
    ],
  },
]

const datamobileModules = [
  {
    id: 'datamobile-marking',
    name: 'Модуль Маркировка для DataMobile',
    price: 'от 1 500 ₽',
    description: 'Готовое решение для автоматизации учета маркируемой продукции ("Честный Знак", ЕГАИС). DataMobile с модулем Маркировка имеет специальные функции, необходимые для работы с товарами, входящими в перечень обязательной маркировки (табачная и алкогольная продукция, обувь, легкая промышленность, лекарственные препараты и т.д.). В этом программном продукте для ТСД реализован уникальный механизм проверки и разбора КМ (кодов маркировки), а также работа с групповыми упаковками.',
    features: [
      'Работа с "Честный Знак"',
      'Интеграция с ЕГАИС',
      'Проверка и разбор КМ',
      'Работа с групповыми упаковками',
      'Поддержка обязательной маркировки',
    ],
  },
  {
    id: 'datamobile-rfid',
    name: 'DataMobile модуль RFID',
    price: 'от 4 500 ₽',
    description: 'Программное обеспечение для автоматизации учета по радиочастотным меткам. Терминал сбора данных с RFID-считывателем и установленным ПО DataMobile RFID распознает сотни меток за секунду. Решение позволяет выполнять стандартные складские операции в разы быстрее, чем по штрихкодам.',
    features: [
      'Распознавание сотен меток за секунду',
      'Ускорение складских операций',
      'Работа с RFID-метками',
      'Высокая скорость обработки',
    ],
  },
]

const profileSolutions = [
  {
    id: 'dm-delivery-pro',
    name: 'DM.Доставка Pro',
    price: 'от 1 560 ₽',
    description: 'Мобильное приложение для автоматизации работы сотрудников курьерских служб. Устанавливается на ТСД и другие мобильные устройства под управлением ОС Android. Программа поставляется с лицензией по подписке на 12 месяцев. На выбор пользователя — несколько видов тарифов, в зависимости от годового количества выгруженных документов.',
    features: [
      'Автоматизация курьерских служб',
      'Для ТСД и Android устройств',
      'Подписка на 12 месяцев',
      'Гибкие тарифы',
    ],
    link: 'https://disk.yandex.ru/d/GgZ6lAQ-3vnVtw',
    image: '/images/datamobile/Рисунок2.png',
  },
  {
    id: 'dm-invent',
    name: 'DM.Invent',
    price: 'от 2 700 ₽',
    description: 'Программный продукт для терминалов сбора данных и мобильных устройств на ОС Android, предназначенный для инвентаризации основных средств. Программа позволяет вести учет имущества в разрезе материально ответственных лиц и мест расположения объектов.',
    features: [
      'Инвентаризация основных средств',
      'Учет имущества',
      'Для ТСД и Android устройств',
      'Учет по МОЛ и местам расположения',
    ],
    link: 'https://disk.yandex.ru/d/nllUVefCZ3OnYw',
    image: '/images/datamobile/Рисунок3.png',
    modules: [
      {
        id: 'dm-invent-rfid',
        name: 'Модуль RFID для DM.Invent',
        price: 'от 5 400 ₽',
        description: 'При подключении RFID считывателя, инвентаризация может осуществляться на расстоянии, путем считывания радиочастотных меток с основных средств. Есть функционал поиска определенного ОС и записи метки в карточку ОС.',
      },
    ],
  },
  {
    id: 'dm-toir',
    name: 'DM.ТОИР',
    price: 'от 2 925 ₽',
    description: 'Приложение для мобильных устройств на ОС Android. Используется для организации обслуживания основных средств: фиксирования дефектов и поломок, управления ремонтными работами, учета аварийного запаса. ПО применимо в нефтегазовой, энергетической и производственной отраслях.',
    features: [
      'Обслуживание основных средств',
      'Фиксирование дефектов и поломок',
      'Управление ремонтными работами',
      'Учет аварийного запаса',
      'Для нефтегазовой и энергетической отраслей',
    ],
    link: 'https://disk.yandex.ru/d/ZAHY7my4vJlTgA',
    image: '/images/datamobile/Рисунок4.png',
    modules: [
      {
        id: 'dm-toir-rfid',
        name: 'Модуль RFID для DM.ТОИР',
        price: 'от 5 925 ₽',
        description: 'Дополнительное ПО, расширяющее возможности мобильного приложения для обслуживания и ремонта основных фондов. Позволяет идентифицировать объекты эксплуатации и их узлы по радиометкам.',
      },
    ],
  },
  {
    id: 'dm-pricechecker',
    name: 'DM.Прайсчекер',
    price: 'от 2 100 ₽',
    description: 'Программное обеспечение для информационных киосков и прайс-чекеров. Позволяет идентифицировать товар по штрихкоду и выводить на экран данные о нем: актуальную цену, изображение, информацию о действующих акциях и скидках.',
    features: [
      'Для информационных киосков',
      'Идентификация по штрихкоду',
      'Актуальные цены',
      'Информация об акциях и скидках',
    ],
    link: 'https://disk.yandex.ru/d/IyeSgKE174tj-Q',
    image: '/images/datamobile/Рисунок5.png',
  },
]

const marketingLinks = {
  datamobile: 'https://disk.yandex.ru/d/oJbmdVgVw_UYSg',
  invent: 'https://disk.yandex.ru/d/nllUVefCZ3OnYw',
  toir: 'https://disk.yandex.ru/d/ZAHY7my4vJlTgA',
  delivery: 'https://disk.yandex.ru/d/GgZ6lAQ-3vnVtw',
  pricechecker: 'https://disk.yandex.ru/d/IyeSgKE174tj-Q',
}

export default function DataMobilePage() {
  const { openAssistant } = useAssistant()
  const [expandedModule, setExpandedModule] = useState<string | null>(null)

  return (
    <div className="min-h-screen pt-20 pb-20 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/30">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="mb-8 flex justify-center">
              <a 
                href={marketingLinks.datamobile}
                target="_blank"
                rel="noopener noreferrer"
                className="block max-w-2xl w-full"
              >
                <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center p-4 min-h-[300px] md:min-h-[400px]">
                  <img 
                    src="/images/datamobile/Рисунок1.png" 
                    alt="DataMobile - Программное обеспечение для ТСД"
                    className="w-full h-auto object-contain max-h-full"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback если изображение не загрузилось
                      const parent = e.currentTarget.parentElement
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-primary-600 font-bold text-xl">DataMobile</span></div>'
                      }
                    }}
                  />
                </div>
              </a>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              DataMobile
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Программное обеспечение для автоматизации бизнес-процессов в торговых залах и на складах в оптовом и розничном сегментах. DataMobile входит в Единый реестр российского ПО.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <motion.a
                href={marketingLinks.datamobile}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary-600 px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Маркетинговые материалы</span>
                <ExternalLink className="w-4 h-4" />
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openAssistant(true)}
                className="bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-400 transition"
              >
                Получить консультацию
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Основные версии DataMobile */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Основные версии DataMobile</h2>
          <p className="text-gray-600 text-lg">Выберите версию, подходящую для вашего бизнеса</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {datamobileProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
                <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-bold">
                  {product.price}
                </div>
              </div>
              <p className="text-gray-600 mb-6">{product.description}</p>
              <ul className="space-y-2 mb-6">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openAssistant(true)}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
              >
                Узнать больше
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Дополнительные модули */}
      <section className="container mx-auto px-4 py-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Дополнительные модули DataMobile</h2>
          <p className="text-gray-600 text-lg">Расширьте возможности DataMobile</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {datamobileModules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-8 shadow-xl border border-primary-100"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{module.name}</h3>
                <div className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold">
                  {module.price}
                </div>
              </div>
              <p className="text-gray-600 mb-6">{module.description}</p>
              <ul className="space-y-2 mb-6">
                {module.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Профильные решения */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Профильные программные решения</h2>
          <p className="text-gray-600 text-lg">Специализированные решения для различных задач</p>
        </motion.div>

        <div className="space-y-6">
          {profileSolutions.map((solution, index) => (
            <motion.div
              key={solution.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Изображение */}
                {solution.image && (
                  <div className="md:w-2/5 lg:w-2/5 flex-shrink-0">
                    <a 
                      href={solution.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative w-full min-h-[300px] md:min-h-[400px] rounded-l-2xl overflow-hidden group bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center p-4"
                    >
                      <img 
                        src={solution.image}
                        alt={`${solution.name} - рекламный баннер`}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 max-h-full"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback если изображение не загрузилось
                          const img = e.currentTarget
                          img.style.display = 'none'
                          if (img.parentElement) {
                            const fallback = document.createElement('div')
                            fallback.className = 'w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center'
                            fallback.innerHTML = `<span class="text-primary-600 font-bold text-lg">${solution.name}</span>`
                            img.parentElement.appendChild(fallback)
                          }
                        }}
                      />
                    </a>
                  </div>
                )}
                
                {/* Контент */}
                <div className="flex-1 p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{solution.name}</h3>
                      <div className="bg-primary-100 text-primary-700 inline-block px-4 py-2 rounded-lg font-bold mb-4">
                        {solution.price}
                      </div>
                      <p className="text-gray-600 mb-4">{solution.description}</p>
                      <ul className="space-y-2 mb-4">
                        {solution.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col gap-3 md:min-w-[200px]">
                  {solution.link && (
                    <motion.a
                      href={solution.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition text-center flex items-center justify-center space-x-2"
                    >
                      <Download className="w-5 h-5" />
                      <span>Материалы</span>
                      <ExternalLink className="w-4 h-4" />
                    </motion.a>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openAssistant(true)}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    Узнать больше
                  </motion.button>
                    </div>
                  </div>
                
                  {solution.modules && solution.modules.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => setExpandedModule(expandedModule === solution.id ? null : solution.id)}
                        className="flex items-center space-x-2 text-primary-600 font-semibold hover:text-primary-700 transition"
                      >
                        <span>Дополнительные модули</span>
                        <ArrowRight 
                          className={`w-5 h-5 transition-transform ${expandedModule === solution.id ? 'rotate-90' : ''}`}
                        />
                      </button>
                      {expandedModule === solution.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 space-y-4"
                        >
                          {solution.modules.map((module) => (
                            <div key={module.id} className="bg-primary-50 rounded-xl p-6">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-lg font-bold text-gray-900">{module.name}</h4>
                                <div className="bg-primary-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
                                  {module.price}
                                </div>
                              </div>
                              <p className="text-gray-600">{module.description}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-12 text-white text-center shadow-2xl"
        >
          <h2 className="text-4xl font-bold mb-4">Нужна помощь с выбором?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Наши специалисты подберут оптимальное программное решение DataMobile для вашего бизнеса
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openAssistant(true)}
            className="bg-white text-primary-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition"
          >
            Получить консультацию
          </motion.button>
        </motion.div>
      </section>
    </div>
  )
}

