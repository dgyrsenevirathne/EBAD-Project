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
}

interface BundleItem {
  ProductID: number
  ProductName: string
  BasePrice: number
  PrimaryImage: string | null
  quantity: number
}

interface Bundle {
  name: string
  description: string
  discount: number // percentage
  items: BundleItem[]
}

const festivalBundles: Record<string, Bundle[]> = {
  Avurudu: [
    {
      name: "Traditional Avurudu Outfit",
      description: "Complete traditional Sri Lankan New Year attire",
      discount: 15,
      items: [
        { ProductID: 1, ProductName: "Traditional Kandyan Saree", BasePrice: 2500, PrimaryImage: "/traditional-kandyan-saree-front.png", quantity: 1 },
        { ProductID: 2, ProductName: "Handloom Cotton Blouse", BasePrice: 800, PrimaryImage: "/handloom-cotton-blouse.png", quantity: 1 },
        { ProductID: 3, ProductName: "Traditional Jewelry Set", BasePrice: 1200, PrimaryImage: null, quantity: 1 }
      ]
    }
  ],
  Vesak: [
    {
      name: "Vesak Celebration Set",
      description: "White attire and accessories for Vesak Poya",
      discount: 10,
      items: [
        { ProductID: 4, ProductName: "White Cotton Saree", BasePrice: 1800, PrimaryImage: null, quantity: 1 },
        { ProductID: 5, ProductName: "Lotus Motif Accessories", BasePrice: 500, PrimaryImage: null, quantity: 1 }
      ]
    }
  ],
  Christmas: [
    {
      name: "Festive Christmas Collection",
      description: "Colorful traditional wear for Christmas celebrations",
      discount: 12,
      items: [
        { ProductID: 6, ProductName: "Red and Gold Saree", BasePrice: 2200, PrimaryImage: null, quantity: 1 },
        { ProductID: 7, ProductName: "Christmas Accessories", BasePrice: 600, PrimaryImage: null, quantity: 1 }
      ]
    }
  ]
}

export function FestivalBundleGenerator({ cartItems, onAddToCart }: { cartItems: CartItem[], onAddToCart: (productId: number, quantity: number) => void }) {
  const [suggestedBundles, setSuggestedBundles] = useState<Bundle[]>([])
  const [addedBundles, setAddedBundles] = useState<Set<string>>(new Set())

  useEffect(() => {
    const festivalsInCart = new Set(cartItems.map(item => item.Festival).filter(Boolean))
    const bundles: Bundle[] = []

    festivalsInCart.forEach(festival => {
      if (festival && festivalBundles[festival]) {
        bundles.push(...festivalBundles[festival])
      }
    })

    setSuggestedBundles(bundles)
  }, [cartItems])

  const addBundleToCart = async (bundle: Bundle) => {
    for (const item of bundle.items) {
      await onAddToCart(item.ProductID, item.quantity)
    }
    setAddedBundles(prev => new Set(prev).add(bundle.name))
  }

  if (suggestedBundles.length === 0) {
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
