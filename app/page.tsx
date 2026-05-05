import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { ServicesPreview } from '@/components/services-preview'
import { IndustriesPreview } from '@/components/industries-preview'
import { WhyUsPreview } from '@/components/why-us-preview'
import { EnquiryModal } from '@/components/enquiry-modal'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ServicesPreview />
      <IndustriesPreview />
      <WhyUsPreview />
      <Footer />
      <EnquiryModal />
    </main>
  )
}
