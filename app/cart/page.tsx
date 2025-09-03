"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Gift, Truck, CreditCard } from "lucide-react"

// Mock cart data
const mockCartItems = [
  {
    id: 1,
    productId: 1,
    name: "Traditional Kandyan Saree",
    price: 12500,
    originalPrice: 15000,
    image: "/traditional-kandyan-saree.png",
    color: "Red",
    size: "M",
    quantity: 1,
    stock: 15,
  },
  {
    id: 2,
    productId: 2,
    name: "Men's Batik Shirt",
    price: 3500,
    originalPrice: null,
    image: "/sri-lankan-batik-shirt.png",
    color: "Blue",
    size: "L",
    quantity: 2,
    stock: 8,
  },
  {
    id: 3,
    productId: 3,
    name: "Kids Festival Dress",
    price: 2800,
    originalPrice: 3200,
    image: "/sri-lankan-kids-festival-dress.png",
    color: "Pink",
    size: "3T",
    quantity: 1,
    stock: 22,
  },
]

const provinces = [
  "Western",
  "Central",
  "Southern",
  "Northern",
  "Eastern",
  "North Western",
  "North Central",
  "Uva",
  "Sabaragamuwa",
]

const paymentMethods = [
  { id: "cod", name: "Cash on Delivery", icon: "💵" },
  { id: "card", name: "Credit/Debit Card", icon: "💳" },
  { id: "frimi", name: "FriMi", icon: "📱" },
  { id: "ezcash", name: "eZ Cash", icon: "💰" },
  { id: "sampath", name: "SampathPay", icon: "🏦" },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState(mockCartItems)
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null)
  const [loyaltyPoints, setLoyaltyPoints] = useState(250)
  const [usePoints, setUsePoints] = useState(false)
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
  })
  const [selectedPayment, setSelectedPayment] = useState("cod")

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }
    setCartItems(
      cartItems.map((item) => (item.id === id ? { ...item, quantity: Math.min(newQuantity, item.stock) } : item)),
    )
  }

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const applyPromoCode = () => {
    // Mock promo code validation
    if (promoCode.toLowerCase() === "avurudu2024") {
      setAppliedPromo({ code: promoCode, discount: 1000 })
      setPromoCode("")
    } else if (promoCode.toLowerCase() === "welcome10") {
      setAppliedPromo({ code: promoCode, discount: subtotal * 0.1 })
      setPromoCode("")
    } else {
      alert("Invalid promo code")
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const savings = cartItems.reduce(
    (sum, item) => sum + (item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0),
    0,
  )
  const promoDiscount = appliedPromo?.discount || 0
  const pointsDiscount = usePoints ? Math.min(loyaltyPoints * 5, subtotal * 0.2) : 0 // 1 point = LKR 5, max 20% of subtotal
  const shippingCost = subtotal >= 5000 ? 0 : 500
  const total = subtotal - promoDiscount - pointsDiscount + shippingCost

  const pointsToEarn = Math.floor(total / 100) // 1 point per LKR 100

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/products">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-primary">Ceylon Threads</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12 text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Add some beautiful Sri Lankan fashion items to get started!</p>
          <Link href="/products">
            <Button size="lg">Start Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/products">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-primary">Ceylon Threads</h1>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Shopping Cart
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Color: {item.color}</span>
                        <span>Size: {item.size}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">LKR {item.price.toLocaleString()}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              LKR {item.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {item.quantity >= item.stock && (
                        <p className="text-xs text-orange-600">Maximum available quantity reached</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={shippingAddress.firstName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={shippingAddress.lastName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                  <Input
                    id="addressLine2"
                    value={shippingAddress.addressLine2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                    placeholder="Apartment, suite, etc."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="Colombo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="province">Province</Label>
                    <Select
                      value={shippingAddress.province}
                      onValueChange={(value) => setShippingAddress({ ...shippingAddress, province: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      placeholder="10100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      placeholder="+94 71 234 5678"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>LKR {subtotal.toLocaleString()}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>You saved</span>
                      <span>-LKR {savings.toLocaleString()}</span>
                    </div>
                  )}
                  {appliedPromo && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo ({appliedPromo.code})</span>
                      <span>-LKR {promoDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  {usePoints && pointsDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Loyalty Points</span>
                      <span>-LKR {pointsDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? "FREE" : `LKR ${shippingCost}`}</span>
                  </div>
                  {shippingCost === 0 && (
                    <p className="text-xs text-green-600">Free shipping on orders over LKR 5,000</p>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>LKR {total.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Gift className="h-4 w-4" />
                  <span>You'll earn {pointsToEarn} loyalty points</span>
                </div>
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Promo Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button onClick={applyPromoCode} disabled={!promoCode}>
                    Apply
                  </Button>
                </div>
                {appliedPromo && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">✓ {appliedPromo.code} applied</span>
                    <Button variant="ghost" size="sm" onClick={() => setAppliedPromo(null)}>
                      Remove
                    </Button>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  <p>Try: AVURUDU2024 or WELCOME10</p>
                </div>
              </CardContent>
            </Card>

            {/* Loyalty Points */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Use Loyalty Points
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Available: {loyaltyPoints} points</span>
                  <span className="text-sm text-muted-foreground">= LKR {(loyaltyPoints * 5).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="usePoints"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="usePoints" className="text-sm">
                    Use points for this order (Max 20% discount)
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={method.id}
                      name="payment"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="rounded"
                    />
                    <Label htmlFor={method.id} className="text-sm flex items-center gap-2">
                      <span>{method.icon}</span>
                      {method.name}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button size="lg" className="w-full">
              Place Order - LKR {total.toLocaleString()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
