import Hero from '@/components/Hero'
import HeroGallery from '@/components/HeroGallery'
import ProductsCatalog from '@/components/ProductsCatalog'
import Services from '@/components/Services'
import BusinessTypes from '@/components/BusinessTypes'
import Advantages from '@/components/Advantages'
import Partners from '@/components/Partners'
import News from '@/components/News'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <HeroGallery />
      <Advantages />
      <ProductsCatalog />
      <BusinessTypes />
      <Services />
      <Partners />
      <News />
    </div>
  )
}

