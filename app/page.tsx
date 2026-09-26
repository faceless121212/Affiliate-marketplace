import { AnnouncementBar } from '@/components/landing/AnnouncementBar'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { Problem } from '@/components/landing/Problem'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { WhyEscrow } from '@/components/landing/WhyEscrow'
import { WhatYouGet } from '@/components/landing/WhatYouGet'
import { Market } from '@/components/landing/Market'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <WhyEscrow />
        <WhatYouGet />
        <Market />
        <Footer />
      </main>
    </>
  )
}
