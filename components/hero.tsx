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
    <section className="relative py-24 md:py-40 bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <AnimatedText delay={0.6}>
            <h1 className="text-4xl md:text-6xl font-bold text-balance text-foreground mb-6">
              Engineering Excellence for Tomorrow&apos;s Challenges
            </h1>
          </AnimatedText>
          <AnimatedText>
            <p className="text-lg md:text-xl text-foreground/80 text-balance mb-8">
              SPEC ENGINEERS delivers innovative consulting and design solutions across manufacturing, automotive, aerospace, energy, and infrastructure sectors.
            </p>
          </AnimatedText>
          <button
            onClick={handleEnquire}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition duration-200 inline-block"
          >
            Get Started
          </button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/services" className="rounded-full">Services</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
