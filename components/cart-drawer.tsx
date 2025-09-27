"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

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

export function CartDrawer({ refreshTrigger }: { refreshTrigger?: number }) {
  const { user, token } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetchCart = async () => {
    if (user && token) {
      // Fetch from API for logged-in users
      try {
        const response = await fetch('/api/cart', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (data.success) {
          setCartItems(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error)
      }
    } else {
      // Load from localStorage for guests
      const guestCart = localStorage.getItem('guestCart')
      if (guestCart) {
        try {
          const parsedCart = JSON.parse(guestCart)
          // Fix: Ensure product name and price are present in guest cart items
          const fixedCart = parsedCart.map((item: any) => ({
            ...item,
            ProductName: item.ProductName || 'Product',
            BasePrice: item.BasePrice || 0,
          }))
          setCartItems(fixedCart)
        } catch (error) {
          console.error('Failed to parse guest cart:', error)
          setCartItems([])
        }
      } else {
        setCartItems([])
      }
    }
  }

  useEffect(() => {
    if (isOpen && cartItems.length === 0) {
      fetchCart()
    }
  }, [isOpen, user])

  useEffect(() => {
    if (refreshTrigger) {
      fetchCart()
    }
  }, [refreshTrigger, user])

  const updateQuantity = async (cartId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(cartId)
      return
    }

    if (user && token) {
      // Update via API for logged-in users
      try {
        const response = await fetch(`/api/cart/${cartId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: newQuantity }),
        })

        const data = await response.json()

        if (data.success) {
          setCartItems(cartItems.map((item) => (item.CartID === cartId ? { ...item, Quantity: newQuantity } : item)))
        } else {
          alert(data.message || 'Failed to update quantity')
        }
      } catch (error) {
        console.error('Failed to update quantity:', error)
        alert('Failed to update quantity')
      }
    } else {
      // Update in localStorage for guests
      const guestCart = localStorage.getItem('guestCart')
      if (guestCart) {
        try {
          let cartItems: CartItem[] = JSON.parse(guestCart)
          cartItems = cartItems.map((item) => (item.CartID === cartId ? { ...item, Quantity: newQuantity } : item))
          localStorage.setItem('guestCart', JSON.stringify(cartItems))
          setCartItems(cartItems)
        } catch (error) {
          console.error('Failed to update guest cart:', error)
        }
      }
    }
  }

  const removeItem = async (cartId: number) => {
    if (user && token) {
      // Remove via API for logged-in users
      try {
        const response = await fetch(`/api/cart/${cartId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (data.success) {
          setCartItems(cartItems.filter((item) => item.CartID !== cartId))
        } else {
          alert(data.message || 'Failed to remove item')
        }
      } catch (error) {
        console.error('Failed to remove item:', error)
        alert('Failed to remove item')
      }
    } else {
      // Remove from localStorage for guests
      const guestCart = localStorage.getItem('guestCart')
      if (guestCart) {
        try {
          let cartItems: CartItem[] = JSON.parse(guestCart)
          cartItems = cartItems.filter((item) => item.CartID !== cartId)
          localStorage.setItem('guestCart', JSON.stringify(cartItems))
          setCartItems(cartItems)
        } catch (error) {
          console.error('Failed to remove from guest cart:', error)
        }
      }
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.BasePrice * item.Quantity, 0)
  const totalItems = cartItems.reduce((sum, item) => sum + item.Quantity, 0)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative bg-transparent">
          <ShoppingBag className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-orange-600 hover:bg-orange-700">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mb-4">Add some items to get started!</p>
              <Button onClick={() => setIsOpen(false)}>Continue Shopping</Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.CartID} className="flex gap-3 p-3 border rounded-lg">
                    <img
                      src={item.ImageURL || "/placeholder.svg"}
                      alt={item.ProductName}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium text-sm line-clamp-2">{item.ProductName}</h4>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>{item.Color}</span>
                        <span>•</span>
                        <span>{item.Size}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">LKR {item.BasePrice.toLocaleString()}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0 bg-transparent"
                            onClick={() => updateQuantity(item.CartID, item.Quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.Quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0 bg-transparent"
                            onClick={() => updateQuantity(item.CartID, item.Quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0 ml-2 bg-transparent"
                            onClick={() => removeItem(item.CartID)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="font-bold text-lg">LKR {subtotal.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Link href="/cart" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full bg-transparent">
                      View Cart
                    </Button>
                  </Link>
                  <Link href="/cart" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Checkout</Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
