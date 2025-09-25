"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, Filter, Star, Heart, ArrowLeft, Grid, List } from "lucide-react"
import { CartDrawer } from "@/components/cart-drawer"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/components/translation-provider"

interface Product {
  ProductID: number
  ProductName: string
  BasePrice: number
  WholesalePrice: number | null
  CategoryName: string
  PrimaryImage: string | null
  VariantCount: number
  TotalStock: number
  IsFeatured: boolean
  IsActive: boolean
}

interface ProductRating {
  averageRating: number
  totalRatings: number
}

export default function ProductsPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  const categories = [
    { id: 0, name: t("category.all") },
    { id: 1, name: t("category.men") },
    { id: 2, name: t("category.women") },
    { id: 3, name: t("category.kids") },
  ]
  const subcategories = [t("subcategory.all"), t("subcategory.sarees"), t("subcategory.shirts"), t("subcategory.dresses"), t("subcategory.traditional"), t("subcategory.blouses"), t("subcategory.wedding")]
  const colors = [t("color.red"), t("color.blue"), t("color.gold"), t("color.green"), t("color.brown"), t("color.pink"), t("color.yellow"), t("color.white"), t("color.cream"), t("color.lightBlue"), t("color.silver")]
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedSubcategory, setSelectedSubcategory] = useState("All")
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 30000])
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [cartRefreshTrigger, setCartRefreshTrigger] = useState(0)
  const [productRatings, setProductRatings] = useState<Record<number, ProductRating>>({})
  const [spendingLimit, setSpendingLimit] = useState<number | null>(null)
  const [currentCartTotal, setCurrentCartTotal] = useState(0)

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory !== "All") {
        const categoryObj = categories.find(c => c.name === selectedCategory)
        if (categoryObj) {
          params.append('category', categoryObj.id.toString())
        }
      }
      if (priceRange[0] > 0) params.append('minPrice', priceRange[0].toString())
      if (priceRange[1] < 30000) params.append('maxPrice', priceRange[1].toString())
      params.append('sortBy', sortBy === "featured" ? "featured" : sortBy === "price-low" ? "price" : sortBy === "price-high" ? "price" : "created")
      params.append('sortOrder', sortBy === "price-high" ? "desc" : "asc")

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.data.products)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, selectedCategory, priceRange, sortBy])

  const filteredProducts = products.filter((product) => {
    const matchesSubcategory = selectedSubcategory === "All" || product.CategoryName === selectedSubcategory
    const matchesColor = selectedColors.length === 0 // For now, we'll skip color filtering since it's not in the API response

    return matchesSubcategory && matchesColor
  })

  const sortedProducts = [...filteredProducts]

  const handleColorChange = (color: string, checked: boolean) => {
    if (checked) {
      setSelectedColors([...selectedColors, color])
    } else {
      setSelectedColors(selectedColors.filter((c) => c !== color))
    }
  }

  const addToCart = async (productId: number, event?: React.MouseEvent) => {
    event?.preventDefault()
    event?.stopPropagation()

    if (user && token) {
      // Check spending limit before adding to cart
      if (spendingLimit) {
        try {
          // Get current cart total
          const cartResponse = await fetch('/api/cart', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
          const cartData = await cartResponse.json()
          if (cartData.success) {
            const currentTotal = cartData.data.reduce((sum: number, item: any) => sum + item.BasePrice * item.Quantity, 0)
            // Get product price
            const product = products.find(p => p.ProductID === productId)
            if (product) {
              const newTotal = currentTotal + product.BasePrice
              if (newTotal > spendingLimit) {
                const proceed = confirm(`Adding this item would exceed your spending limit. Current cart: LKR ${currentTotal.toLocaleString()}, Adding: LKR ${product.BasePrice.toLocaleString()}, New total: LKR ${newTotal.toLocaleString()}. Your limit is LKR ${spendingLimit.toLocaleString()}. Click OK to proceed anyway.`)
                if (!proceed) {
                  return
                }
              }
            }
          }
        } catch (error) {
          console.error('Failed to check spending limit:', error)
        }
      }

      // Add to API for logged-in users
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: productId,
            quantity: 1,
          }),
        })

        const data = await response.json()

        if (data.success) {
          alert("Item added to cart successfully!")
          setCartRefreshTrigger(prev => prev + 1) // Trigger cart refresh
        } else {
          alert(data.message || 'Failed to add item to cart')
        }
      } catch (error) {
        console.error('Failed to add to cart:', error)
        alert('Failed to add item to cart')
      }
    } else {
      // Prevent guest users from adding to cart
      alert("Please create an account and login first to add items to cart")
    }
  }

  const addToWishlist = async (productId: number) => {
    if (!user || !token) {
      alert('Please login to add items to wishlist')
      return
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: productId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert("Item added to wishlist successfully!")
      } else {
        alert(data.message || 'Failed to add item to wishlist')
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error)
      alert('Failed to add item to wishlist')
    }
  }

  const fetchProductRatings = async (productIds: number[]) => {
    try {
      const ratingsPromises = productIds.map(async (productId) => {
        const response = await fetch(`/api/products/ratings?productId=${productId}`)
        const data = await response.json()
        return {
          productId,
          rating: data.success ? data.data : { averageRating: 0, totalRatings: 0 }
        }
      })

      const ratingsResults = await Promise.all(ratingsPromises)
      const ratingsMap: Record<number, ProductRating> = {}

      ratingsResults.forEach(({ productId, rating }) => {
        ratingsMap[productId] = {
          averageRating: rating.averageRating || 0,
          totalRatings: rating.totalRatings || 0
        }
      })

      setProductRatings(ratingsMap)
    } catch (error) {
      console.error('Failed to fetch product ratings:', error)
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= fullStars
                ? 'fill-yellow-400 text-yellow-400'
                : star === fullStars + 1 && hasHalfStar
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  // Fetch ratings when products change
  useEffect(() => {
    if (products.length > 0) {
      const productIds = products.map(p => p.ProductID)
      fetchProductRatings(productIds)
    }
  }, [products])

  // Load spending limit from localStorage and fetch current cart total
  useEffect(() => {
    const savedLimit = localStorage.getItem('spendingLimit')
    if (savedLimit) {
      setSpendingLimit(parseInt(savedLimit))
    }

    // Fetch current cart total
    const fetchCartTotal = async () => {
      if (user && token) {
        try {
          const response = await fetch('/api/cart', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
          const data = await response.json()
          if (data.success) {
            const total = data.data.reduce((sum: number, item: any) => sum + item.BasePrice * item.Quantity, 0)
            setCurrentCartTotal(total)
          }
        } catch (error) {
          console.error('Failed to fetch cart total:', error)
        }
      }
    }

    fetchCartTotal()
  }, [user, token])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("common.back")}
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-primary">{t("brand.name")}</h1>
            </div>
            <div className="flex items-center space-x-2">
              {user && (
                <Link href="/wishlist">
                  <Button variant="ghost" size="sm">
                    {t("common.wishlist")}
                  </Button>
                </Link>
              )}
              {user ? (
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    {t("common.profile")}
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {t("common.login")}
                  </Button>
                </Link>
              )}
              <CartDrawer refreshTrigger={cartRefreshTrigger} />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}>
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3">{t("filters.search")}</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("filters.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">{t("filters.category")}</h3>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="font-semibold mb-3">{t("filters.subcategory")}</h3>
                <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="font-semibold mb-3">{t("filters.priceRange")}</h3>
                <div className="space-y-3">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={30000}
                    min={0}
                    step={500}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>LKR {priceRange[0].toLocaleString()}</span>
                    <span>LKR {priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">{t("filters.colors")}</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {colors.map((color) => (
                    <div key={color} className="flex items-center space-x-2">
                      <Checkbox
                        id={color}
                        checked={selectedColors.includes(color)}
                        onCheckedChange={(checked) => handleColorChange(color, checked as boolean)}
                      />
                      <Label htmlFor={color} className="text-sm">
                        {color}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">{t("filters.spendingLimit")}</h3>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder={t("filters.spendingLimitPlaceholder")}
                    value={spendingLimit || ""}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : null
                      setSpendingLimit(value)
                      if (value) {
                        localStorage.setItem('spendingLimit', value.toString())
                      } else {
                        localStorage.removeItem('spendingLimit')
                      }
                    }}
                    min="0"
                    step="100"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("filters.spendingLimitDescription")}
                  </p>
                  {currentCartTotal > 0 && (
                    <p className="text-xs text-orange-600">
                      {t("filters.currentCartTotal")} LKR {currentCartTotal.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  {t("filters.filters")}
                </Button>
              <p className="text-sm text-muted-foreground">
                {t("products.showing")} {sortedProducts.length} {t("products.of")} {products.length} {t("products.count")}
              </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">{t("products.featured")}</SelectItem>
                    <SelectItem value="newest">{t("products.newest")}</SelectItem>
                    <SelectItem value="price-low">{t("products.priceLowToHigh")}</SelectItem>
                    <SelectItem value="price-high">{t("products.priceHighToLow")}</SelectItem>
                    <SelectItem value="rating">{t("products.highestRated")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {sortedProducts.map((product) => (
                <Link key={product.ProductID} href={`/products/${product.ProductID}`}>
                  <Card
                    className={`group cursor-pointer hover:shadow-lg transition-shadow ${
                      viewMode === "list" ? "flex flex-row" : ""
                    }`}
                  >
                  <div className={`relative ${viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-square"}`}>
                    <img
                      src={product.PrimaryImage || "/placeholder.svg"}
                      alt={product.ProductName}
                      className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition-transform"
                    />
                    {product.IsFeatured && (
                      <Badge className="absolute top-2 left-2 bg-orange-600 hover:bg-orange-700">{t("products.featured")}</Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addToWishlist(product.ProductID)
                      }}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-2">{product.ProductName}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{product.CategoryName}</span>
                      </div>

                      {/* Rating Display */}
                      {productRatings[product.ProductID] && (
                        <div className="flex items-center gap-2">
                          {renderStars(productRatings[product.ProductID].averageRating, 'sm')}
                          <span className="text-sm text-muted-foreground">
                            {productRatings[product.ProductID].averageRating.toFixed(1)}
                            ({productRatings[product.ProductID].totalRatings} {productRatings[product.ProductID].totalRatings === 1 ? t("products.review") : t("products.reviews")})
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">LKR {product.BasePrice.toLocaleString()}</span>
                        {product.WholesalePrice && product.WholesalePrice < product.BasePrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            LKR {product.WholesalePrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {product.VariantCount} {t("products.variants")}
                        </Badge>
                      </div>
                      {product.TotalStock <= 5 && product.TotalStock > 0 && (
                        <p className="text-xs text-orange-600">{t("products.onlyLeft")} {product.TotalStock} {t("products.leftInStock")}</p>
                      )}
                      {product.TotalStock === 0 && (
                        <p className="text-xs text-red-600">{t("products.outOfStock")}</p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={product.TotalStock === 0}
                          onClick={(e) => addToCart(product.ProductID, e)}
                        >
                          {t("products.addToCart")}
                        </Button>
                        {product.TotalStock === 0 && (
                          <Button variant="outline" size="sm">
                            {t("products.notifyMe")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            </div>

            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t("products.noProductsFound")}</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("All")
                    setSelectedSubcategory("All")
                    setSelectedColors([])
                    setPriceRange([0, 30000])
                  }}
                >
                  {t("products.clearFilters")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
