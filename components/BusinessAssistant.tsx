'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, CheckCircle, ArrowRight, ShoppingCart, Settings, Code, Shield, Send } from 'lucide-react'
import { businessSolutions } from '@/data/businessSolutions'
import { products } from '@/data/products'
import RequestForm from './RequestForm'
import { useAssistant } from '@/contexts/AssistantContext'
import { faqData, findAnswer, quickQuestions, getContextualQuestions, FAQ } from '@/data/faq'
import { formatPhoneNumber, getPhoneDigits } from '@/lib/phoneMask'
import { findCompanyByINN, extractINN } from '@/lib/companySearch'

type Step = 'welcome' | 'business' | 'needs' | 'size' | 'budget' | 'result' | 'contacts' | 'qa'

interface SelectedOptions {
  businessType?: string
  needs: string[]
  size?: string
  budget?: string
  contactData?: {
    name: string
    phone: string
    email: string
    company?: string
  }
}

export default function BusinessAssistant() {
  const { isOpen, skipWelcome, closeAssistant, openAssistant } = useAssistant()
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({ needs: [] })
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [qaMessages, setQaMessages] = useState<Array<{ role: 'user' | 'assistant', content: string, faq?: FAQ }>>([])
  const [qaInput, setQaInput] = useState('')
  const [isSearchingCompany, setIsSearchingCompany] = useState(false)
  const companySearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSearchedINNRef = useRef<string>('') // Храним последний найденный ИНН

  // Открытие ассистента извне - пропускаем welcome и сразу начинаем работу менеджера
  useEffect(() => {
    if (isOpen) {
      if (skipWelcome) {
        // Если открыт через кнопку "Получить консультацию" - сразу начинаем как менеджер
        setCurrentStep('business')
        // Сбрасываем предыдущие данные для нового клиента
        setSelectedOptions({ needs: [] })
        setRecommendedProducts([])
      } else {
        // Обычное открытие - показываем welcome
        setCurrentStep('welcome')
      }
    } else {
      // При закрытии сбрасываем состояние
      setCurrentStep('welcome')
      setSelectedOptions({ needs: [] })
      setRecommendedProducts([])
    }
  }, [isOpen, skipWelcome])

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (companySearchTimeoutRef.current) {
        clearTimeout(companySearchTimeoutRef.current)
      }
    }
  }, [])

  const businessTypes = [
    { id: 'restaurant', name: 'Общепит (кафе, рестораны)', icon: '🍽️', description: 'Рестораны, кафе, бары' },
    { id: 'retail', name: 'Розничная торговля', icon: '🛒', description: 'Магазины, аптеки, торговые точки' },
    { id: 'services', name: 'Предоставление услуг', icon: '💼', description: 'Сервисы, салоны, клиники' },
  ]

  const needsOptions = [
    { id: 'pos', name: 'POS-система', icon: ShoppingCart, description: 'Кассовое оборудование' },
    { id: 'accounting', name: 'Товароучет', icon: Settings, description: 'Учет товаров и склад' },
    { id: 'integration', name: 'Интеграция систем', icon: Code, description: 'Подключение к внешним сервисам' },
    { id: 'marking', name: 'Маркировка товаров', icon: Shield, description: 'Честный знак, ЕГАИС' },
  ]

  const sizeOptions = [
    { id: 'small', name: 'Малый бизнес', description: '1-5 сотрудников, 1 точка' },
    { id: 'medium', name: 'Средний бизнес', description: '6-20 сотрудников, 2-5 точек' },
    { id: 'large', name: 'Крупный бизнес', description: '20+ сотрудников, сеть точек' },
  ]

  const budgetOptions = [
    { id: 'low', name: 'До 50 000 ₽', description: 'Базовое решение' },
    { id: 'medium', name: '50 000 - 200 000 ₽', description: 'Стандартное решение' },
    { id: 'high', name: 'От 200 000 ₽', description: 'Комплексное решение' },
  ]

  const handleBusinessSelect = (businessId: string) => {
    setSelectedOptions({ ...selectedOptions, businessType: businessId })
    setCurrentStep('needs')
  }

  const handleNeedToggle = (needId: string) => {
    setSelectedOptions({
      ...selectedOptions,
      needs: selectedOptions.needs.includes(needId)
        ? selectedOptions.needs.filter(n => n !== needId)
        : [...selectedOptions.needs, needId]
    })
  }

  const handleSizeSelect = (sizeId: string) => {
    setSelectedOptions({ ...selectedOptions, size: sizeId })
    setCurrentStep('budget')
  }

  const handleBudgetSelect = (budgetId: string) => {
    setSelectedOptions({ ...selectedOptions, budget: budgetId })
    generateRecommendations()
    setCurrentStep('result')
  }

  const generateRecommendations = () => {
    const recommendations: any[] = []
    const businessType = selectedOptions.businessType as keyof typeof businessSolutions
    const size = selectedOptions.size
    const budget = selectedOptions.budget
    
    // Умный подбор на основе всех параметров клиента
    if (selectedOptions.needs.includes('pos')) {
      if (businessType === 'restaurant') {
        // Для ресторанов - учитываем масштаб
        if (size === 'small') {
          // Малый бизнес - компактное решение
          const product = products.find(p => p.id === 'evotor-7-3')
          if (product) recommendations.push(product)
        } else if (size === 'medium') {
          // Средний бизнес - стандартное решение
          const product = products.find(p => p.id === 'pos-center-pos250')
          if (product) recommendations.push(product)
        } else {
          // Крупный бизнес - профессиональное решение
          const product = products.find(p => p.id === 'pos-center-pos250')
          if (product) recommendations.push(product)
          // Добавляем дополнительные терминалы для сети
          const additional = products.find(p => p.id === 'evotor-7-3')
          if (additional) recommendations.push(additional)
        }
      } else if (businessType === 'retail') {
        // Для розницы - учитываем масштаб и потребности
        if (size === 'small') {
          recommendations.push(products.find(p => p.id === 'evotor-7-2')!)
        } else if (size === 'medium') {
          recommendations.push(products.find(p => p.id === 'pos-center-pos101')!)
        } else {
          // Крупная розница - профессиональное решение
          recommendations.push(products.find(p => p.id === 'pos-center-wise')!)
          if (selectedOptions.needs.includes('marking')) {
            // Для крупной розницы с маркировкой - добавляем кассу самообслуживания
            const selfService = products.find(p => p.id === 'pos-center-k210-light')
            if (selfService) recommendations.push(selfService)
          }
        }
      } else if (businessType === 'services') {
        // Для услуг - мобильные решения
        if (size === 'small') {
          recommendations.push(products.find(p => p.id === 'evotor-7-2')!)
        } else {
          recommendations.push(products.find(p => p.id === 'pos-center-pos101')!)
          const mobile = products.find(p => p.id === 'mindeo-m50')
          if (mobile) recommendations.push(mobile)
        }
      }
    }

    // Товароучет - адаптация под бизнес
    if (selectedOptions.needs.includes('accounting')) {
      if (businessType === 'restaurant') {
        const iikoProduct = products.find(p => p.id === 'iiko')
        if (iikoProduct) recommendations.push(iikoProduct)
      } else {
        const bitrixProduct = products.find(p => p.id === 'bitrix24')
        if (bitrixProduct) recommendations.push(bitrixProduct)
      }
    }

    // Интеграция - добавляем как услугу
    if (selectedOptions.needs.includes('integration')) {
      recommendations.push({
        id: 'integration-service',
        name: 'Интеграция систем',
        description: 'Подключение касс к товароучетным программам и внешним сервисам',
        category: 'services',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
      })
    }

    // Маркировка - особенно важно для розницы
    if (selectedOptions.needs.includes('marking')) {
      recommendations.push({
        id: 'marking-service',
        name: 'Маркировка товаров под ключ',
        description: 'Регистрация в системе "Честный знак" и ЕГАИС',
        category: 'services',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      })
    }

    // Умная фильтрация по бюджету с учетом масштаба
    let filteredRecommendations = recommendations
    
    if (budget === 'low') {
      // Бюджет до 50к - только базовые решения
      filteredRecommendations = recommendations.filter(p => !p.price || p.price <= 50000)
    } else if (budget === 'medium') {
      // Бюджет 50-200к - стандартные решения
      filteredRecommendations = recommendations.filter(p => !p.price || p.price <= 200000)
      // Для среднего бюджета и крупного бизнеса - можем предложить рассрочку
      if (size === 'large') {
        // Добавляем пометку о возможности рассрочки
        filteredRecommendations = recommendations.filter(p => !p.price || p.price <= 300000)
      }
    } else {
      // Бюджет от 200к - все решения + премиум опции
      filteredRecommendations = recommendations
    }

    // Убираем дубликаты
    const uniqueRecommendations = filteredRecommendations.filter((product, index, self) =>
      index === self.findIndex((p) => p.id === product.id)
    )

    setRecommendedProducts(uniqueRecommendations)
  }

  const resetAssistant = () => {
    setCurrentStep('welcome')
    setSelectedOptions({ needs: [] })
    setRecommendedProducts([])
    setQaMessages([])
    setQaInput('')
  }

  const handleQASubmit = () => {
    if (!qaInput.trim()) return

    const userMessage = qaInput.trim()
    setQaInput('')

    // Добавляем вопрос пользователя
    setQaMessages(prev => [...prev, { role: 'user', content: userMessage }])

    // Ищем ответ в FAQ
    setTimeout(() => {
      // Получаем последний вопрос ассистента для понимания контекста
      const lastAssistantMessage = getLastAssistantMessage()
      const lastAssistantText = lastAssistantMessage?.content.toLowerCase() || ''
      const conversationHistory = qaMessages.slice(-6).map(m => m.content.toLowerCase()).join(' ')
      const contextText = userMessage.toLowerCase()
      
      // Анализ ответа пользователя на вопрос ассистента
      let contextualResponse = ''
      
      // Если ассистент спрашивал о типе бизнеса
      if (lastAssistantText.includes('тип бизнеса') || lastAssistantText.includes('какой бизнес') || lastAssistantText.includes('что за бизнес')) {
        if (contextText.includes('магазин') || contextText.includes('розница') || contextText.includes('торговля') || contextText.includes('аптека')) {
          contextualResponse = 'Понял, у вас магазин! Для розничной торговли нужны POS-терминалы с поддержкой ОФД, ЕГАИС и маркировки. Рекомендую POSCenter Wise (от 45 000 ₽) для крупных магазинов или Эвотор 7.2/7.3 (от 25-30 000 ₽) для небольших точек. Какой масштаб вашего магазина - сколько точек?'
        } else if (contextText.includes('ресторан') || contextText.includes('кафе') || contextText.includes('общепит') || contextText.includes('столовая') || contextText.includes('бар')) {
          contextualResponse = 'Отлично, у вас заведение общепита! Для ресторанов и кафе нужны POS-системы с интеграцией iiko. Это позволяет управлять залом и кухней, учитывать продукты. Подходит POSCenter POS250 (от 55 000 ₽) для ресторанов или Эвотор 7.3 (от 30 000 ₽) для небольших кафе. Сколько посадочных мест?'
        } else if (contextText.includes('услуг') || contextText.includes('сервис') || contextText.includes('салон') || contextText.includes('клиника') || contextText.includes('салон красоты')) {
          contextualResponse = 'Понял, у вас сервисный бизнес! Для услуг подходят мобильные кассы: Эвотор 7.2 (от 25 000 ₽), Mindeo M50 (от 20 000 ₽) или POSCenter POS101 (от 35 000 ₽). Также можем настроить онлайн-запись, управление персоналом, программы лояльности. Что именно нужно автоматизировать?'
        }
      }
      
      // Если ассистент спрашивал о бюджете или стоимости
      if (lastAssistantText.includes('бюджет') || lastAssistantText.includes('стоимость') || lastAssistantText.includes('цена') || lastAssistantText.includes('сколько стоит')) {
        // Извлекаем числа из ответа
        const budgetMatch = contextText.match(/(\d+[\s\d]*)/)
        if (budgetMatch) {
          const budget = parseInt(budgetMatch[1].replace(/\s/g, ''))
          if (budget < 50000) {
            contextualResponse = `Понял, бюджет до ${budget.toLocaleString('ru-RU')} ₽. Для такого бюджета подойдут базовые решения: Эвотор 7.2 (от 25 000 ₽) или Mindeo M50 (от 20 000 ₽). Что еще нужно в комплекте - товароучет, интеграции?`
          } else if (budget < 200000) {
            contextualResponse = `Хороший бюджет ${budget.toLocaleString('ru-RU')} ₽! Для этого можем предложить стандартные решения: POSCenter POS101 (от 35 000 ₽) или POSCenter Wise (от 45 000 ₽). Что еще важно - маркировка, ЕГАИС, товароучет?`
          } else {
            contextualResponse = `Отличный бюджет ${budget.toLocaleString('ru-RU')} ₽! Можем сделать комплексное решение: профессиональные POS-терминалы, товароучетная система, интеграции, маркировка. Подберем оптимальную конфигурацию под ваш бизнес. Какие основные задачи нужно решить?`
          }
        }
      }
      
      // Если ассистент спрашивал о масштабе бизнеса
      if (lastAssistantText.includes('масштаб') || lastAssistantText.includes('размер') || lastAssistantText.includes('сколько точек') || lastAssistantText.includes('сколько сотрудников')) {
        if (contextText.includes('1') || contextText.includes('одна') || contextText.includes('малый') || contextText.includes('небольшой')) {
          contextualResponse = 'Понял, малый бизнес! Для одной точки подойдут компактные решения: Эвотор 7.2/7.3 (от 25-30 000 ₽) или Mindeo M50 (от 20 000 ₽). Они мобильные, простые в использовании. Что еще нужно - товароучет, маркировка?'
        } else if (contextText.includes('2') || contextText.includes('3') || contextText.includes('4') || contextText.includes('5') || contextText.includes('несколько') || contextText.includes('средний')) {
          contextualResponse = 'Понял, несколько точек! Для сети нужна товароучетная система с синхронизацией между точками. Подойдет POSCenter POS101 или Wise с облачным товароучетом. Нужна ли маркировка товаров?'
        } else if (contextText.includes('много') || contextText.includes('сеть') || contextText.includes('крупный') || contextText.includes('большой')) {
          contextualResponse = 'Понял, крупная сеть! Для сети нужны профессиональные POSCenter Wise (от 45 000 ₽) с облачной товароучетной системой, интеграциями, централизованной аналитикой. Какой тип товаров продаете - нужна ли маркировка, ЕГАИС?'
        }
      }
      
      // Если есть контекстный ответ, используем его
      if (contextualResponse) {
        setQaMessages(prev => [...prev, { 
          role: 'assistant', 
          content: contextualResponse
        }])
        return
      }
      
      const faq = findAnswer(userMessage)
      
      if (faq) {
        // Более естественный и контекстный ответ менеджера
        let answer = faq.answer
        
        // Добавляем контекстные уточнения в зависимости от категории
        if (faq.category === 'pricing') {
          answer += ' Могу подобрать решение под ваш бюджет - просто скажите, какой бюджет вы планируете.'
        } else if (faq.category === 'equipment') {
          answer += ' Расскажите о вашем бизнесе, и я подберу оптимальное оборудование.'
        } else if (faq.category === 'support') {
          answer += ' Наши специалисты всегда готовы помочь и ответить на ваши вопросы.'
        } else if (faq.category === 'integration') {
          answer += ' Мы можем интегрировать практически любые системы - уточните, какие именно вам нужны.'
        }
        
        if (!answer.endsWith('!') && !answer.endsWith('?') && !answer.endsWith('.')) {
          answer += '.'
        }
        
        setQaMessages(prev => [...prev, { 
          role: 'assistant', 
          content: answer,
          faq: faq
        }])
      } else {
        // Умный ответ на основе контекста разговора и анализа вопроса
        const contextText = userMessage.toLowerCase()
        const conversationHistory = qaMessages.slice(-3).map(m => m.content.toLowerCase()).join(' ')
        let smartResponse = ''
        
        // Приветствия
        if (contextText.includes('привет') || contextText.includes('здравствуй') || contextText.includes('добрый')) {
          smartResponse = 'Здравствуйте! Рад помочь вам с автоматизацией бизнеса. Что именно вас интересует? Могу помочь с подбором оборудования, ценами, установкой и другими вопросами.'
        } 
        // Благодарности
        else if (contextText.includes('спасибо') || contextText.includes('благодарю')) {
          smartResponse = 'Пожалуйста! Всегда рад помочь. Если возникнут еще вопросы - обращайтесь! Могу также помочь с подбором решения для вашего бизнеса.'
        } 
        // Прощания
        else if (contextText.includes('пока') || contextText.includes('до свидания')) {
          smartResponse = 'До свидания! Если понадобится помощь - обращайтесь. Удачного дня!'
        }
        // Вопросы про конкретные продукты
        else if (contextText.includes('эвотор') || contextText.includes('evotor')) {
          smartResponse = 'Эвотор - это популярные облачные кассы для малого бизнеса. У нас есть Эвотор 7.2 (от 25 000 ₽) и Эвотор 7.3 (от 30 000 ₽). Они мобильные, простые в использовании и имеют множество приложений. Подходят для кафе, магазинов, услуг. Хотите узнать больше или подобрать решение для вашего бизнеса?'
        }
        else if (contextText.includes('poscenter') || contextText.includes('pos-center') || contextText.includes('pos центр')) {
          smartResponse = 'POSCenter - это линейка профессиональных POS-терминалов. У нас есть POSCenter POS101 (от 35 000 ₽) для малого бизнеса, POSCenter Wise (от 45 000 ₽) для розницы, POSCenter POS250 (от 55 000 ₽) для ресторанов. Все поддерживают ОФД, ЕГАИС, маркировку. Какой тип бизнеса у вас?'
        }
        else if (contextText.includes('битрикс') || contextText.includes('bitrix')) {
          smartResponse = 'Битрикс24 - это CRM система для управления бизнесом. Стоимость от 3 000 ₽. Включает управление клиентами, задачи, проекты, аналитику и интеграции. Подробнее на worldcashbox24.ru. Мы можем интегрировать Битрикс24 с вашим POS-оборудованием. Интересует интеграция или установка?'
        }
        else if (contextText.includes('видеонаблюдение') || contextText.includes('камера') || contextText.includes('видео')) {
          smartResponse = 'Мы предлагаем современные системы видеонаблюдения, которые обеспечат надежную защиту от несанкционированного доступа в офис или на предприятие. Подберем и внедрим оптимальное решение индивидуально под ваши потребности. Хотите узнать больше о системах видеонаблюдения?'
        }
        else if (contextText.includes('маркировка') || contextText.includes('честный знак')) {
          smartResponse = 'Мы предлагаем маркировку товаров под ключ! Регистрация вашего бизнеса в системе "Честный знак" и "ЕГАИС". Полное сопровождение от регистрации до настройки оборудования и обучения персонала. Хотите узнать подробнее?'
        }
        else if (contextText.includes('егаис') || contextText.includes('алкоголь')) {
          smartResponse = 'ЕГАИС - это система учета алкогольной продукции. Мы помогаем с регистрацией в системе ЕГАИС, настройкой оборудования для работы с алкоголем и интеграцией с вашей товароучетной системой. Также предлагаем маркировку товаров под ключ. Нужна помощь с регистрацией?'
        }
        else if (contextText.includes('меркурий') || contextText.includes('ветеринарный')) {
          smartResponse = 'Меркурий - это система ветеринарного сопровождения для учета продукции животного происхождения. Мы помогаем с регистрацией в системе Меркурий и настройкой оборудования для работы с этой системой. Нужна помощь с регистрацией?'
        }
        else if (contextText.includes('автоматизация') || contextText.includes('под ключ') || contextText.includes('режим одного окна')) {
          smartResponse = 'Мы решаем все в режиме одного окна! Найдем товароучетную программу по выгодной цене, которая сделает бизнес прибыльным. Настроим технику и интегрируем ее с выбранным программным обеспечением. Подберем оборудование индивидуально под ваш бизнес. Хотите получить консультацию?'
        }
        // Вопросы про типы бизнеса
        else if (contextText.includes('ресторан') || contextText.includes('кафе') || contextText.includes('общепит')) {
          smartResponse = 'Для ресторанов и кафе мы рекомендуем POS-системы с интеграцией iiko. Это позволяет управлять залом и кухней, учитывать продукты, калькулировать блюда. Подходит POSCenter POS250 (от 55 000 ₽) или Эвотор 7.3 (от 30 000 ₽) для небольших кафе. Хотите подобрать решение?'
        }
        else if (contextText.includes('магазин') || contextText.includes('розница') || contextText.includes('торговля')) {
          smartResponse = 'Для магазинов нужны POS-терминалы с поддержкой ОФД, ЕГАИС, маркировки. Рекомендую POSCenter Wise (от 45 000 ₽) для крупных магазинов или Эвотор 7.2/7.3 (от 25-30 000 ₽) для небольших точек. Все поддерживают необходимые системы. Какой масштаб бизнеса?'
        }
        else if (contextText.includes('услуги') || contextText.includes('сервис')) {
          smartResponse = 'Для сферы услуг подходят мобильные кассы: Эвотор 7.2 (от 25 000 ₽), Mindeo M50 (от 20 000 ₽) или POSCenter POS101 (от 35 000 ₽). Также можем настроить онлайн-запись, управление персоналом, программы лояльности. Что именно нужно автоматизировать?'
        }
        // Общие вопросы - более умные ответы
        else {
          // Анализируем контекст разговора
          if (conversationHistory.includes('стоимость') || conversationHistory.includes('цена') || conversationHistory.includes('бюджет')) {
            smartResponse = 'Понял, вы интересуетесь стоимостью. В стоимость входит оборудование, ПО, установка, обучение и поддержка. Базовые решения от 25 000 ₽, комплексные от 200 000 ₽. Могу подобрать решение под ваш бюджет - какой у вас бюджет?'
          } else if (conversationHistory.includes('оборудование') || conversationHistory.includes('касса') || conversationHistory.includes('терминал')) {
            smartResponse = 'Понял, речь об оборудовании. У нас большой выбор: от мобильных касс Эвотор (от 25 000 ₽) до профессиональных POSCenter (от 35 000 ₽). Все зависит от типа вашего бизнеса. Расскажите о вашем бизнесе, и я подберу оптимальное оборудование!'
          } else {
            // Разнообразные ответы без повторений
            const managerResponses = [
              'Понял ваш вопрос! Могу помочь с подбором оборудования, ценами, установкой, интеграцией. Что именно вас интересует больше всего?',
              'Спасибо за вопрос! Чтобы дать точный ответ, уточните, пожалуйста: какой у вас тип бизнеса и что нужно автоматизировать?',
              'Хороший вопрос! Расскажите подробнее о вашем бизнесе - это поможет мне дать более точный ответ и подобрать оптимальное решение.',
              'Понял! Могу помочь с автоматизацией вашего бизнеса. У нас есть решения для ресторанов, магазинов, услуг. Что именно вас интересует?',
            ]
            // Выбираем ответ, который еще не использовался в этом разговоре
            const usedResponses = qaMessages.filter(m => m.role === 'assistant').map(m => m.content)
            const availableResponses = managerResponses.filter(r => !usedResponses.includes(r))
            smartResponse = availableResponses.length > 0 
              ? availableResponses[0] 
              : managerResponses[Math.floor(Math.random() * managerResponses.length)]
          }
        }
        
        setQaMessages(prev => [...prev, { 
          role: 'assistant', 
          content: smartResponse
        }])
      }
    }, 500)
  }

  const handleQuickQuestion = (question: string) => {
    const userMessage = question.trim()
    
    // Добавляем вопрос пользователя
    setQaMessages(prev => [...prev, { role: 'user', content: userMessage }])

    // Ищем ответ в FAQ
    setTimeout(() => {
      const faq = findAnswer(userMessage)
      
      if (faq) {
        let answer = faq.answer
        
        // Добавляем контекстные уточнения
        if (faq.category === 'pricing') {
          answer += ' Могу подобрать решение под ваш бюджет.'
        } else if (faq.category === 'equipment') {
          answer += ' Расскажите о вашем бизнесе, и я подберу оптимальное оборудование.'
        } else if (faq.category === 'support') {
          answer += ' Наши специалисты всегда готовы помочь.'
        } else if (faq.category === 'integration') {
          answer += ' Мы можем интегрировать практически любые системы.'
        }
        
        if (!answer.endsWith('!') && !answer.endsWith('?') && !answer.endsWith('.')) {
          answer += '.'
        }
        
        setQaMessages(prev => [...prev, { 
          role: 'assistant', 
          content: answer,
          faq: faq
        }])
      } else {
        const managerResponses = [
          'Понял ваш вопрос! Давайте уточним детали. Могу помочь с подбором оборудования, ценами, установкой и другими вопросами. Что именно вас интересует?',
          'Спасибо за вопрос! Чтобы дать вам наиболее точный ответ, уточните, пожалуйста, что именно вас интересует? Могу помочь с оборудованием, ценами, установкой или другими вопросами.',
        ]
        const randomResponse = managerResponses[Math.floor(Math.random() * managerResponses.length)]
        
        setQaMessages(prev => [...prev, { 
          role: 'assistant', 
          content: randomResponse
        }])
      }
    }, 500)
  }
  
  // Получаем последний ответ ассистента для контекстных вопросов
  const getLastAssistantMessage = () => {
    for (let i = qaMessages.length - 1; i >= 0; i--) {
      if (qaMessages[i].role === 'assistant') {
        return qaMessages[i]
      }
    }
    return null
  }
  
  // Получаем контекст разговора из последних сообщений
  const getConversationContext = () => {
    const recentMessages = qaMessages.slice(-4) // Последние 4 сообщения
    return recentMessages.map(msg => msg.content)
  }
  
  // Получаем уже заданные вопросы, чтобы не показывать их снова
  const getAskedQuestions = () => {
    return qaMessages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content.toLowerCase())
  }
  
  const lastAssistantMsg = getLastAssistantMessage()
  const conversationContext = getConversationContext()
  const askedQuestions = getAskedQuestions()
  
  // Получаем контекстные вопросы
  let contextualQuestions = lastAssistantMsg?.faq 
    ? getContextualQuestions(lastAssistantMsg.faq.category, conversationContext)
    : getContextualQuestions(undefined, conversationContext)
  
  // Фильтруем уже заданные вопросы
  contextualQuestions = contextualQuestions.filter(q => 
    !askedQuestions.some(asked => asked.includes(q.toLowerCase()) || q.toLowerCase().includes(asked))
  )
  
  // Если все вопросы уже заданы, показываем другие
  if (contextualQuestions.length < 4) {
    const allQuestions = quickQuestions.filter(q => 
      !askedQuestions.some(asked => asked.includes(q.toLowerCase()) || q.toLowerCase().includes(asked))
    )
    contextualQuestions = [...contextualQuestions, ...allQuestions].slice(0, 4)
  }

  const handleContactSubmit = () => {
    // Подготовка данных для отправки
    const formData = {
      name: selectedOptions.contactData?.name || '',
      phone: selectedOptions.contactData?.phone || '',
      email: selectedOptions.contactData?.email || '',
      company: selectedOptions.contactData?.company || '',
      businessType: selectedOptions.businessType || '',
      message: `Заявка от ассистента подбора:
Сфера бизнеса: ${businessTypes.find(b => b.id === selectedOptions.businessType)?.name}
Потребности: ${selectedOptions.needs.map(n => needsOptions.find(no => no.id === n)?.name).join(', ')}
Масштаб: ${sizeOptions.find(s => s.id === selectedOptions.size)?.name}
Бюджет: ${budgetOptions.find(b => b.id === selectedOptions.budget)?.name}
Подобранные товары: ${recommendedProducts.map(p => p.name).join(', ')}`,
      selectedProducts: recommendedProducts.map(p => p.name),
      additionalServices: selectedOptions.needs,
    }

    // Открываем форму с предзаполненными данными
    setShowForm(true)
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-end space-y-2"
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white text-primary-600 px-4 py-2 rounded-lg shadow-lg border-2 border-primary-200 font-bold text-sm"
            >
              Ассистент
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => openAssistant(false)}
              className="relative bg-gradient-to-r from-primary-500 to-primary-600 text-white p-5 rounded-full shadow-2xl hover:shadow-primary-500/50 transition-all group"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-primary-400 rounded-full opacity-50 blur-xl"
              />
              <Sparkles className="w-7 h-7 relative z-10 group-hover:rotate-12 transition-transform" />
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
              />
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* Assistant Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-8 right-8 w-[500px] max-w-[calc(100vw-4rem)] max-h-[700px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col border-2 border-primary-100 assistant-container"
            style={{ 
              overflowX: 'hidden', 
              overflowY: 'hidden', 
              willChange: 'transform',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              width: '500px', 
              maxWidth: 'calc(100vw - 4rem)', 
              boxSizing: 'border-box'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 flex items-center justify-between relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400/50 to-primary-500/50 animate-pulse"></div>
              <div className="flex items-center space-x-3 relative z-10 flex-1 min-w-0">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-xl block truncate">Ассистент-менеджер</span>
                  <span className="text-xs text-white/80 truncate">Первичная консультация и подбор</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 relative z-10 flex-shrink-0">
                {currentStep !== 'welcome' && currentStep !== 'qa' && (
                  <button
                    onClick={() => {
                      setCurrentStep('qa')
                      setQaMessages([{
                        role: 'assistant',
                        content: 'Здравствуйте! Я ваш персональный менеджер. Чем могу помочь? Задайте любой вопрос, и я с радостью отвечу!'
                      }])
                    }}
                    className="hover:bg-white/20 rounded-full p-2 transition text-sm"
                    title="Задать вопрос"
                  >
                    💬
                  </button>
                )}
                <button
                  onClick={() => {
                    closeAssistant()
                    setTimeout(resetAssistant, 300)
                  }}
                  className="hover:bg-white/20 rounded-full p-2 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 w-full flex flex-col min-h-0" style={{ overflow: 'hidden', width: '100%', boxSizing: 'border-box', padding: '1.5rem' }}>
              <div className="flex-1 min-h-0 assistant-content-scroll" style={{ 
                overflowY: 'auto', 
                overflowX: 'hidden',
                maxHeight: '100%'
              }}>
              <AnimatePresence mode="wait">
                {/* Welcome Step */}
                {currentStep === 'welcome' && (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="text-center overflow-hidden"
                    style={{ overflow: 'hidden' }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="text-6xl mb-4"
                    >
                      👨‍💼
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Я ваш персональный менеджер
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Помогу подобрать оптимальное решение для вашего бизнеса. Ответьте на несколько вопросов, и я подготовлю персональное предложение.
                    </p>
                    <div className="space-y-3 overflow-hidden">
                      <motion.button
                        whileHover={{ opacity: 0.9 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentStep('business')}
                        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all"
                      >
                        Начать консультацию
                      </motion.button>
                      <motion.button
                        whileHover={{ opacity: 0.9 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setCurrentStep('qa')
                          setQaMessages([{
                            role: 'assistant',
                            content: 'Здравствуйте! Я ваш персональный менеджер. Чем могу помочь? Задайте любой вопрос, и я с радостью отвечу!'
                          }])
                        }}
                        className="w-full border-2 border-primary-500 text-primary-600 py-3 rounded-xl font-bold text-base hover:bg-primary-50 transition-all"
                      >
                        💬 Задать вопрос
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Business Type Step */}
                {currentStep === 'business' && (
                  <motion.div
                    key="business"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="w-full overflow-hidden"
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl">👋</span>
                      <h3 className="text-xl font-bold text-gray-900">Шаг 1 из 4</h3>
                    </div>
                    <p className="text-gray-600 mb-2 font-medium">Привет! Меня зовут Ассистент-менеджер.</p>
                    <p className="text-gray-600 mb-6">Для начала мне нужно понять, в какой сфере работает ваш бизнес?</p>
                    <div className="space-y-3">
                      {businessTypes.map((type) => (
                        <motion.button
                          key={type.id}
                          whileHover={{ opacity: 0.9 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleBusinessSelect(type.id)}
                          className="w-full text-left bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 border-2 border-primary-200 hover:border-primary-400 rounded-xl p-4 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center space-x-4">
                            <span className="text-4xl flex-shrink-0">{type.icon}</span>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-primary-700 text-lg break-words">{type.name}</div>
                              <div className="text-sm text-gray-600 break-words">{type.description}</div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Needs Step */}
                {currentStep === 'needs' && (
                  <motion.div
                    key="needs"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="w-full"
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl">✅</span>
                      <h3 className="text-xl font-bold text-gray-900">Шаг 2 из 4</h3>
                    </div>
                    <p className="text-gray-600 mb-2">
                      Отлично! Теперь расскажите, что вам необходимо для автоматизации?
                    </p>
                    <p className="text-sm text-gray-500 mb-6">Можно выбрать несколько вариантов</p>
                    <div className="space-y-3 mb-6">
                      {needsOptions.map((need) => {
                        const NeedIcon = need.icon
                        const isSelected = selectedOptions.needs.includes(need.id)
                        return (
                          <motion.button
                            key={need.id}
                            whileHover={{ opacity: 0.9 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleNeedToggle(need.id)}
                            className={`w-full text-left border-2 rounded-xl p-4 transition-all ${
                              isSelected
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-primary-600 shadow-lg'
                                : 'bg-white border-gray-200 hover:border-primary-300'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isSelected ? 'bg-white/20' : 'bg-primary-100'
                              }`}>
                                <NeedIcon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-primary-600'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`font-bold text-lg break-words ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                  {need.name}
                                </div>
                                <div className={`text-sm break-words ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                                  {need.description}
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle className="w-6 h-6 text-white flex-shrink-0" />
                              )}
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                    {selectedOptions.needs.length > 0 && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ opacity: 0.9 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentStep('size')}
                        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all flex-shrink-0 overflow-hidden"
                      >
                        <span className="flex items-center justify-center">
                          Продолжить
                          <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
                        </span>
                      </motion.button>
                    )}
                  </motion.div>
                )}

                {/* Size Step */}
                {currentStep === 'size' && (
                  <motion.div
                    key="size"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="w-full"
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl">📊</span>
                      <h3 className="text-xl font-bold text-gray-900">Шаг 3 из 4</h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Понял ваши потребности! Теперь уточните масштаб вашего бизнеса, чтобы я подобрал оптимальное решение.
                    </p>
                    <div className="space-y-3">
                      {sizeOptions.map((size) => (
                        <motion.button
                          key={size.id}
                          whileHover={{ opacity: 0.9 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSizeSelect(size.id)}
                          className={`w-full text-left border-2 rounded-xl p-4 transition-all ${
                            selectedOptions.size === size.id
                              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-primary-600 shadow-lg'
                              : 'bg-white border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="font-bold text-lg mb-1">{size.name}</div>
                          <div className={`text-sm ${selectedOptions.size === size.id ? 'text-white/90' : 'text-gray-600'}`}>
                            {size.description}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Budget Step */}
                {currentStep === 'budget' && (
                  <motion.div
                    key="budget"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="w-full"
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl">💰</span>
                      <h3 className="text-xl font-bold text-gray-900">Шаг 4 из 4</h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Последний вопрос! Какой бюджет вы планируете на автоматизацию? Это поможет мне подобрать наиболее подходящие решения.
                    </p>
                    <div className="space-y-3">
                      {budgetOptions.map((budget) => (
                        <motion.button
                          key={budget.id}
                          whileHover={{ opacity: 0.9 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleBudgetSelect(budget.id)}
                          className={`w-full text-left border-2 rounded-xl p-4 transition-all ${
                            selectedOptions.budget === budget.id
                              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-primary-600 shadow-lg'
                              : 'bg-white border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="font-bold text-lg mb-1">{budget.name}</div>
                          <div className={`text-sm ${selectedOptions.budget === budget.id ? 'text-white/90' : 'text-gray-600'}`}>
                            {budget.description}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Result Step */}
                {currentStep === 'result' && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="w-full flex flex-col h-full min-h-0"
                  >
                    <div className="flex-1 min-h-0" style={{ 
                      overflow: 'hidden'
                    }}>
                      <div className="text-center mb-6">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          className="text-6xl mb-4"
                        >
                          ✅
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Подбор завершен!
                        </h3>
                        <p className="text-gray-600 mb-3">
                          Мы подобрали решения специально для вас
                        </p>
                        <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-3 text-sm text-gray-700">
                          <span className="font-semibold">💡</span> Оставьте контакты, и наш менеджер свяжется с вами для консультации по подобранному комплекту
                        </div>
                      </div>

                      {recommendedProducts.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-bold text-gray-900 mb-4 text-lg">
                            Подобранный комплект оборудования:
                          </h4>
                          <div className="space-y-4">
                            {recommendedProducts.map((product, index) => (
                              <motion.div
                                key={product.id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white border-2 border-primary-200 rounded-xl shadow-md hover:shadow-lg transition-all"
                              >
                                <div className="flex w-full">
                                  {/* Изображение */}
                                  <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden rounded-l-xl" style={{ overflow: 'hidden' }}>
                                    {product.image ? (
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        style={{ objectFit: 'cover', display: 'block', maxWidth: '100%', height: 'auto' }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-4xl">
                                        {product.category === 'equipment' && '🖥️'}
                                        {product.category === 'software' && '💾'}
                                        {product.category === 'services' && '🔧'}
                                      </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded">
                                      {index + 1}
                                    </div>
                                  </div>
                                  
                                  {/* Информация */}
                                  <div className="flex-1 p-4 min-w-0">
                                    <div className="font-bold text-primary-700 mb-1 text-lg break-words">
                                      {product.name}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2 break-words">
                                      {product.description}
                                    </div>
                                    {product.features && product.features.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-2">
                                        {product.features.slice(0, 2).map((feature: string, i: number) => (
                                          <span
                                            key={i}
                                            className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded break-words"
                                          >
                                            {feature}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    {product.price && (
                                      <div className="text-xl font-bold text-primary-600">
                                        {product.price.toLocaleString('ru-RU')} ₽
                                      </div>
                                    )}
                                    {!product.price && (
                                      <div className="text-sm font-semibold text-primary-600">
                                        Услуга
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                          
                          {/* Итоговая стоимость */}
                          {recommendedProducts.some(p => p.price) && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: recommendedProducts.length * 0.1 }}
                              className="mt-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl p-4"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-lg">Итого:</span>
                                <span className="font-extrabold text-2xl">
                                  {recommendedProducts
                                    .filter(p => p.price)
                                    .reduce((sum, p) => sum + (p.price || 0), 0)
                                    .toLocaleString('ru-RU')} ₽
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 flex-shrink-0 mt-4 overflow-hidden">
                      <motion.button
                        whileHover={{ opacity: 0.9 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentStep('contacts')}
                        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all"
                      >
                        Получить консультацию менеджера
                      </motion.button>
                      <motion.button
                        whileHover={{ opacity: 0.9 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={resetAssistant}
                        className="w-full border-2 border-primary-500 text-primary-600 py-3 rounded-xl font-bold text-base hover:bg-primary-50 transition-all"
                      >
                        Начать заново
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Contacts Step - Менеджер первой линии */}
                {currentStep === 'contacts' && (
                  <motion.div
                    key="contacts"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="w-full flex flex-col h-full min-h-0"
                  >
                    <div className="flex-1 min-h-0" style={{ 
                      overflow: 'hidden'
                    }}>
                      <div className="text-center mb-6">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                          className="text-5xl mb-4"
                        >
                          👨‍💼
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Оставьте контакты для консультации
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Наш менеджер свяжется с вами в течение 15 минут и ответит на все вопросы
                        </p>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleContactSubmit()
                        }}
                        className="space-y-4"
                      >
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ваше имя *
                        </label>
                        <input
                          type="text"
                          required
                          value={selectedOptions.contactData?.name || ''}
                          onChange={(e) =>
                            setSelectedOptions({
                              ...selectedOptions,
                              contactData: {
                                name: e.target.value,
                                phone: selectedOptions.contactData?.phone || '',
                                email: selectedOptions.contactData?.email || '',
                                company: selectedOptions.contactData?.company || '',
                              },
                            })
                          }
                          className="w-full max-w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                          value={selectedOptions.contactData?.phone || ''}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value)
                            setSelectedOptions({
                              ...selectedOptions,
                              contactData: {
                                name: selectedOptions.contactData?.name || '',
                                phone: formatted,
                                email: selectedOptions.contactData?.email || '',
                                company: selectedOptions.contactData?.company || '',
                              },
                            })
                          }}
                          onBlur={(e) => {
                            const digits = getPhoneDigits(e.target.value)
                            if (digits.length >= 11) {
                              const formatted = formatPhoneNumber(digits)
                              setSelectedOptions({
                                ...selectedOptions,
                                contactData: {
                                  name: selectedOptions.contactData?.name || '',
                                  phone: formatted,
                                  email: selectedOptions.contactData?.email || '',
                                  company: selectedOptions.contactData?.company || '',
                                },
                              })
                            }
                          }}
                          className="w-full max-w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="+7 (999) 123-45-67"
                          maxLength={18}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={selectedOptions.contactData?.email || ''}
                          onChange={(e) =>
                            setSelectedOptions({
                              ...selectedOptions,
                              contactData: {
                                name: selectedOptions.contactData?.name || '',
                                phone: selectedOptions.contactData?.phone || '',
                                email: e.target.value,
                                company: selectedOptions.contactData?.company || '',
                              },
                            })
                          }
                          className="w-full max-w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="example@mail.ru"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Компания (необязательно)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={selectedOptions.contactData?.company || ''}
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
                                const currentCompany = selectedOptions.contactData?.company || ''
                                if (lastSearchedINNRef.current === innDigits && currentCompany !== value) {
                                  lastSearchedINNRef.current = ''
                                }
                                
                                if (lastSearchedINNRef.current === innDigits) {
                                  // Уже искали этот ИНН и нашли - не ищем снова
                                  return
                                }
                                
                                // Показываем ИНН во время поиска
                                setSelectedOptions({
                                  ...selectedOptions,
                                  contactData: {
                                    name: selectedOptions.contactData?.name || '',
                                    phone: selectedOptions.contactData?.phone || '',
                                    email: selectedOptions.contactData?.email || '',
                                    company: value,
                                  },
                                })
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
                                      setSelectedOptions((prev) => {
                                        lastSearchedINNRef.current = innDigits
                                        return {
                                          ...prev,
                                          contactData: {
                                            name: prev.contactData?.name || '',
                                            phone: prev.contactData?.phone || '',
                                            email: prev.contactData?.email || '',
                                            company: companyData.name,
                                          },
                                        }
                                      })
                                    } else {
                                      // Если компания не найдена, оставляем ИНН
                                      console.warn('Компания не найдена для ИНН:', innDigits)
                                      setSelectedOptions((prev) => ({
                                        ...prev,
                                        contactData: {
                                          name: prev.contactData?.name || '',
                                          phone: prev.contactData?.phone || '',
                                          email: prev.contactData?.email || '',
                                          company: value,
                                        },
                                      }))
                                      lastSearchedINNRef.current = '' // Сбрасываем, чтобы можно было попробовать снова
                                    }
                                  } catch (error) {
                                    console.error('Ошибка поиска компании:', error)
                                    // При ошибке оставляем то, что ввел пользователь
                                    setSelectedOptions((prev) => ({
                                      ...prev,
                                      contactData: {
                                        name: prev.contactData?.name || '',
                                        phone: prev.contactData?.phone || '',
                                        email: prev.contactData?.email || '',
                                        company: value,
                                      },
                                    }))
                                    lastSearchedINNRef.current = '' // Сбрасываем при ошибке
                                  } finally {
                                    setIsSearchingCompany(false)
                                  }
                                }, 500)
                              } else {
                                // Если это не ИНН, просто обновляем значение
                                setSelectedOptions({
                                  ...selectedOptions,
                                  contactData: {
                                    name: selectedOptions.contactData?.name || '',
                                    phone: selectedOptions.contactData?.phone || '',
                                    email: selectedOptions.contactData?.email || '',
                                    company: value,
                                  },
                                })
                                setIsSearchingCompany(false)
                                lastSearchedINNRef.current = '' // Сбрасываем последний найденный ИНН
                              }
                            }}
                            className="w-full max-w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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

                      <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 mb-4">
                        <div className="text-sm font-semibold text-primary-700 mb-2">
                          📋 Собранная информация:
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>• Сфера: {businessTypes.find(b => b.id === selectedOptions.businessType)?.name}</div>
                          <div>• Потребности: {selectedOptions.needs.length} выбрано</div>
                          <div>• Масштаб: {sizeOptions.find(s => s.id === selectedOptions.size)?.name}</div>
                          <div>• Бюджет: {budgetOptions.find(b => b.id === selectedOptions.budget)?.name}</div>
                          <div>• Подобрано товаров: {recommendedProducts.length}</div>
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        whileHover={{ opacity: 0.9 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all overflow-hidden"
                      >
                        <span className="flex items-center justify-center">
                          Отправить заявку менеджеру
                          <Send className="w-5 h-5 ml-2 flex-shrink-0" />
                        </span>
                      </motion.button>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* QA Step - Режим вопросов-ответов */}
                {currentStep === 'qa' && (
                  <motion.div
                    key="qa"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="w-full flex flex-col h-full min-h-0"
                  >
                    <div className="flex-1 min-h-0 mb-4" style={{ overflow: 'hidden' }}>
                      <div className="space-y-4">
                        {qaMessages.map((msg, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[85%] rounded-2xl p-4 break-words overflow-wrap-anywhere ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                                : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                              {msg.faq && (
                                <div className="mt-2 pt-2 border-t border-primary-300/30">
                                  <button
                                    onClick={() => {
                                      setCurrentStep('business')
                                      setSelectedOptions({ needs: [] })
                                    }}
                                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200 border-b-2 border-primary-600 hover:border-primary-700 pb-0.5 inline-block"
                                  >
                                    Начать подбор решения →
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Быстрые вопросы - показываем после каждого ответа ассистента, обновляются динамически */}
                      {lastAssistantMsg && qaMessages.length > 0 && contextualQuestions.length > 0 && (
                        <div className="mt-4 pb-2">
                          <p className="text-sm text-gray-600 mb-2 font-medium">
                            {qaMessages.length === 1 ? 'Популярные вопросы:' : 'Могу также помочь с:'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {contextualQuestions.slice(0, 4).map((q, i) => (
                              <motion.button
                                key={`${q}-${i}-${qaMessages.length}`}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ opacity: 0.9, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleQuickQuestion(q)}
                                className="text-xs bg-primary-50 text-primary-700 px-3 py-2 rounded-lg border border-primary-200 hover:bg-primary-100 hover:border-primary-300 transition-all break-words"
                              >
                                {q}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input для вопросов */}
                    <div className="flex space-x-2 flex-shrink-0 mt-4">
                      <input
                        type="text"
                        value={qaInput}
                        onChange={(e) => setQaInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleQASubmit()}
                        placeholder="Задайте ваш вопрос..."
                        className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                      <motion.button
                        whileHover={{ opacity: 0.9 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleQASubmit}
                        className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-3 rounded-xl hover:shadow-lg transition-all shadow-md flex-shrink-0 overflow-hidden"
                      >
                        <Send className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {/* Кнопка вернуться к подбору */}
                    {currentStep === 'qa' && (
                      <motion.button
                        whileHover={{ opacity: 0.9 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentStep('business')}
                        className="mt-3 w-full border-2 border-primary-500 text-primary-600 py-2 rounded-xl font-semibold text-sm hover:bg-primary-50 transition-all flex-shrink-0 overflow-hidden"
                      >
                        ← Вернуться к подбору решения
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Form */}
      {showForm && (
        <RequestForm
          businessType={selectedOptions.businessType}
          assistantData={{
            name: selectedOptions.contactData?.name,
            phone: selectedOptions.contactData?.phone,
            email: selectedOptions.contactData?.email,
            company: selectedOptions.contactData?.company,
            selectedProducts: recommendedProducts.map(p => p.name),
            needs: selectedOptions.needs,
            size: selectedOptions.size,
            budget: selectedOptions.budget,
          }}
          onClose={() => {
            setShowForm(false)
            setTimeout(() => {
              resetAssistant()
            }, 500)
          }}
        />
      )}
    </>
  )
}
