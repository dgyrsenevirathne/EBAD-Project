"use client"

import { CartDrawer } from "@/components/cart-drawer"
import { useAuth } from "@/components/auth-provider"
import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import FeaturedProductsSection from "@/components/featured-products-section"
import Footer from "@/components/footer"

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      <HeroSection />
      <FeaturesSection />
      <FeaturedProductsSection />
      <Footer user={user} />
      <CartDrawer refreshTrigger={0} />
    </div>
  )
}
