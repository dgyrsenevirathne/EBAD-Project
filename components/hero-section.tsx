"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, ShoppingBag, Users, ArrowRight, User } from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"
import { useTranslation } from "@/components/translation-provider"
import { useAuth } from "@/components/auth-provider"

export default function HeroSection() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Language Selector */}
      <LanguageSelector />

      {/* Modern Floating Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-slate-900/5'
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl blur-lg opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-xl">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Ceylon Threads
                </h1>
                <Badge variant="secondary" className="hidden sm:inline-flex bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200">
                  Sri Lankan Fashion
                </Badge>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              {[
                { href: "/products", label: t("nav.shop") },
                { href: "/virtual-try-on", label: t("nav.virtualTryOn"), icon: "✨" },
                { href: "/wishlist", label: t("nav.wishlist"), auth: true },
                { href: "/wholesale", label: t("nav.wholesale") },
                { href: "/rewards", label: t("nav.rewards") },
                { href: "/about", label: t("nav.about") }
              ].map((item) => (
                (!item.auth || (item.auth && user)) && (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative text-sm font-medium text-slate-600 hover:text-slate-900 transition-all duration-300 group"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                )
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              {user ? (
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="hover:bg-orange-50 hover:text-orange-600 transition-colors">
                      {t("nav.login")}
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300">
                      {t("nav.signUp")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modern Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-orange-200/30 to-red-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Floating Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg border border-white/50 animate-fade-in">
              <Award className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-slate-700">Premium Sri Lankan Fashion</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              <span className="block bg-gradient-to-r from-slate-900 via-orange-600 to-red-600 bg-clip-text text-transparent animate-gradient">
                Authentic
              </span>
              <span className="block bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 bg-clip-text text-transparent animate-gradient delay-300">
                Sri Lankan
              </span>
              <span className="block bg-gradient-to-r from-red-600 via-purple-600 to-slate-900 bg-clip-text text-transparent animate-gradient delay-500">
                Fashion
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover traditional and modern clothing crafted with love in Sri Lanka.
              From festive wear to everyday essentials, experience the rich heritage of
              <span className="font-semibold text-orange-600">Ceylon Threads</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/products">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {t("hero.shopCollection")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/wholesale">
                <Button variant="outline" size="lg" className="bg-white/70 backdrop-blur-sm border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 px-8 py-4 text-lg font-semibold">
                  <Users className="mr-2 h-5 w-5" />
                  {t("hero.wholesalePortal")}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              {[
                { number: "10K+", label: "Happy Customers" },
                { number: "500+", label: "Products" },
                { number: "24/7", label: "Support" }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-3xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors duration-300">
                    {stat.number}
                  </div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-slate-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>
    </>
  )
}
