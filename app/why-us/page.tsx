'use client'

import { AnimatedText } from '@/components/AnimatedText'
import { CheckCircle, Award, Users, Zap } from 'lucide-react'
import { useEnquiry } from '@/app/enquiry-context'

const whyUsPoints = [
  {
    icon: Award,
    title: 'Industry-Leading Expertise',
    description:
      'Our team brings decades of combined experience across manufacturing, automotive, aerospace, energy, and infrastructure sectors. We understand industry-specific challenges and deliver solutions that meet the highest standards.',
  },
  {
    icon: Users,
    title: 'Collaborative Partnership',
    description:
      'We view every client as a strategic partner. Our collaborative approach ensures your vision guides the project, with regular communication and transparent progress updates throughout every phase.',
  },
  {
    icon: Zap,
    title: 'Innovation & Technology',
    description:
      'We invest in cutting-edge engineering software and tools to deliver optimized solutions. Our commitment to continuous learning keeps us at the forefront of industry advancements.',
  },
  {
    icon: CheckCircle,
    title: 'Quality & Precision',
    description:
      'Every project receives meticulous attention to detail. We maintain rigorous quality standards and conduct comprehensive verification and validation to ensure deliverables exceed expectations.',
  },
]

const aboutPoints = [
  {
    title: 'Founded on Engineering Excellence',
    content:
      'SPEC ENGINEERS was established with a mission to deliver world-class engineering solutions to companies seeking to innovate, optimize, and grow. Our founders brought together a team of talented engineers passionate about solving complex technical challenges.',
  },
  {
    title: 'Commitment to Client Success',
    content:
      'We measure our success by the success of our clients. Whether you\'re launching a new product, optimizing existing processes, or transforming your operations, we commit to delivering measurable results and long-term value.',
  },
  {
    title: 'Versatile Expertise',
    content:
      'Our multidisciplinary team spans mechanical engineering, structural analysis, thermal management, electrical systems, and manufacturing optimization. This breadth enables us to tackle complex, cross-functional challenges with integrated solutions.',
  },
  {
    title: 'Proven Track Record',
    content:
      'We\'ve successfully delivered hundreds of engineering projects, from component design to facility optimization. Our portfolio includes work with Fortune 500 companies, innovative startups, and government agencies across diverse industries.',
  },
]

export default function WhyUsPage() {
  const { setIsModalOpen, setSelectedService } = useEnquiry()

  const handleEnquire = () => {
    setSelectedService('')
    setIsModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedText delay={0.2}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Why Choose SPEC ENGINEERS</h1>
          </AnimatedText>

          <AnimatedText delay={0.4}>
            <p className="text-xl text-primary-foreground/80">
              We combine technical excellence with collaborative partnership
            </p>
          </AnimatedText>
        </div>
      </div>

      {/* Why Us Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-12">Our Core Strengths</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {whyUsPoints.map((point, index) => (
            <AnimatedText key={point.title ?? index} delay={0.55 + index * 0.05}>
              <section
                className="card-shadow-premium hover:shadow-xl transition-shadow duration-300 industrial-texture bg-card p-8 rounded-lg border border-border hover:border-primary/50 transition"
              >
                <div className="flex items-start h-46 gap-4">
                  <div className="flex-shrink-0">
                    <point.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {point.title}
                    </h3>
                    <p className="text-foreground/70 leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              </section>
            </AnimatedText>
          ))}
        </div>
      </div>

      {/* About Us Section */}
      <section className="relative overflow-hidden py-5 border-t border-border ">
        <div className="absolute inset-0 opacity-[50]">
          <img
            src="/about-bg.jpg"
            alt="Engineering blueprint background"
            className="w-full h-full object-cover"
          />
        </div>
         {/* Soft Overlay */}
        <div className="absolute inset-0 bg-[#eef3f7]/25 backdrop-blur-[2px]" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <h2 className="text-3xl flex font-bold text-foreground mb-10 rounded-2xl px-10 py-4 h-15 backdrop-blur-lg items-center bg-white/60 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-100"
          >About SPEC ENGINEERS</h2>
          <div className="space-y-8">
            {aboutPoints.map((point, index) => (
              <div key={index} className="flex gap-6 card-shadow-premium industrial-texture bg-card p-6 rounded-lg border border-border hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground font-bold ">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 ">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {point.title}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    {point.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </section>

      {/* Values Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-12">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card-shadow-premium industrial-texture bg-card p-8 rounded-lg border border-border text-center hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-2xl font-bold text-primary mb-3">Excellence</h3>
            <p className="text-foreground/70">
              We pursue excellence in every aspect of our work, from technical analysis to client communication.
            </p>
          </div>
          <div className="card-shadow-premium industrial-texture bg-card p-8 rounded-lg border border-border text-center hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-2xl font-bold text-primary mb-3">Integrity</h3>
            <p className="text-foreground/70">
              We conduct business with transparency, honesty, and unwavering commitment to our professional standards.
            </p>
          </div>
          <div className="card-shadow-premium industrial-texture bg-card p-8 rounded-lg border border-border text-center hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-2xl font-bold text-primary mb-3">Innovation</h3>
            <p className="text-foreground/70">
              We embrace new technologies and methodologies to deliver innovative solutions to evolving challenges.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary py-12 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-background mb-4">
            Ready to partner with SPEC ENGINEERS?
          </h2>
          <p className="text-background/70 mb-6">
            Let&apos;s discuss how we can help achieve your engineering objectives
          </p>
          <button
            onClick={handleEnquire}
            className="bg-secondary text-primary-foreground px-8 py-3 rounded-lg hover:bg-background/90 font-bold hover:text-primary transition duration-300"
          >
            Get in Touch
          </button>
        </div>
      </div>
    </main>
  )
}
