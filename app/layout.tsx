import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { EnquiryProvider } from './enquiry-context'
import { EnquiryModal } from '@/components/enquiry-modal'
import { Toaster } from 'sonner'
import dynamic from 'next/dynamic'
import WhatsAppButton from "@/components/WhatsAppButton";
import './globals.css'

const _geist = Geist({ subsets: ['latin'], display: 'swap' })
const _geistMono = Geist_Mono({ subsets: ['latin'], display: 'swap' })

// Lazy load heavy components
const LayoutAnimation = dynamic(() => import('@/components/LayoutAnimation').then(mod => ({ default: mod.LayoutAnimation })), {
  ssr: true,
})


export const metadata: Metadata = {
  title: 'SPEC ENGINEERS | Engineering Consulting & Design Services',
  description: 'Professional engineering consultancy services including manufacturing, automotive, aerospace, energy, and infrastructure design',
  generator: 'Hexmelon Technologies',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-background scroll-smooth">
      <body className="font-sans antialiased">
        <EnquiryProvider>
          <LayoutAnimation>{children}</LayoutAnimation>
          <EnquiryModal />
          <Toaster position="bottom-right" />
        </EnquiryProvider>        
        <WhatsAppButton />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}