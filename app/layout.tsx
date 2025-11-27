import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AssistantProvider } from '@/contexts/AssistantContext'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/contexts/ToastContext'
import AssistantWrapper from '@/components/AssistantWrapper'
import Cart from '@/components/Cart'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'WorldCashbox - Автоматизация бизнес-процессов',
  description: 'Современные решения для автоматизации бизнеса. POS-терминалы, кассовое оборудование, программное обеспечение.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AssistantProvider>
          <ToastProvider>
            <CartProvider>
              <Header />
              <main>{children}</main>
              <Footer />
              <AssistantWrapper />
              <Cart />
            </CartProvider>
          </ToastProvider>
        </AssistantProvider>
      </body>
    </html>
  )
}

