'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AssistantContextType {
  isOpen: boolean
  skipWelcome: boolean
  openAssistant: (skipWelcome?: boolean) => void
  closeAssistant: () => void
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined)

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [skipWelcome, setSkipWelcome] = useState(false)

  const openAssistant = (skip = false) => {
    setSkipWelcome(skip)
    setIsOpen(true)
  }

  const closeAssistant = () => {
    setIsOpen(false)
    setSkipWelcome(false)
  }

  return (
    <AssistantContext.Provider value={{ isOpen, skipWelcome, openAssistant, closeAssistant }}>
      {children}
    </AssistantContext.Provider>
  )
}

export function useAssistant() {
  const context = useContext(AssistantContext)
  if (context === undefined) {
    throw new Error('useAssistant must be used within an AssistantProvider')
  }
  return context
}

