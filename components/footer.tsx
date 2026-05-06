'use client'

import Link from 'next/link'
import WhatsAppButton from './WhatsAppButton'
import { MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="site-footer" className="bg-card border-t border-border">
      <div id="contact" className="container mx-auto px-4 pt-12 pb-3 md:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">SPEC ENGINEERS</h3>
            <p className="text-foreground/70 text-sm">Engineering excellence for tomorrow&apos;s challenges</p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/services#mechanical-design" className="text-foreground/70 hover:text-primary transition">
                  Mechanical Design
                </a>
              </li>
              <li>
                <a href="/services#surface-cylindrical-grinding" className="text-foreground/70 hover:text-primary transition">
                  Surface & Cylindrical Grinding
                </a>
              </li>
              <li>
                <a href="/services#structural-analysis" className="text-foreground/70 hover:text-primary transition">
                  Structural Analysis
                </a>
              </li>
              <li>
                <a href="/services#manufacturing-optimization" className="text-foreground/70 hover:text-primary transition">
                  Manufacturing Optimization
                </a>
              </li>
              <li>
                <a href="/services#blading-solutions" className="text-foreground/70 hover:text-primary transition">
                  Blading Solutions
                </a>
              </li>
              <li>
                <a href="/services#reconditioning-services" className="text-foreground/70 hover:text-primary transition">
                  Reconditioning Services
                </a>
              </li>
              <li>
                <a href="/services#3-axis-precision-machining" className="text-foreground/70 hover:text-primary transition">
                  3-Axis Precision Machining
                </a>
              </li>
              <li>
                <a href="/services#custom-solutions" className="text-foreground/70 hover:text-primary transition">
                  Custom Solutions
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Industries</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/industries#manufacturing" className="text-foreground/70 hover:text-primary transition">
                  Manufacturing
                </a>
              </li>
              <li>
                <a href="/industries#automotive" className="text-foreground/70 hover:text-primary transition">
                  AutoMobile
                </a>
              </li>
              <li>
                <a href="/industries#metal-processing-and-fabrication" className="text-foreground/70 hover:text-primary transition">
                  Metal Processing & Fabrication
                </a>
              </li>
              <li>
                <a href="/industries#paper-industry" className="text-foreground/70 hover:text-primary transition">
                  Paper Industry
                </a>
              </li>
              <li>
                <a href="/industries#plastics-and-recycling" className="text-foreground/70 hover:text-primary transition">
                  Plastics & Recycling
                </a>
              </li>
              <li>
                <a href="/industries#corrugated-industry" className="text-foreground/70 hover:text-primary transition">
                  Corrugated Industry
                </a>
              </li>
              <li>
                <a href="/industries#textile-and-fiber industry" className="text-foreground/70 hover:text-primary transition">
                  Textile and Fiber Industry
                </a>                            
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li>info@specengineers.com</li>
              <li>
                <a href="https://wa.me/916264054416" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-primary transition">
                  +916264054416
                </a>
              </li>              
              <li><a href="https://maps.app.goo.gl/iwLB8vcfae7s5FrcA" className="text-foreground/60 hover:text-primary transition" target="_blank" rel="noopener noreferrer">
                  Khasra No. 372/2, Plot No. 7A, Bajrangpura, Tigria Badshah,
                  Opp. MPD Industries, Near Sector-A, Sanwer Road, Indore
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/60 hover:text-primary transition">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/60 hover:text-primary transition">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/60 hover:text-primary transition">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div id="footer-end" className="h-20 w-full"></div>
        
        <div className="flex border-t border-border pt-3 pb-1 md:flex items-center md:justify-between">
          <div className="flex md:flex-2 items-center justify-between">
            <p className="text-sm text-foreground/60 text-smartwrap">
              © {currentYear} SPEC ENGINEERS. All rights reserved.
            </p>
            
            <div className=" gap-6 text-sm ">
              <a href="https://www.hexmelon.com" className="text-foreground/60 hover:text-primary transition">
                made with love by <span className="font-bold">Hexmelon</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
