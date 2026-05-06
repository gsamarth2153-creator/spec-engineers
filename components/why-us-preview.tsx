'use client'

import { Award, Users, Zap, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const reasons = [
  {
    icon: Award,
    title: 'Industry Expertise',
    description: 'Decades of combined experience across manufacturing, automotive, aerospace, and more.',
  },
  {
    icon: Users,
    title: 'Collaborative Partnership',
    description: 'We view every client as a strategic partner with transparent communication.',
  },
  {
    icon: Zap,
    title: 'Innovation & Technology',
    description: 'Cutting-edge tools and continuous learning at the forefront of industry.',
  },
  {
    icon: CheckCircle,
    title: 'Quality & Precision',
    description: 'Meticulous attention to detail and rigorous quality standards on every project.',
  },
]

export function WhyUsPreview() {
  return (
    <section id="why-us" className="py-16 bg-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-12 p-8 rounded-2xl backdrop-blur-lg bg-white/90 border border-white/20 shadow-lg">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose SPEC ENGINEERS
            </h2>
            <p className="text-foreground/60 text-lg">
              Partnering with us means working with trusted engineering experts
            </p>
          </div>
          <Link
            href="/why-us"
            className="hidden md:flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition"
          >
            Learn More <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 ">
          {reasons.map((reason, index) => {
            const Icon = reason.icon
            return (
              <div
                key={index}
                className="card-shadow-premium shadow-lg industrial-texture bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition"
              >
                <Icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {reason.title}
                </h3>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  {reason.description}
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/why-us"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition"
          >
            Learn More About Us <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
