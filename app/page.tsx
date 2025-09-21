"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Gift, Users, Phone, MapPin, ShoppingBag, Heart, Sparkles, ArrowRight, Truck, Shield, Award } from "lucide-react"
import { CartDrawer } from "@/components/cart-drawer"
import { useAuth } from "@/components/auth-provider"

interface FeaturedProduct {
  ProductID: number
  ProductName: string
  BasePrice: number
  PrimaryImage: string | null
}

export default function HomePage() {
  const { user } = useAuth()
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/products/featured')
        const data = await response.json()
        if (data.success) {
          setFeaturedProducts(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
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
                  <Sparkles className="h-6 w-6 text-white" />
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
                { href: "/products", label: "Shop" },
                { href: "/wishlist", label: "Wishlist", auth: true },
                { href: "/wholesale", label: "Wholesale" },
                { href: "/rewards", label: "Rewards" },
                { href: "/about", label: "About" }
              ].map((item) => (
                (!item.auth || user) && (
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
                    Profile
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="hover:bg-orange-50 hover:text-orange-600 transition-colors">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
              <CartDrawer refreshTrigger={0} />
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
                  Shop Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/wholesale">
                <Button variant="outline" size="lg" className="bg-white/70 backdrop-blur-sm border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 px-8 py-4 text-lg font-semibold">
                  <Users className="mr-2 h-5 w-5" />
                  Wholesale Portal
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

      {/* Modern Features Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50/50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200 mb-4">
              Why Choose Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Experience the <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Difference</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We're not just selling clothes, we're sharing a piece of Sri Lanka's rich cultural heritage
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Gift,
                title: "Loyalty Rewards",
                description: "Earn points with every purchase. LKR 100 = 1 point",
                gradient: "from-purple-500 to-pink-600",
                bg: "from-purple-50 to-pink-50"
              },
              {
                icon: Users,
                title: "Wholesale Portal",
                description: "Bulk orders with special pricing for retailers",
                gradient: "from-blue-500 to-cyan-600",
                bg: "from-blue-50 to-cyan-50"
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                description: "Island-wide delivery with Cash on Delivery",
                gradient: "from-green-500 to-emerald-600",
                bg: "from-green-50 to-emerald-50"
              }
            ].map((feature, index) => (
              <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/70 backdrop-blur-sm">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <CardHeader className="relative z-10">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} w-fit mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-slate-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Featured Products */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-orange-50/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1),transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-white/70 backdrop-blur-sm text-orange-700 border-orange-200 mb-4">
              Featured Collection
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Trending <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Products</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Discover our most loved pieces, handpicked for their quality and style
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              // Modern Loading Skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="group relative overflow-hidden border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                  <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-t-2xl animate-pulse relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-red-100/50 rounded-t-2xl"></div>
                  </div>
                  <CardContent className="p-6">
                    <div className="h-5 bg-slate-200 rounded-lg mb-3 animate-pulse"></div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-6 bg-slate-200 rounded-lg w-24 animate-pulse"></div>
                      <div className="flex items-center space-x-1">
                        <div className="h-4 w-4 bg-slate-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-slate-200 rounded w-8 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                  </CardContent>
                </Card>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.slice(0, 4).map((product, index) => (
                <Link key={product.ProductID} href={`/products/${product.ProductID}`}>
                  <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>

                    {/* Favorite Button */}
                    <button className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                      <Heart className="h-4 w-4 text-slate-600 hover:text-red-500 transition-colors" />
                    </button>

                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 rounded-t-2xl overflow-hidden relative">
                      {product.PrimaryImage ? (
                        <img
                          src={product.PrimaryImage}
                          alt={product.ProductName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-orange-600 bg-gradient-to-br from-orange-50 to-red-50">
                          <ShoppingBag className="h-12 w-12" />
                        </div>
                      )}

                      {/* Sale Badge */}
                      {index === 0 && (
                        <Badge className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-600 text-white border-0">
                          Sale
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <h4 className="font-bold text-lg mb-3 text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {product.ProductName}
                      </h4>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                          LKR {product.BasePrice.toLocaleString()}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-slate-600 font-medium">4.8</span>
                        </div>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all duration-300 group-hover:shadow-lg">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto">
                  <ShoppingBag className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 text-lg">No featured products available at the moment.</p>
                  <Link href="/products">
                    <Button className="mt-6 bg-gradient-to-r from-orange-500 to-red-600">
                      Browse All Products
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(251,146,60,0.1),transparent_50%)]"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl blur-lg opacity-30"></div>
                  <div className="relative bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-xl">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                    Ceylon Threads
                  </h4>
                  <p className="text-slate-300">Authentic Sri Lankan fashion for every occasion</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed mb-6">
                We're passionate about bringing you the finest traditional and modern Sri Lankan clothing,
                crafted with care and attention to detail. Experience the rich heritage of Ceylon Threads.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Us
                </Button>
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <MapPin className="mr-2 h-4 w-4" />
                  Find Us
                </Button>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-lg mb-6 text-white">Quick Links</h5>
              <ul className="space-y-3">
                {[
                  { href: "/products", label: "Shop Collection" },
                  { href: "/wholesale", label: "Wholesale" },
                  { href: "/rewards", label: "Rewards Program" },
                  { href: "/about", label: "About Us" }
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-slate-300 hover:text-orange-300 transition-colors duration-300 flex items-center group">
                      <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-lg mb-6 text-white">Customer Service</h5>
              <div className="space-y-4 text-slate-300">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-orange-400" />
                  <span>Secure Shopping</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-orange-400" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-orange-400" />
                  <span>24/7 Support</span>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm text-slate-400 mb-2">Payment Methods</p>
                <p className="text-sm text-slate-300">Cash on Delivery, Cards, FriMi, eZ Cash, SampathPay</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2024 Ceylon Threads. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-slate-400 text-sm">Made with ❤️ in Sri Lanka</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
