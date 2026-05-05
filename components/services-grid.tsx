'use client'

import { useEnquiry } from '@/app/enquiry-context'
import { Card } from '@/components/ui/card'

const services = [
  {
    id: 'mechanical-design',
    title: 'Mechanical Design',
    description: 'Advanced mechanical engineering solutions including CAD design, FEA analysis, and prototyping for complex systems.',
  },
  {
    id: 'structural-analysis',
    title: 'Structural Analysis',
    description: 'Comprehensive structural engineering services for buildings, bridges, and industrial infrastructure with safety-first approach.',
  },
  {
    id: 'manufacturing-optimization',
    title: 'Manufacturing Optimization',
    description: 'Process improvement and automation solutions to enhance production efficiency and reduce costs.',
  },
  {
    id: 'thermal-systems',
    title: 'Thermal Systems',
    description: 'HVAC design, heat transfer analysis, and thermal management solutions for optimal performance.',
  },
  {
    id: 'electrical-systems',
    title: 'Electrical Systems',
    description: 'Power systems design, electrical safety analysis, and renewable energy integration services.',
  },
  {
    id: 'project-management',
    title: 'Project Management',
    description: 'End-to-end project oversight ensuring timely delivery and budget compliance across all engineering initiatives.',
  },
]

export function ServicesGrid() {
  const { setIsModalOpen, setSelectedService } = useEnquiry()

  const handleEnquire = (serviceName: string) => {
    setSelectedService(serviceName)
    setIsModalOpen(true)
  }

  return (
    <section id="services" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Our Services</h2>
          <p className="text-lg text-foreground/70">
            Comprehensive engineering solutions tailored to your industry needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              className="p-6 hover:shadow-lg transition duration-200 border-border bg-card hover:bg-card/80 cursor-pointer group"
            >
              <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition">
                {service.title}
              </h3>
              <p className="text-foreground/70 mb-6">{service.description}</p>
              <button
                onClick={() => handleEnquire(service.title)}
                className="text-primary font-semibold text-sm hover:text-primary/80 transition inline-flex items-center gap-2"
              >
                Enquire Now →
              </button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
