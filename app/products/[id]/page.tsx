"use client"

import { Label } from "@/components/ui/label"
import { CartDrawer } from "@/components/cart-drawer"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Star, Heart, Truck, Shield, RotateCcw, Share2, Minus, Plus } from "lucide-react"

// Mock product data - in real app this would come from API
const mockProduct = {
  id: 1,
  name: "Traditional Kandyan Saree",
  price: 12500,
  originalPrice: 15000,
  category: "Women",
  subcategory: "Sarees",
  images: [
    "/traditional-kandyan-saree-front.png",
    "/traditional-kandyan-saree-back.png",
    "/traditional-kandyan-saree-detail.png",
    "/traditional-kandyan-saree-model.png",
  ],
  rating: 4.8,
  reviews: 24,
  colors: ["Red", "Blue", "Gold"],
  sizes: ["S", "M", "L", "XL"],
  isFeatured: true,
  isPreOrder: false,
  stock: 15,
  description:
    "Exquisite traditional Kandyan saree crafted with authentic Sri Lankan techniques. Perfect for weddings, cultural events, and special occasions. Made from premium silk with intricate embroidery work.",
  features: [
    "100% Pure Silk Material",
    "Hand-embroidered Details",
    "Traditional Kandyan Design",
    "Includes Matching Blouse Piece",
    "Dry Clean Only",
  ],
  specifications: {
    Material: "Pure Silk",
    Origin: "Kandy, Sri Lanka",
    Care: "Dry Clean Only",
    Weight: "800g",
    Length: "5.5 meters",
  },
}

const reviews = [
  {
    id: 1,
    name: "Priya Fernando",
    rating: 5,
    date: "2024-01-15",
    comment:
      "Absolutely beautiful saree! The quality is exceptional and the embroidery work is stunning. Perfect for my daughter's wedding.",
  },
  {
    id: 2,
    name: "Malini Silva",
    rating: 4,
    date: "2024-01-10",
    comment: "Great quality and fast delivery. The color is exactly as shown in the pictures. Highly recommended!",
  },
  {
    id: 3,
    name: "Chamari Perera",
    rating: 5,
    date: "2024-01-05",
    comment: "This is my third purchase from Ceylon Threads. Always excellent quality and authentic designs.",
  },
]

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(mockProduct.colors[0])
  const [selectedSize, setSelectedSize] = useState(mockProduct.sizes[1])
  const [quantity, setQuantity] = useState(1)

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= mockProduct.stock) {
      setQuantity(newQuantity)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/products">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-primary">Ceylon Threads</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <CartDrawer />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
              <img
                src={mockProduct.images[selectedImage] || "/placeholder.svg"}
                alt={mockProduct.name}
                className="w-full h-full object-cover"
              />
              {mockProduct.isFeatured && (
                <Badge className="absolute top-4 left-4 bg-orange-600 hover:bg-orange-700">Featured</Badge>
              )}
              {mockProduct.originalPrice && (
                <Badge variant="destructive" className="absolute top-4 right-4 bg-red-600 hover:bg-red-700">
                  {Math.round(((mockProduct.originalPrice - mockProduct.price) / mockProduct.originalPrice) * 100)}% OFF
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {mockProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${mockProduct.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{mockProduct.category}</Badge>
                <Badge variant="outline">{mockProduct.subcategory}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-4">{mockProduct.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(mockProduct.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {mockProduct.rating} ({mockProduct.reviews} reviews)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold">LKR {mockProduct.price.toLocaleString()}</span>
                {mockProduct.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    LKR {mockProduct.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Color</Label>
                <div className="flex gap-2">
                  {mockProduct.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                        selectedColor === color
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background hover:bg-accent"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Size</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProduct.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Quantity</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= mockProduct.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{mockProduct.stock} items available</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button size="lg" className="flex-1">
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <Truck className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Free Delivery</p>
                  <p className="text-xs text-muted-foreground">Orders over LKR 5,000</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Shield className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Authentic</p>
                  <p className="text-xs text-muted-foreground">100% Genuine</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <RotateCcw className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">14-Day Returns</p>
                  <p className="text-xs text-muted-foreground">Easy returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({mockProduct.reviews})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4">{mockProduct.description}</p>
                  <h4 className="font-semibold mb-3">Features:</h4>
                  <ul className="space-y-2">
                    {mockProduct.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {Object.entries(mockProduct.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-border last:border-0">
                        <span className="font-medium">{key}:</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{review.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
