'use client'

import { ArrowRight } from 'lucide-react'
import { useEnquiry } from '@/app/enquiry-context'
import Link from 'next/link'  
import { AnimatedText } from '@/components/AnimatedText'
import { Industries } from '@/components/industries'

const industriesDetail = [
  {
    id: 'manufacturing',
    title: 'Manufacturing',
    shortDescription: 'Industrial production expertise',
    fullDescription: `Maximize production efficiency and cost-effectiveness across all manufacturing scales through lean principles and continuous improvement. Achieve competitive advantage with advanced process optimization.
• Lean Manufacturing & Continuous Improvement
• Custom Equipment Design & Integration
• Quality Assurance & Cost Efficiency Systems
• Automation & Facility Modernization`,
    icon: '🏭',
    image: "/Industries/manufacturing.jpg",
  },
  {
    id: 'automotive',
    title: 'Automotive',
    shortDescription: 'Precision engineering for vehicle systems',
    fullDescription: `Accelerate automotive development with IATF-compliant precision engineering and rigorous analysis. Meet performance targets and cost objectives from concept through production launch.
• Component Design & Systems Integration
• IATF Standards & Quality Compliance
• Design for Manufacturing (DFM) & FMEA Analysis
• Fatigue Analysis & Performance Verification`,
    icon: '🚗',
    image: "/Industries/Automotive.jpg",
  },
  {
    id: 'metal-processing-and-fabrication',
    title: 'Metal Processing & Fabrication',
    shortDescription: 'Specialized services for metalworking and fabrication projects',
    fullDescription: `Engineer superior precision and reliability through advanced fatigue analysis and stress evaluation. Optimize efficiency in high-demand applications while maintaining cost effectiveness.
• Precision Cutting, Forming & Welding Optimization
• Fatigue & Stress Analysis
• Advanced Material Selection & Performance
• Process Optimization & Cost Control`,
    icon: '⚙️',
    image: "/Industries/PROCESSING.jpg"
  },
  {
    id: 'paper-industry',
    title: 'Paper Industry',
    shortDescription: 'Specialized solutions for paper manufacturing and processing',
    fullDescription: `Minimize mill downtime and maximize efficiency through optimized pulp processing and equipment design. Reduce maintenance costs while extending equipment lifespan.
• Paper Machine Design & Process Optimization
• Pulp Processing Equipment Engineering
• Equipment Reliability Analysis & Performance
• Maintenance Cost Reduction & Efficiency`,
    icon: '📄',
    image: "/Industries/PAPER.jpg",
  },
  {
    id: 'plastics-and-recycling',
    title: 'Plastics & Recycling',
    shortDescription: 'Specialized solutions for plastic manufacturing and recycling processes',
    fullDescription: `Modernize recycling systems and injection molding workflows with advanced process engineering solutions. Drive sustainability goals and improve cost efficiency across operations.
• Injection Molding & Extrusion System Design
• Recycling Equipment Process Optimization
• Material Flow Analysis & Cost Control
• Automation & Sustainability Solutions`,
    icon: '♺',
    image: "/Industries/PLASTICS.jpg",
  },
  {
    id: 'corrugated-industry',
    title: 'Corrugated Industry',
    shortDescription: 'Specialized solutions for corrugated board manufacturing and processing',
    fullDescription: `Maximize board quality and production throughput with precision-engineered line solutions and optimization. Reduce waste and improve cost efficiency throughout operations.
• Production Line Design & Optimization
• Printing Equipment Engineering & Performance
• Quality Control & Process Consistency Systems
• Throughput Maximization & Waste Reduction`,
    icon: '📦',
    image: "/Industries/CORRUGATED.jpg",
  },
  {
    id: 'textile-and-fiber industry',
    title: 'Textile and Fiber Industry',
    shortDescription: 'Specialized solutions for textile and fiber manufacturing and processing',
    fullDescription: `Enhance mill efficiency and fiber consistency through integrated machinery design and optimization. Maximize throughput and quality with advanced engineering solutions.
• Textile Machinery Design & Integration
• Fiber Processing Equipment Optimization
• Production Efficiency & Process Optimization
• Quality Consistency & Operational Reliability`,
    icon: '🧵',
    image: "/Industries/TEXTILE.jpg",
  },
  
]

export default function IndustriesPage() {
  const { setIsModalOpen, setSelectedService } = useEnquiry()

  const handleEnquire = (industryName: string) => {
    setSelectedService(`Inquiry for ${industryName}`)
    setIsModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedText delay={0.2}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Industries We Serve</h1>
          </AnimatedText>
          <AnimatedText delay={0.4}>
            <p className="text-xl text-primary-foreground/80">
              Specialized expertise across diverse industrial sectors
            </p>
          </AnimatedText>
        </div>
      </div>

      {/* Industries List */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-16">
          {industriesDetail.map((industry, index) => (
            <AnimatedText key={industry.id} delay={0.1 + index * 0.1}>
              <div
                id={industry.id}
                className={`scroll-mt-24 flex flex-col ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } gap-8 items-center pb-16 border-b border-border last:border-b-0 last:pb-0`}
              >
              {/* Image */}
              <div className="w-full lg:w-1/2 flex-shrink-0">
                <div className="bg-gradient-to-br from-secondary to-accent rounded-lg aspect-video flex items-center justify-center card-shadow-premium">
                  <div className="text-center w-full h-full">
                    <img
                      src={industry.image}
                      alt={industry.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="w-full lg:w-1/2">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  {industry.title}
                </h2>
                <p className="text-foreground/70 text-lg leading-relaxed mb-6 whitespace-pre-wrap">
                  {industry.fullDescription}
                </p>
                <button
                  onClick={() => handleEnquire(industry.title)}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 font-semibold transition inline-flex items-center gap-2"
                >
                  Learn More <ArrowRight size={18} />
                </button>                
                </div>
              </div>
            </AnimatedText>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-secondary/10 py-12 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedText delay={0.2}>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Need engineering expertise in your industry?
            </h2>
          </AnimatedText>
          <AnimatedText delay={0.35}>
            <p className="text-foreground/70 mb-6">
              Let&apos;s discuss how SPEC ENGINEERS can support your business
            </p>
          </AnimatedText>
          <AnimatedText delay={0.5}>
            <button
              onClick={() => {
                setSelectedService('')
                setIsModalOpen(true)
              }}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 font-semibold transition"
            >
              Start a Conversation
            </button>
          </AnimatedText>
        </div>
      </div>
    </main>
  )
}
