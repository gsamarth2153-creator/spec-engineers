'use client'

import { ArrowRight } from 'lucide-react'
import { useEnquiry } from '@/app/enquiry-context'
import Link from 'next/link'
import { AnimatedText } from '@/components/AnimatedText'

const servicesDetail = [
  {
    id: 'mechanical-design',
    title: 'Mechanical Design',
    shortDescription: 'Advanced mechanical engineering solutions',
    fullDescription: `Deliver innovative mechanical solutions from concept through detailed engineering using advanced CAD and finite element analysis. Achieve optimal balance of performance, manufacturability, and cost-effectiveness.
• Advanced CAD & Finite Element Analysis
• Design Optimization & Validation
• Multi-Industry Expertise & Applications
• Performance & Manufacturability Balance`,
    image: "/Mechanical Design-2.jpg" ,
  },
  {
    id: 'surface-cylindrical-grinding',
    title: 'Surface & Cylindrical Grinding',
    shortDescription: 'Precision grinding for component excellence',
    fullDescription: `Achieve exceptional precision and surface finish for high-performance applications with tight tolerances. Deliver superior quality and reliability critical for demanding components and OEM specifications.
• Ra 0.4 Microinch Surface Finishes
• ±0.0001 Inch Tolerance Precision
• Metallurgical Expertise & Heat Prevention
• Bearing, Shaft & Automotive Applications`,
    image: '/grinding.jpg'
  },
  {
    id: 'structural-analysis',
    title: 'Structural Analysis',
    shortDescription: 'Engineering services for buildings and infrastructure',
    fullDescription: `Engineer safe and efficient structures that meet all building codes and industry standards. Combine traditional engineering principles with modern computational analysis for reliability.
• Advanced FEA Software & Analysis
• Steel, Concrete & Composite Design
• Seismic & Load Scenario Evaluation
• Comprehensive 3D Visualization & Reports`,
    image: '/Structural.jpeg',
  },
  {
    id: 'manufacturing-optimization',
    title: 'Manufacturing Optimization',
    shortDescription: 'Process improvement and automation solutions',
    fullDescription: `Maximize production efficiency and reduce costs through comprehensive facility assessment and strategic improvement identification. Develop practical, implementable solutions to eliminate bottlenecks and increase throughput.
• Process Flow & Equipment Analysis
• Lean Manufacturing Implementation
• Automation & Throughput Optimization
• ROI Projections & Implementation Plans`,
    image: 'OPTIMIZATION.jpg',
  },
  {
    id: 'blading-solutions',
    title: 'Blading Solutions',
    shortDescription: 'Precision engineering for turbine and compressor blades',
    fullDescription: `Optimize turbine and compressor blade performance using advanced computational fluid dynamics and rigorous structural analysis. Ensure optimal efficiency, durability and reliability in mission-critical applications.
• Computational Fluid Dynamics (CFD) Analysis
• Thermal Modeling & Simulation
• Structural Performance & Durability
• Optimization for Efficiency & Cost`,
    image: '/blading.jpg',
  },
  {
    id: 'reconditioning-services',
    title: 'Reconditioning Services',
    shortDescription: 'Equipment restoration and modernization solutions',
    fullDescription: `Extend equipment lifespan and improve performance through comprehensive restoration and modernization solutions. Refurbish machinery to current standards while providing cost-effective alternatives to new purchases.
• Detailed Assessment & Disassembly
• Component Repair & Replacement
• Testing & Final Commissioning
• Performance Verification & Quality Assurance`,
    image: '/Reconditioning.jpg',
  },
  {
    id: '3-axis-precision-machining',
    title: '3-Axis Precision Machining',
    shortDescription: 'High-precision machining services for complex components',
    fullDescription: `Deliver exceptional accuracy and complex geometries using state-of-the-art CNC machines and advanced tooling strategically. Achieve tight tolerances and superior surface finish for intricate components.
• Advanced CNC Technology & Tooling
• Complex Geometry & Tight Tolerance Precision
• Multi-Industry Component Machining
• Quality Assurance & Inspection Standards`,
    image: '/3axis.jpg',
  },
  {
    id: 'custom-solutions',
    title: 'Custom Solutions',
    shortDescription: 'Tailored engineering services for unique applications',
    fullDescription: `Develop innovative engineering solutions tailored to your unique application requirements and challenges. Partner closely with clients for customized support across diverse industries and applications.
• Customized Engineering Design & Development
• Application-Specific Problem Solving
• Client Collaboration & Requirements Analysis
• Industry-Specific Expertise & Solutions`,
    image: '/custom.jpg',
  },
]
const serviceImages = [
  "/services/mechanical Design-2.jpg",
  "/services/grinding.jpg",
  "/services/structural.jpg",
  "/services/optimization.jpg",
  "/services/reconditioning.jpg",
  "/services/3-axis.jpg",
  "/services/custom.jpg",
];
export default function ServicesPage() {
  const { setIsModalOpen, setSelectedService } = useEnquiry()

  const handleEnquire = (serviceName: string) => {
    setSelectedService(serviceName)
    setIsModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedText delay={0.2}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Premium Engineering Services
            </h1>
          </AnimatedText>

          <AnimatedText delay={0.4}>
            <p className="text-xl text-primary-foreground/80">
              We deliver tailored design, analysis and manufacturing solutions with precision, speed and reliability.
            </p>
          </AnimatedText>
        </div>
      </div>

      {/* Services List */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-16">
          {servicesDetail.map((service, index) => (
            <div
              id={service.id}
              key={service.id}
              className={`scroll-mt-24 flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-8 items-center pb-16 border-b border-border last:border-b-0 last:pb-0`}
            >
              {/* Image Placeholder */}
              <div className="w-full lg:w-1/2 flex-shrink-0">
                <div className="bg-gradient-to-br from-secondary to-accent rounded-lg aspect-video flex items-center justify-center card-shadow-premium">
                  <div className="text-center">
                    <img
                    src={Array.isArray(service.image) ? service.image[0] : service.image}
                      alt={service.title}
                    className="w-full h-full object-cover rounded-lg"
                    />                    
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="w-full lg:w-1/2">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  {service.title}
                </h2>
                <p className="text-foreground/70 text-lg leading-relaxed mb-6 whitespace-pre-wrap">
                  {service.fullDescription}
                </p>
                <button
                  onClick={() => handleEnquire(service.title)}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 font-semibold transition inline-flex items-center gap-2"
                >
                  Enquire About This Service <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-secondary/10 py-12 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Don&apos;t see what you&apos;re looking for?
          </h2>
          <p className="text-foreground/70 mb-6">
            Contact us to discuss your specific engineering needs
          </p>
          <button
            onClick={() => {
              setSelectedService('')
              setIsModalOpen(true)
            }}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 font-semibold transition"
          >
            Get in Touch
          </button>
        </div>
      </div>
    </main>
  )
}
