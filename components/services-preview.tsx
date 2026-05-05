'use client'

import { ArrowRight } from 'lucide-react'
import { useEnquiry } from '@/app/enquiry-context'
import Link from 'next/link'
import { Card } from '@/components/ui/card'

const services = [
  {
    id: 'mechanical-design',
    title: 'Mechanical Design',
    description: 'Advanced mechanical engineering solutions including CAD design and FEA analysis.',
    featured: false,
  },
  {
    id: 'surface-cylindrical-grinding',
    title: 'Surface & Cylindrical Grinding',
    description: 'Precision grinding for achieving component excellence with tight tolerances.',
    featured: true,
  },
  {
    id: 'structural-analysis',
    title: 'Structural Analysis',
    description: 'Comprehensive structural engineering services for buildings and infrastructure.',
    featured: false,
  },
  {
    id: 'manufacturing-optimization',
    title: 'Manufacturing Optimization',
    description: 'Process improvement and automation solutions to enhance production efficiency.',
    featured: false,
  },
  {
    id: 'Blading Solutions',
    title: 'Blading Solutions',
    description: 'Specialized blade design and optimization for turbomachinery applications.',
    featured: false,
  },
  {
    id: 'Reconditioning Services',
    title: 'Reconditioning Services',
    description: 'Expert overhaul and restoration of industrial components to OEM standards, extending equipment lifespan',
    featured: false,
  },
  {
    id: '3-Axis Precision Machining',
    title: '3-Axis Precision Machining',
    description: 'Advanced machining services for producing complex components with high accuracy and surface finish.',
    featured: false,
  },
  {
    id: 'Custom solutions',
    title: 'Custom solutions',
    description: 'Specialized fabrication of unique machine components tailored to exact technical specifications.',
    featured: false,
  },
]

export function ServicesPreview() {
  const { setIsModalOpen, setSelectedService } = useEnquiry()

  const handleEnquire = (serviceName: string) => {
    setSelectedService(serviceName)
    setIsModalOpen(true)
  }

  return (
    <section id="services" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-foreground/60 text-lg">
              Specialized engineering solutions across multiple domains
            </p>
          </div>
          <Link
            href="/services"
            className="hidden md:flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition"
          >
            View All <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className={`${service.featured ? 'lg:col-span-2 md:col-span-2' : ''} h-full`}
            >
              <Card
                className={`p-6 transition duration-300 cursor-pointer group relative overflow-hidden h-full flex flex-col ${
                  service.featured
                    ? 'card-accent-highlight card-shadow-premium industrial-texture lg:flex-row lg:items-center'
                    : 'border-border bg-card hover:bg-card/80 card-shadow-premium industrial-texture'
                }`}
              >
                {service.featured && (
                  <div className="absolute top-0 right-[10px] z-10
                    bg-[#002F64] text-white
                    text-sm font-semibold
                    px-4 py-2
                    rounded-[5px]
                    border border-[#002F64]">
                    Experties
                  </div>
                )}
                <div className={`${service.featured ? 'flex-1' : ''} flex flex-col justify-between h-full w-full`}>
                  <h3
                    className={`${
                      service.featured ? 'text-2xl md:text-3xl' : 'text-xl'
                    } font-semibold text-foreground mb-3 group-hover:text-primary transition`}
                  >
                    {service.title}
                  </h3>
                  <p
                    className={`${
                      service.featured ? 'text-foreground/70 text-base' : 'text-foreground/70'
                    } mb-6 flex-grow`}
                  >
                    {service.description}
                  </p>
                  <button
                    onClick={() => handleEnquire(service.title)}
                    className={`${
                      service.featured
                        ? 'bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 font-semibold transition'
                        : 'text-primary font-semibold text-sm hover:text-primary/80 transition'
                    } inline-flex items-center gap-2`}
                  >
                    {service.featured ? 'Learn More & Enquire' : 'Enquire Now'} →
                  </button>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition"
          >
            View All Services <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
