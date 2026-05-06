'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export function LayoutAnimation({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}