'use client'

import { Card } from '@/components/ui/card'

const industries = [
  {
    name: 'Manufacturing',
    description: 'Process automation, quality control systems, and production optimization',
  },
  {
    name: 'Automotive',
    description: 'Vehicle design, powertrain engineering, and safety systems development',
  },
  {
    name: 'Aerospace',
    description: 'Aircraft systems, avionics, and aerodynamic analysis for commercial and defense sectors',
  },
  {
    name: 'Energy',
    description: 'Power generation, renewable energy integration, and grid infrastructure solutions',
  },
  {
    name: 'Infrastructure',
    description: 'Civil structures, transportation systems, and urban development projects',
  },
  {
    name: 'Technology',
    description: 'Hardware integration, IoT systems, and industrial automation technologies',
  },
]

export function Industries() {
  return (
    <section id="industries" className="py-20 md:py-32 bg-card/30 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Industries We Serve</h2>
          <p className="text-lg text-foreground/70">
            Deep expertise across multiple sectors with proven track record of success
          </p>
        </div>
        

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry) => (
            <Card
              key={industry.name}
              className="p-6 border-border bg-background hover:bg-primary/5 transition duration-200"
            >
              <h3 className="text-xl font-semibold text-primary mb-3">{industry.name}</h3>
              <p className="text-foreground/70">{industry.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
