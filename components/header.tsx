'use client'

import Link from 'next/link'
import { useEnquiry } from '@/app/enquiry-context'

export function Header() {
  const { setIsModalOpen, setSelectedService } = useEnquiry()

  const handleContact = () => {
    setSelectedService('')
    setIsModalOpen(true)
  }

  return (
    
    <header className="w-full sticky top-0 z-40 bg-background border-b border-border">
      <nav className="container max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <Link href="/" className="text-4xl font-bold text-primary tracking-tight ">
          SPEC ENGINEERS
        </Link>
        <ul className="flex gap-6 items-center justify-center md:justify-end">
          <li>
            <Link href="/services" className="text-m md:text-base whitespace-nowrap text-foreground hover:text-primary transition">
              Services
            </Link>
          </li>
          <li>
            <Link href="/industries" className="text-m md:text-base whitespace-nowrap text-foreground hover:text-primary transition">
              Industries
            </Link>
          </li>
          <li>
            <Link href="/why-us" className="text-m md:text-base whitespace-nowrap text-foreground hover:text-primary transition">
              Why Us
            </Link>
          </li>
          <li>
            <button
              onClick={handleContact}
              className="hidden md:inline-flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition font-semibold"
            >
              Contact
            </button>
          </li>
        </ul>
      </nav>
    </header>
  )
}
