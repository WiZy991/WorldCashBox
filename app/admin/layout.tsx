'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Если пользователь аутентифицирован и находится на странице логина, редиректим на админку
    if (pathname === '/admin/login' && !isLoading && isAuthenticated) {
      router.replace('/admin')
      return
    }
    
    // Если пользователь не аутентифицирован и не на странице логина, редиректим на логин
    if (pathname !== '/admin/login' && !isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, isLoading, router, pathname])

  // Для страницы логина просто возвращаем children без проверки
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  )
}
