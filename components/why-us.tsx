'use client'

import { Card } from '@/components/ui/card'

const reasons = [
  {
    number: '1',
    title: 'Technical Expertise',
    description: 'Our team comprises experienced engineers with deep knowledge across multiple disciplines and industries.',
  },
  {
    number: '2',
    title: 'Innovation Focus',
    description: 'We leverage cutting-edge technologies and methodologies to deliver forward-thinking solutions.',
  },
  {
    number: '3',
    title: 'Proven Track Record',
    description: 'Decades of successful projects delivering measurable value to clients worldwide.',
  },
  {
    number: '4',
    title: 'Client-Centric Approach',
    description: 'We prioritize understanding your unique challenges and delivering customized solutions.',
  },
  {
    number: '5',
    title: 'Quality Assurance',
    description: 'Rigorous testing and validation processes ensure all deliverables meet the highest standards.',
  },
  {
    number: '6',
    title: 'Dedicated Support',
    description: 'Continuous collaboration and post-delivery support to ensure long-term success.',
  },
]

export function WhyUs() {
  return (
    <section id="why-us" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Why Choose SPEC ENGINEERS</h2>
          <p className="text-lg text-foreground/70">
            Trusted partner for engineering excellence and innovation
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason) => (
            <Card
              key={reason.number}
              className="p-6 border-border bg-card relative overflow-hidden hover:shadow-lg transition duration-200"
            >
              <div className="absolute -right-8 -top-8 text-6xl font-bold text-primary/10">{reason.number}</div>
              <h3 className="text-lg font-semibold text-foreground mb-3 relative z-10">{reason.title}</h3>
              <p className="text-foreground/70 relative z-10">{reason.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
