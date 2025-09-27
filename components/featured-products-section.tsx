"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ShoppingBag, Heart, ArrowRight } from "lucide-react"
import { useTranslation } from "@/components/translation-provider"
import useSWR from 'swr'

interface FeaturedProduct {
  ProductID: number
  ProductName: string
  BasePrice: number
  PrimaryImage: string | null
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function FeaturedProductsSection() {
  const { t } = useTranslation()
  const { data, error, isLoading } = useSWR('/api/products/featured', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000, // 5 minutes
  })

  const featuredProducts = data?.success ? data.data : []

  return (
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
          {isLoading ? (
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
          ) : error ? (
            <div className="col-span-full text-center py-16">
              <p className="text-slate-600">Failed to load products.</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            featuredProducts.slice(0, 4).map((product: FeaturedProduct, index: number) => (
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
                        loading="lazy"
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
                      {t("common.viewDetails")}
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
                    {t("common.browseAllProducts")}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
