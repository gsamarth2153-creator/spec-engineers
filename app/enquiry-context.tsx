'use client'

import React, { createContext, useContext, useState } from 'react'

interface EnquiryContextType {
  isModalOpen: boolean
  selectedService: string
  setIsModalOpen: (open: boolean) => void
  setSelectedService: (service: string) => void
}

const EnquiryContext = createContext<EnquiryContextType | undefined>(undefined)

export function EnquiryProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState('')

  return (
    <EnquiryContext.Provider
      value={{ isModalOpen, selectedService, setIsModalOpen, setSelectedService }}
    >
      {children}
    </EnquiryContext.Provider>
  )
}

export function useEnquiry() {
  const context = useContext(EnquiryContext)
  if (!context) {
    throw new Error('useEnquiry must be used within EnquiryProvider')
  }
  return context
}
