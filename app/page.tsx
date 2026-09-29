import { AnnouncementBar } from '@/components/landing/AnnouncementBar'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Bento } from '@/components/landing/Bento'
import { Problem } from '@/components/landing/Problem'
import { Market } from '@/components/landing/Market'
import { GetStarted } from '@/components/landing/GetStarted'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Bento />
        <Problem />
        <Market />
        <GetStarted />
      </main>
      <Footer />
    </>
  )
}
