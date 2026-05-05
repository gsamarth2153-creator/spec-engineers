'use client'

import { ArrowRight } from 'lucide-react'
import { useEnquiry } from '@/app/enquiry-context'
import Link from 'next/link'
import { Card } from '@/components/ui/card'

const industries = [
  {
    id: 'manufacturing',
    title: 'Manufacturing',
    description: 'Industrial production expertise with process optimization and automation solutions.',
    icon: '🏭',
  },
  {
    id: 'automotive',
    title: 'Automotive',
    description: 'Precision engineering for vehicle systems and component manufacturing.',
    icon: '🚗',
  },
  {
    id: 'Metal Processing & Fabrication',
    title: 'Metal Processing & Fabrication',
    description: 'Specialized services for metalworking and fabrication projects.',
    icon: '⚙️',
  },
  {
    id: 'Paper Industry',
    title: 'Paper Industry',
    description: 'Specialized solutions for paper manufacturing and processing.',
    icon: '📄',
  },
  {
    id: 'Plastics & Recycling',
    title: 'Plastics & Recycling',
    description: 'Specialized solutions for plastic manufacturing and recycling processes.',
    icon: '♺',
  },
  {
    id: 'Corrugated Industry',
    title: 'Corrugated Industry',
    description: 'Specialized solutions for corrugated board manufacturing and processing.',
    icon: '📦',
  },
  {
    id: 'Textile & Fiber Industry',
    title: 'Textile & Fiber Industry',
    description: 'Specialized solutions for textile and fiber manufacturing processes.',
    icon: '🧵',
  },
]

export function IndustriesPreview() {
  const { setIsModalOpen, setSelectedService } = useEnquiry()

  const handleLearnMore = (industryName: string) => {
    setSelectedService(`Inquiry for ${industryName}`)
    setIsModalOpen(true)
  }

  return (
    <section id="industries" className="py-16 bg-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Industries We Serve
            </h2>
            <p className="text-foreground/60 text-lg">
              Specialized expertise across diverse industrial sectors
            </p>
          </div>
          <Link
            href="/industries"
            className="hidden md:flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition"
          >
            View All <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry) => (
            <Card
              key={industry.id}
              className="p-6 card-shadow-premium industrial-texture border-border bg-card hover:bg-card/80 transition duration-300 group cursor-pointer"
            >
              <div className="text-4xl mb-4">{industry.icon}</div>
              <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition">
                {industry.title}
              </h3>
              <p className="text-foreground/70 mb-6">{industry.description}</p>
              <Link
                href="/industries"
                className="text-primary font-semibold text-sm hover:text-primary/80 transition inline-flex items-center gap-2"
              >
                Learn More →
              </Link>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/industries"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition"
          >
            View All Industries <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
