'use client'

import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="site-footer" className="bg-card border-t border-border">
      <div id="contact" className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">SPEC ENGINEERS</h3>
            <p className="text-foreground/70 text-sm">Engineering excellence for tomorrow&apos;s challenges</p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#services" className="text-foreground/70 hover:text-primary transition">
                  Mechanical Design
                </a>
              </li>
              <li>
                <a href="#services" className="text-foreground/70 hover:text-primary transition">
                  Surface & Cylindrical Grinding
                </a>
              </li>
              <li>
                <a href="#services" className="text-foreground/70 hover:text-primary transition">
                  Structural Analysis
                </a>
              </li>
              <li>
                <a href="#services" className="text-foreground/70 hover:text-primary transition">
                  Manufacturing Optimization
                </a>
              </li>
              <li>
                <a href="#services" className="text-foreground/70 hover:text-primary transition">
                  Blading Solutions
                </a>
              </li>
              <li>
                <a href="#services" className="text-foreground/70 hover:text-primary transition">
                  Reconditioning Services
                </a>
              </li>
              <li>
                <a href="#services" className="text-foreground/70 hover:text-primary transition">
                  3-Axis Precision Machining
                </a>
              </li>
              <li>
                <a href="#services" className="text-foreground/70 hover:text-primary transition">
                  Custom Solutions
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Industries</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#industries" className="text-foreground/70 hover:text-primary transition">
                  Manufacturing
                </a>
              </li>
              <li>
                <a href="#industries" className="text-foreground/70 hover:text-primary transition">
                  Metal Processing & Fabrication
                </a>
              </li>
              <li>
                <a href="#industries" className="text-foreground/70 hover:text-primary transition">
                  Paper Industry
                </a>
              </li>
              <li>
                <a href="#industries" className="text-foreground/70 hover:text-primary transition">
                  Plastics & Recycling
                </a>
              </li>
              <li>
                <a href="#industries" className="text-foreground/70 hover:text-primary transition">
                  Corrugated Industry
                </a>
              </li>
              <li>
                <a href="#industries" className="text-foreground/70 hover:text-primary transition">
                  Textile and Fiber Industry
                </a>                            
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li>info@specengineers.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Engineering Way</li>
              <li>Tech City, TC 12345</li>
            </ul>
          </div>
        </div>

        <div id="footer-end"></div>
        
        <div className="border-t border-border pt-3 pb-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground/60 text-smartwrap">
              © {currentYear} SPEC ENGINEERS. All rights reserved.
            </p>
            <div className="flex gap-2 text-sm px-50">
              <a href="#" className="text-foreground/60 hover:text-primary transition">
                Privacy
              </a>
              <a href="#" className="text-foreground/60 hover:text-primary transition">
                Terms
              </a>
              <a href="#" className="text-foreground/60 hover:text-primary transition">
                LinkedIn
              </a>
            </div>
            <div className="flex gap-6 text-sm ">
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
