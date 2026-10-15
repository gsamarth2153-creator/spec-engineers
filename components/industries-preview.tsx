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
    tags: ['Lean Production', 'Process Automation'],
  },
  {
    id: 'automotive',
    title: 'Automotive',
    description: 'Precision engineering for vehicle systems and component manufacturing.',
    icon: '🚗',
    tags: ['Component Design', 'IATF Compliance'],
  },
  {
    id: 'Metal Processing & Fabrication',
    title: 'Metal Processing & Fabrication',
    description: 'Specialized services for metalworking and fabrication projects.',
    icon: '⚙️',
    tags: ['Stress Analysis', 'Custom Fabrication'],
  },
  {
    id: 'Paper Industry',
    title: 'Paper Industry',
    description: 'Specialized solutions for paper manufacturing and processing.',
    icon: '📄',
    tags: ['Machine Design', 'Pulp Processing'],
  },
  {
    id: 'Plastics & Recycling',
    title: 'Plastics & Recycling',
    description: 'Specialized solutions for plastic manufacturing and recycling processes.',
    icon: '♺',
    tags: ['Injection Molding', 'Sustainability'],
  },
  {
    id: 'Corrugated Industry',
    title: 'Corrugated Industry',
    description: 'Specialized solutions for corrugated board manufacturing and processing.',
    icon: '📦',
    tags: ['Line Optimization', 'Quality Control'],
  },
  {
    id: 'Textile & Fiber Industry',
    title: 'Textile & Fiber Industry',
    description: 'Specialized solutions for textile and fiber manufacturing processes.',
    icon: '🧵',
    tags: ['Machinery Design', 'Fiber Processing'],
  },
]

export function IndustriesPreview() {
  const { setIsModalOpen, setSelectedService } = useEnquiry()

  const handleLearnMore = (industryName: string) => {
    setSelectedService(`Inquiry for ${industryName}`)
    setIsModalOpen(true)
  }

  return (
    <section id="industries" className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 opacity-80">
        <img src="/Industry.jpg" className="w-full h-full object-cover" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between mb-12 p-8 rounded-2xl backdrop-blur-lg bg-white/60 border border-white/20 shadow-lg">
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

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
          {industries.map((industry) => (
            <Card
              key={industry.id}
              className="p-3.5 sm:p-5 md:p-6 lg:p-7 card-shadow-premium industrial-texture border-border bg-card hover:bg-card/90 transition-all duration-300 group cursor-pointer flex flex-col justify-between h-full gap-0 relative overflow-hidden hover:shadow-xl hover:-translate-y-1.5"
            >
              {/* Subtle background icon watermark */}
              <div className="absolute -right-2 -bottom-2 text-6xl sm:text-8xl md:text-9xl select-none opacity-[0.06] group-hover:opacity-[0.14] group-hover:scale-110 transition-all duration-500 pointer-events-none">
                {industry.icon}
              </div>

              <div>
                {/* Large Logo / Icon Container */}
                <div className="flex items-start justify-between mb-3 sm:mb-5">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border border-primary/25 flex items-center justify-center text-2xl sm:text-4xl md:text-5xl shadow-sm group-hover:scale-105 group-hover:border-primary/45 group-hover:shadow-md transition-all duration-300">
                    <span className="leading-none drop-shadow-sm">{industry.icon}</span>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] md:text-[11px] font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full border border-primary/20 shadow-xs">
                    Industry
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-lg md:text-2xl font-bold text-foreground mb-1.5 sm:mb-2 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                  {industry.title}
                </h3>

                {/* Capability tags */}
                <div className="hidden sm:flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3.5">
                  {industry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] md:text-xs font-medium text-foreground/75 bg-muted/80 px-1.5 sm:px-2.5 py-0.5 rounded border border-border/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-foreground/75 text-xs sm:text-sm md:text-base leading-snug sm:leading-relaxed mb-3 sm:mb-6 line-clamp-2 sm:line-clamp-3 md:line-clamp-none">
                  {industry.description}
                </p>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-2.5 sm:pt-4 border-t border-border/80 flex items-center justify-between mt-auto">
                <Link
                  href="/industries"
                  className="text-primary font-semibold text-xs sm:text-sm hover:text-primary/80 transition inline-flex items-center gap-1 sm:gap-2 group-hover:translate-x-0.5"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-[9px] sm:text-[11px] font-medium text-foreground/40 uppercase tracking-widest">
                  SPEC
                </span>
              </div>
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
