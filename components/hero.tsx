'use client'

import { useEnquiry } from '@/app/enquiry-context'
import { AnimatedText } from '@/components/AnimatedText'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Hero() {
  const { setIsModalOpen, setSelectedService } = useEnquiry()

  const handleEnquire = () => {
    setSelectedService('')
    setIsModalOpen(true)
  }

  return (
    <section className="relative overflow-hidden">

  {/* Background Image */}
  <div className="absolute inset-0">
    <img
      src="/Hero-photo.jpg" // 👈 your real image
      alt="Manufacturing unit"
      className="w-full h-full object-cover"
    />

    {/* Dark gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />

    {/* Optional blur (subtle) */}
    <div className="absolute inset-0 backdrop-blur-[1px]" />
  </div>

  {/* Content */}
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
    
    <div className="max-w-2xl">

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
        Precision Engineering Solutions for Modern Industry
      </h1>

      <p className="mt-6 text-lg text-gray-200">
        From design to manufacturing optimization, we help industries
        build smarter, faster, and more efficiently.
      </p>

      <p className="mt-4 text-sm text-gray-300">
        Mechanical Design • Structural Analysis • Precision Manufacturing
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button
          variant="default"
          size="lg"
          onClick={handleEnquire}
          className="bg-primary text-primary-foreground 
          px-8 py-6 text-2xl 
          rounded-lg font-semibold 
          transform transition-all duration-300 ease-out 
          hover:scale-105 hover:-translate-y-1 hover:shadow-2xl 
          active:scale-95"
        >
          Get a Quote
        </Button>
      
        <Button
          variant="secondary"
          size="lg"
          asChild
          className="px-8 py-4 text-lg 
          rounded-lg 
          transform transition-all duration-300 ease-out 
          hover:scale-105 hover:-translate-y-1 hover:shadow-xl 
          active:scale-95"
        >
         <Link href="/services">Services</Link>
        </Button>
      </div>

    </div>
  </div>
</section>
  )
}
