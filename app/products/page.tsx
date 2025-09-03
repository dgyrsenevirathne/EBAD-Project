"use client"

import { useState } from "react"
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

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: "Traditional Kandyan Saree",
    price: 12500,
    originalPrice: 15000,
    category: "Women",
    subcategory: "Sarees",
    image: "/traditional-kandyan-saree.png",
    rating: 4.8,
    reviews: 24,
    colors: ["Red", "Blue", "Gold"],
    sizes: ["S", "M", "L", "XL"],
    isFeatured: true,
    isPreOrder: false,
    stock: 15,
  },
  {
    id: 2,
    name: "Men's Batik Shirt",
    price: 3500,
    originalPrice: null,
    category: "Men",
    subcategory: "Shirts",
    image: "/sri-lankan-batik-shirt.png",
    rating: 4.6,
    reviews: 18,
    colors: ["Blue", "Green", "Brown"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isFeatured: false,
    isPreOrder: false,
    stock: 8,
  },
  {
    id: 3,
    name: "Kids Festival Dress",
    price: 2800,
    originalPrice: 3200,
    category: "Kids",
    subcategory: "Dresses",
    image: "/sri-lankan-kids-festival-dress.png",
    rating: 4.9,
    reviews: 12,
    colors: ["Pink", "Yellow", "White"],
    sizes: ["2T", "3T", "4T", "5T"],
    isFeatured: true,
    isPreOrder: false,
    stock: 22,
  },
  {
    id: 4,
    name: "Avurudu Special Sarong",
    price: 4200,
    originalPrice: null,
    category: "Men",
    subcategory: "Traditional",
    image: "/sri-lankan-sarong-avurudu.png",
    rating: 4.7,
    reviews: 31,
    colors: ["White", "Cream", "Gold"],
    sizes: ["One Size"],
    isFeatured: false,
    isPreOrder: true,
    stock: 0,
  },
  {
    id: 5,
    name: "Handloom Cotton Blouse",
    price: 1800,
    originalPrice: null,
    category: "Women",
    subcategory: "Blouses",
    image: "/handloom-cotton-blouse.png",
    rating: 4.5,
    reviews: 9,
    colors: ["White", "Cream", "Light Blue"],
    sizes: ["S", "M", "L"],
    isFeatured: false,
    isPreOrder: false,
    stock: 5,
  },
  {
    id: 6,
    name: "Wedding Osariya",
    price: 25000,
    originalPrice: 28000,
    category: "Women",
    subcategory: "Wedding",
    image: "/sri-lankan-wedding-osariya.png",
    rating: 5.0,
    reviews: 7,
    colors: ["Gold", "Silver", "Red"],
    sizes: ["S", "M", "L"],
    isFeatured: true,
    isPreOrder: false,
    stock: 3,
  },
]

const categories = ["All", "Men", "Women", "Kids"]
const subcategories = ["All", "Sarees", "Shirts", "Dresses", "Traditional", "Blouses", "Wedding"]
const colors = ["Red", "Blue", "Gold", "Green", "Brown", "Pink", "Yellow", "White", "Cream", "Light Blue", "Silver"]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedSubcategory, setSelectedSubcategory] = useState("All")
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 30000])
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    const matchesSubcategory = selectedSubcategory === "All" || product.subcategory === selectedSubcategory
    const matchesColor = selectedColors.length === 0 || selectedColors.some((color) => product.colors.includes(color))
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

    return matchesSearch && matchesCategory && matchesSubcategory && matchesColor && matchesPrice
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "newest":
        return b.id - a.id
      default:
        return b.isFeatured ? 1 : -1
    }
  })

  const handleColorChange = (color: string, checked: boolean) => {
    if (checked) {
      setSelectedColors([...selectedColors, color])
    } else {
      setSelectedColors(selectedColors.filter((c) => c !== color))
    }
  }

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
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-primary">Ceylon Threads</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <CartDrawer />
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
                <h3 className="font-semibold mb-3">Search</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Category</h3>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Subcategory</h3>
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
                <h3 className="font-semibold mb-3">Price Range</h3>
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
                <h3 className="font-semibold mb-3">Colors</h3>
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
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <p className="text-sm text-muted-foreground">
                  Showing {sortedProducts.length} of {mockProducts.length} products
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
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
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
                <Card
                  key={product.id}
                  className={`group cursor-pointer hover:shadow-lg transition-shadow ${
                    viewMode === "list" ? "flex flex-row" : ""
                  }`}
                >
                  <div className={`relative ${viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-square"}`}>
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition-transform"
                    />
                    {product.isFeatured && (
                      <Badge className="absolute top-2 left-2 bg-orange-600 hover:bg-orange-700">Featured</Badge>
                    )}
                    {product.isPreOrder && (
                      <Badge className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700">Pre-Order</Badge>
                    )}
                    {product.originalPrice && (
                      <Badge variant="destructive" className="absolute top-2 right-2 bg-red-600 hover:bg-red-700">
                        Sale
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-muted-foreground ml-1">
                            {product.rating} ({product.reviews})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">LKR {product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            LKR {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {product.colors.slice(0, 3).map((color) => (
                          <Badge key={color} variant="outline" className="text-xs">
                            {color}
                          </Badge>
                        ))}
                        {product.colors.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.colors.length - 3}
                          </Badge>
                        )}
                      </div>
                      {product.stock <= 5 && product.stock > 0 && (
                        <p className="text-xs text-orange-600">Only {product.stock} left in stock</p>
                      )}
                      {product.stock === 0 && !product.isPreOrder && (
                        <p className="text-xs text-red-600">Out of stock</p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1" disabled={product.stock === 0 && !product.isPreOrder}>
                          {product.isPreOrder ? "Pre-Order" : "Add to Cart"}
                        </Button>
                        {product.stock === 0 && !product.isPreOrder && (
                          <Button variant="outline" size="sm">
                            Notify Me
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
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
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
