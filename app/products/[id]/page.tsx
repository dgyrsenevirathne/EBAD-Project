"use client"

import { Label } from "@/components/ui/label"
import { CartDrawer } from "@/components/cart-drawer"
import { useAuth } from "@/components/auth-provider"
import { Textarea } from "@/components/ui/textarea"

import { useState, useEffect } from "react"
import { use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Star, Heart, Truck, Shield, RotateCcw, Share2, Minus, Plus, Send } from "lucide-react"

interface Product {
  ProductID: number
  ProductName: string
  BasePrice: number
  WholesalePrice: number | null
  Festival: string | null
  CategoryName: string
  Description: string
  IsFeatured: boolean
  variants?: any[]
  images: any[]
  averageRating: number
  ratingCount: number
}

interface Rating {
  id: number
  rating: number
  review: string
  date: string
  name: string
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const paramsData = use(params)
  const id = paramsData.id

  const { user, token } = useAuth()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [ratingLoading, setRatingLoading] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newReview, setNewReview] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`)
        const data = await response.json()
        if (data.success) {
          setProduct(data.data)
          // Set default variant if available
          if (data.data.variants && data.data.variants.length > 0) {
            setSelectedVariantId(data.data.variants![0].VariantID)
          }
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchRatings = async () => {
      try {
        const response = await fetch(`/api/products/ratings?productId=${id}`)
        const data = await response.json()
        if (data.success) {
          setRatings(data.data.ratings)
        }
      } catch (error) {
        console.error('Failed to fetch ratings:', error)
      }
    }

    fetchProduct()
    fetchRatings()
  }, [id])

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    const selectedVariant = product?.variants?.find(v => v.VariantID === selectedVariantId)
    const maxStock = selectedVariant?.Stock || 999999
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity)
    }
  }

  const handleVariantChange = (variantId: number) => {
    setSelectedVariantId(variantId)
    setQuantity(1) // Reset quantity when variant changes
  }

  const addToCart = async () => {
    if (user && token) {
      // Add to API for logged-in users
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product?.ProductID,
            variantId: selectedVariantId,
            quantity: quantity,
          }),
        })

        const data = await response.json()

        if (data.success) {
          alert("Item added to cart successfully!")
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

  const submitRating = async () => {
    if (!user || !token) {
      alert("Please login to rate products")
      return
    }

    setRatingLoading(true)
    try {
      const response = await fetch('/api/products/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString(), // Assuming user.id exists
        },
        body: JSON.stringify({
          productId: product?.ProductID,
          rating: newRating,
          review: newReview,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert("Rating submitted successfully!")
        setNewReview('')
        // Refresh ratings
        const ratingsResponse = await fetch(`/api/products/ratings?productId=${id}`)
        const ratingsData = await ratingsResponse.json()
        if (ratingsData.success) {
          setRatings(ratingsData.data.ratings)
        }
      } else {
        alert(data.message || 'Failed to submit rating')
      }
    } catch (error) {
      console.error('Failed to submit rating:', error)
      alert('Failed to submit rating')
    } finally {
      setRatingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    )
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
              <CartDrawer refreshTrigger={0} />
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
                src={product.images[selectedImage]?.ImageURL || "/placeholder.svg"}
                alt={product.ProductName}
                className="w-full h-full object-cover"
              />
              {product.IsFeatured && (
                <Badge className="absolute top-4 left-4 bg-orange-600 hover:bg-orange-700">Featured</Badge>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img
                    src={image.ImageURL || "/placeholder.svg"}
                    alt={`${product.ProductName} ${index + 1}`}
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
                <Badge variant="outline">{product.CategoryName}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.ProductName}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {product.averageRating} ({product.ratingCount} reviews)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold">LKR {product.BasePrice.toLocaleString()}</span>
                {product.WholesalePrice && product.WholesalePrice < product.BasePrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    LKR {product.WholesalePrice.toLocaleString()}
                  </span>
                )}
              </div>
              {product.Festival && (
                <div className="mb-4">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    🎉 {product.Festival} Collection
                  </Badge>
                </div>
              )}
            </div>

              <div className="space-y-4">
                {product?.variants && product.variants.length > 0 && (
                  <div className="relative">
                    <Label className="text-sm font-medium mb-2 block">Select Variant</Label>
                    <Select value={selectedVariantId?.toString() || ''} onValueChange={(value) => handleVariantChange(parseInt(value))}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Choose size/color" />
                      </SelectTrigger>
                      <SelectContent position="popper" side="bottom" className="z-[9999] w-[180px]">
                        {product.variants.map((variant) => (
                          <SelectItem key={variant.VariantID} value={variant.VariantID.toString()}>
                            {variant.Size ? `${variant.Size}` : ''} {variant.Color ? ` - ${variant.Color}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
                      disabled={quantity >= (product?.variants?.find(v => v.VariantID === selectedVariantId)?.Stock || 999999)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(() => {
                      const selectedVariant = product?.variants?.find(v => v.VariantID === selectedVariantId)
                      return selectedVariant ? `${selectedVariant.Stock} items available` : `${product?.variants?.[0]?.Stock || 0} items available`
                    })()}
                  </p>
                </div>
              </div>

            <div className="flex gap-4">
              <Button size="lg" className="flex-1" onClick={addToCart}>
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
              <TabsTrigger value="reviews">Reviews ({product?.ratingCount || 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">{product?.Description}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">Specifications coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {user && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4">Write a Review</h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Rating</Label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setNewRating(star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    star <= newRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Review (Optional)</Label>
                          <Textarea
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                            placeholder="Share your thoughts about this product..."
                            rows={3}
                          />
                        </div>
                        <Button onClick={submitRating} disabled={ratingLoading}>
                          {ratingLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Submit Review
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {ratings.length > 0 ? (
                  ratings.map((review) => (
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
                        {review.review && <p className="text-muted-foreground">{review.review}</p>}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
