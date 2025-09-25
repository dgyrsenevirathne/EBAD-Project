"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Plus } from "lucide-react"

interface CartItem {
  CartID: number
  ProductID: number
  VariantID: number | null
  Quantity: number
  ProductName: string
  BasePrice: number
  WholesalePrice: number | null
  Size: string | null
  Color: string | null
  Stock: number
  ImageURL: string | null
  Festival: string | null
}

interface Product {
  ProductID: number
  ProductName: string
  BasePrice: number
  PrimaryImage: string | null
  Festival: string | null
  IsFeatured?: number
  Description?: string
  Stock?: number
}

interface BundleItem {
  ProductID: number
  ProductName: string
  BasePrice: number
  PrimaryImage: string
  quantity: number
}

interface Bundle {
  name: string
  description: string
  discount: number // percentage
  items: BundleItem[]
}

export function FestivalBundleGenerator({ cartItems, onAddToCart }: { cartItems: CartItem[], onAddToCart: (productId: number, quantity: number) => Promise<void> }) {
  const [suggestedBundles, setSuggestedBundles] = useState<Bundle[]>([])
  const [addedBundles, setAddedBundles] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const festivalsInCart = [...new Set(cartItems
      .filter(item => item.Festival !== null)
      .map(item => item.Festival as string)
    )]

    if (festivalsInCart.length === 0) {
      setSuggestedBundles([])
      return
    }

    const generateBundles = async () => {
      setLoading(true)
      const allBundles: Bundle[] = []

      for (const festival of festivalsInCart) {
        // Get unique product IDs in cart for this festival to exclude
        const cartProductIdsForFestival = cartItems
          .filter(item => item.Festival === festival)
          .map(item => item.ProductID)

        try {
          const response = await fetch(`/api/products/festival-bundles?festival=${encodeURIComponent(festival)}&cartProductIds=${cartProductIdsForFestival.join(',')}`)
          const data = await response.json()

          if (data.success && data.data.length > 0) {
            const products: Product[] = data.data

            // Generate 2-item bundle if possible (10% off)
            if (products.length >= 2) {
              const bundle2 = createBundle(products.slice(0, 2), festival, 2, 10)
              allBundles.push(bundle2)
            }

            // Generate 3-item bundle if possible (20% off)
            if (products.length >= 3) {
              const bundle3 = createBundle(products.slice(0, 3), festival, 3, 20)
              allBundles.push(bundle3)
            }
          }
        } catch (error) {
          console.error(`Failed to fetch bundles for ${festival}:`, error)
        }
      }

      setSuggestedBundles(allBundles)
      setLoading(false)
    }

    generateBundles()
  }, [cartItems])

  const createBundle = (products: Product[], festival: string, itemCount: number, discount: number): Bundle => {
    const items: BundleItem[] = products.map(product => ({
      ProductID: product.ProductID,
      ProductName: product.ProductName,
      BasePrice: product.BasePrice,
      PrimaryImage: product.PrimaryImage || '/placeholder.svg',
      quantity: 1
    }))

    return {
      name: `${festival} Festival Bundle - ${itemCount} Items`,
      description: `Complete your ${festival} celebration with these complementary items and save ${discount}%!`,
      discount,
      items
    }
  }

  const addBundleToCart = async (bundle: Bundle) => {
    for (const item of bundle.items) {
      try {
        await onAddToCart(item.ProductID, item.quantity)
      } catch (error) {
        console.error(`Failed to add ${item.ProductName} to cart:`, error)
      }
    }
    setAddedBundles(prev => new Set(prev).add(bundle.name))
  }

  if (loading || suggestedBundles.length === 0) {
    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Festival Bundle Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedBundles.map((bundle, index) => {
          const totalPrice = bundle.items.reduce((sum, item) => sum + item.BasePrice * item.quantity, 0)
          const discountedPrice = totalPrice * (1 - bundle.discount / 100)
          const isAdded = addedBundles.has(bundle.name)

          return (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{bundle.name}</h4>
                  <p className="text-sm text-muted-foreground">{bundle.description}</p>
                </div>
                <Badge variant="secondary">{bundle.discount}% off</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                {bundle.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-2 text-sm">
                    <img
                      src={item.PrimaryImage || "/placeholder.svg"}
                      alt={item.ProductName}
                      className="w-8 h-8 object-cover rounded"
                    />
                    <div>
                      <span className="font-medium">{item.ProductName}</span>
                      <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <span className="line-through text-muted-foreground">LKR {totalPrice.toLocaleString()}</span>
                  <span className="font-bold text-green-600 ml-2">LKR {discountedPrice.toLocaleString()}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => addBundleToCart(bundle)}
                  disabled={isAdded}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  {isAdded ? "Added" : "Add Bundle"}
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
