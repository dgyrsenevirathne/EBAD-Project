"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ArrowLeft, ShoppingCart, Trash2 } from "lucide-react"
import { CartDrawer } from "@/components/cart-drawer"
import { useAuth } from "@/components/auth-provider"

interface WishlistItem {
  WishlistID: number
  ProductID: number
  ProductName: string
  BasePrice: number
  WholesalePrice: number | null
  PrimaryImage: string | null
  CreatedAt: Date
}

export default function WishlistPage() {
  const { user, token } = useAuth()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cartRefreshTrigger, setCartRefreshTrigger] = useState(0)

  const fetchWishlist = async () => {
    if (!user || !token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (data.success) {
        setWishlistItems(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [user, token])

  const removeFromWishlist = async (productId: number) => {
    if (!user || !token) return

    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setWishlistItems(prev => prev.filter(item => item.ProductID !== productId))
      } else {
        alert(data.message || 'Failed to remove from wishlist')
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
      alert('Failed to remove from wishlist')
    }
  }

  const addToCart = async (productId: number) => {
    if (!user || !token) {
      alert('Please login to add items to cart')
      return
    }

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
        setCartRefreshTrigger(prev => prev + 1)
      } else {
        alert(data.message || 'Failed to add item to cart')
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('Failed to add item to cart')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-muted-foreground mb-6">Please login to view your wishlist.</p>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </Card>
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
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-primary">My Wishlist</h1>
            </div>
            <div className="flex items-center space-x-2">
              <CartDrawer refreshTrigger={cartRefreshTrigger} />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Start adding items you love to your wishlist.</p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <Card key={item.WishlistID} className="group cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 rounded-t-lg overflow-hidden relative">
                    <img
                      src={item.PrimaryImage || "/placeholder.svg"}
                      alt={item.ProductName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      onClick={() => removeFromWishlist(item.ProductID)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{item.ProductName}</h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold">LKR {item.BasePrice.toLocaleString()}</span>
                      {item.WholesalePrice && item.WholesalePrice < item.BasePrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          LKR {item.WholesalePrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => addToCart(item.ProductID)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Link href={`/products/${item.ProductID}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
