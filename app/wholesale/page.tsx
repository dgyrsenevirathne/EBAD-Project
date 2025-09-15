"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Users,
  Package,
  TrendingDown,
  Calculator,
  FileText,
  Download,
  Plus,
  Minus,
  ShoppingCart,
  Building,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"
import { CartDrawer } from "@/components/cart-drawer"

// Mock wholesale products with tiered pricing
const mockWholesaleProducts = [
  {
    id: 1,
    name: "Traditional Kandyan Saree",
    sku: "TKS-001",
    category: "Women",
    basePrice: 12500,
    image: "/traditional-kandyan-saree.png",
    colors: ["Red", "Blue", "Gold"],
    sizes: ["S", "M", "L", "XL"],
    stock: 150,
    minOrderQty: 10,
    pricing: [
      { minQty: 10, maxQty: 49, price: 10000, discount: "20%" },
      { minQty: 50, maxQty: 99, price: 9375, discount: "25%" },
      { minQty: 100, maxQty: null, price: 8750, discount: "30%" },
    ],
  },
  {
    id: 2,
    name: "Men's Batik Shirt",
    sku: "MBS-002",
    category: "Men",
    basePrice: 3500,
    image: "/sri-lankan-batik-shirt.png",
    colors: ["Blue", "Green", "Brown"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 200,
    minOrderQty: 20,
    pricing: [
      { minQty: 20, maxQty: 49, price: 2800, discount: "20%" },
      { minQty: 50, maxQty: 99, price: 2625, discount: "25%" },
      { minQty: 100, maxQty: null, price: 2450, discount: "30%" },
    ],
  },
  {
    id: 3,
    name: "Kids Festival Dress",
    sku: "KFD-003",
    category: "Kids",
    basePrice: 2800,
    image: "/sri-lankan-kids-festival-dress.png",
    colors: ["Pink", "Yellow", "White"],
    sizes: ["2T", "3T", "4T", "5T"],
    stock: 180,
    minOrderQty: 25,
    pricing: [
      { minQty: 25, maxQty: 49, price: 2240, discount: "20%" },
      { minQty: 50, maxQty: 99, price: 2100, discount: "25%" },
      { minQty: 100, maxQty: null, price: 1960, discount: "30%" },
    ],
  },
]

const mockWholesaleOrders = [
  {
    id: "WHO001",
    date: "2024-01-15",
    status: "delivered",
    total: 125000,
    items: 50,
    discount: 25000,
    invoiceNumber: "INV-WHO001",
  },
  {
    id: "WHO002",
    date: "2024-01-10",
    status: "shipped",
    total: 87500,
    items: 25,
    discount: 12500,
    invoiceNumber: "INV-WHO002",
  },
  {
    id: "WHO003",
    date: "2024-01-05",
    status: "processing",
    total: 156000,
    items: 80,
    discount: 34000,
    invoiceNumber: null,
  },
]

export default function WholesalePage() {
  const [quickOrderItems, setQuickOrderItems] = useState<
    Array<{ sku: string; quantity: number; color: string; size: string }>
  >([{ sku: "", quantity: 0, color: "", size: "" }])
  const [selectedProduct, setSelectedProduct] = useState<(typeof mockWholesaleProducts)[0] | null>(null)
  const [calculatorQty, setCalculatorQty] = useState(50)
  const [wholesaleInquiry, setWholesaleInquiry] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    businessType: "",
    expectedVolume: "",
    message: "",
  })

  const addQuickOrderRow = () => {
    setQuickOrderItems([...quickOrderItems, { sku: "", quantity: 0, color: "", size: "" }])
  }

  const removeQuickOrderRow = (index: number) => {
    if (quickOrderItems.length > 1) {
      setQuickOrderItems(quickOrderItems.filter((_, i) => i !== index))
    }
  }

  const updateQuickOrderItem = (index: number, field: string, value: string | number) => {
    const updated = quickOrderItems.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    setQuickOrderItems(updated)
  }

  const getWholesalePrice = (product: (typeof mockWholesaleProducts)[0], quantity: number) => {
    const tier = product.pricing.find((p) => quantity >= p.minQty && (p.maxQty === null || quantity <= p.maxQty))
    return tier ? tier.price : product.basePrice
  }

  const getDiscountPercentage = (product: (typeof mockWholesaleProducts)[0], quantity: number) => {
    const tier = product.pricing.find((p) => quantity >= p.minQty && (p.maxQty === null || quantity <= p.maxQty))
    return tier ? tier.discount : "0%"
  }

  const submitWholesaleInquiry = () => {
    console.log("Wholesale inquiry submitted:", wholesaleInquiry)
    alert("Thank you for your inquiry! We'll contact you within 24 hours.")
    setWholesaleInquiry({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      businessType: "",
      expectedVolume: "",
      message: "",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-600 hover:bg-green-700"
      case "shipped":
        return "bg-blue-600 hover:bg-blue-700"
      case "processing":
        return "bg-orange-600 hover:bg-orange-700"
      default:
        return "bg-gray-600 hover:bg-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
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
              <Badge className="bg-blue-600 hover:bg-blue-700">Wholesale Portal</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <CartDrawer refreshTrigger={0} />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold">Wholesale Portal</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Bulk orders with special pricing for retailers, boutiques, and businesses. Minimum order quantities apply.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <TrendingDown className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="font-semibold">Up to 30% Off</p>
              <p className="text-sm text-muted-foreground">Volume discounts</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <Package className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold">Bulk Packaging</p>
              <p className="text-sm text-muted-foreground">Efficient shipping</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <FileText className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="font-semibold">Business Invoices</p>
              <p className="text-sm text-muted-foreground">Tax compliant</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <Building className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="font-semibold">Dedicated Support</p>
              <p className="text-sm text-muted-foreground">Business account manager</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="quick-order">Quick Order</TabsTrigger>
            <TabsTrigger value="calculator">Price Calculator</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="inquiry">Business Inquiry</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wholesale Products</CardTitle>
                <CardDescription>Browse our collection with volume pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockWholesaleProducts.map((product) => (
                    <Card key={product.id} className="group">
                      <div className="aspect-square relative overflow-hidden rounded-t-lg">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <Badge className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700">
                          Min {product.minOrderQty} pcs
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Retail Price:</span>
                              <span className="line-through text-muted-foreground">
                                LKR {product.basePrice.toLocaleString()}
                              </span>
                            </div>
                            {product.pricing.map((tier, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>
                                  {tier.minQty}
                                  {tier.maxQty ? `-${tier.maxQty}` : "+"} pcs:
                                </span>
                                <div className="text-right">
                                  <span className="font-semibold text-green-600">
                                    LKR {tier.price.toLocaleString()}
                                  </span>
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {tier.discount} off
                                  </Badge>
                                </div>
                              </div>
                            ))}
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
                          <p className="text-xs text-muted-foreground">{product.stock} units in stock</p>
                          <Button size="sm" className="w-full">
                            Add to Wholesale Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quick-order" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Quick Order Form
                </CardTitle>
                <CardDescription>Enter SKUs and quantities for fast bulk ordering</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                    <div className="col-span-3">SKU</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Color</div>
                    <div className="col-span-2">Size</div>
                    <div className="col-span-2">Unit Price</div>
                    <div className="col-span-1">Action</div>
                  </div>
                  {quickOrderItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">
                        <Select value={item.sku} onValueChange={(value) => updateQuickOrderItem(index, "sku", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select SKU" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockWholesaleProducts.map((product) => (
                              <SelectItem key={product.sku} value={product.sku}>
                                {product.sku} - {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity || ""}
                          onChange={(e) =>
                            updateQuickOrderItem(index, "quantity", Number.parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="col-span-2">
                        <Select
                          value={item.color}
                          onValueChange={(value) => updateQuickOrderItem(index, "color", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Color" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Red">Red</SelectItem>
                            <SelectItem value="Blue">Blue</SelectItem>
                            <SelectItem value="Gold">Gold</SelectItem>
                            <SelectItem value="Green">Green</SelectItem>
                            <SelectItem value="Brown">Brown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Select value={item.size} onValueChange={(value) => updateQuickOrderItem(index, "size", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="S">S</SelectItem>
                            <SelectItem value="M">M</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="XL">XL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm font-medium">
                          {item.sku && item.quantity > 0 ? (
                            <>
                              LKR{" "}
                              {getWholesalePrice(
                                mockWholesaleProducts.find((p) => p.sku === item.sku)!,
                                item.quantity,
                              ).toLocaleString()}
                            </>
                          ) : (
                            "-"
                          )}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeQuickOrderRow(index)}
                          disabled={quickOrderItems.length === 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={addQuickOrderRow} className="bg-transparent">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Row
                    </Button>
                    <Button>Process Quick Order</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Price Calculator
                  </CardTitle>
                  <CardDescription>Calculate wholesale pricing for different quantities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="product-select">Select Product</Label>
                    <Select
                      value={selectedProduct?.id.toString() || ""}
                      onValueChange={(value) =>
                        setSelectedProduct(mockWholesaleProducts.find((p) => p.id.toString() === value) || null)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockWholesaleProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} ({product.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={calculatorQty}
                      onChange={(e) => setCalculatorQty(Number.parseInt(e.target.value) || 0)}
                      min={selectedProduct?.minOrderQty || 1}
                    />
                    {selectedProduct && calculatorQty < selectedProduct.minOrderQty && (
                      <p className="text-sm text-orange-600 mt-1">
                        Minimum order quantity: {selectedProduct.minOrderQty}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {selectedProduct && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Product:</span>
                        <span className="font-medium">{selectedProduct.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span className="font-medium">{calculatorQty} pieces</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retail Price:</span>
                        <span className="line-through text-muted-foreground">
                          LKR {selectedProduct.basePrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wholesale Price:</span>
                        <span className="font-semibold text-green-600">
                          LKR {getWholesalePrice(selectedProduct, calculatorQty).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <Badge className="bg-green-600 hover:bg-green-700">
                          {getDiscountPercentage(selectedProduct, calculatorQty)}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>
                          LKR {(getWholesalePrice(selectedProduct, calculatorQty) * calculatorQty).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>You save:</span>
                        <span>
                          LKR{" "}
                          {(
                            (selectedProduct.basePrice - getWholesalePrice(selectedProduct, calculatorQty)) *
                            calculatorQty
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Button className="w-full" disabled={calculatorQty < selectedProduct.minOrderQty}>
                      Add to Wholesale Cart
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Wholesale Orders
                </CardTitle>
                <CardDescription>Track your bulk orders and download invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockWholesaleOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-semibold">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.date}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">LKR {order.total.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{order.items} items</p>
                        <p className="text-sm text-green-600">Saved: LKR {order.discount.toLocaleString()}</p>
                        {order.invoiceNumber && (
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Invoice
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiry" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Inquiry</CardTitle>
                  <CardDescription>Get in touch for custom wholesale arrangements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={wholesaleInquiry.companyName}
                        onChange={(e) => setWholesaleInquiry({ ...wholesaleInquiry, companyName: e.target.value })}
                        placeholder="Your Business Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={wholesaleInquiry.contactPerson}
                        onChange={(e) => setWholesaleInquiry({ ...wholesaleInquiry, contactPerson: e.target.value })}
                        placeholder="Your Name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={wholesaleInquiry.email}
                        onChange={(e) => setWholesaleInquiry({ ...wholesaleInquiry, email: e.target.value })}
                        placeholder="business@company.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={wholesaleInquiry.phone}
                        onChange={(e) => setWholesaleInquiry({ ...wholesaleInquiry, phone: e.target.value })}
                        placeholder="+94 11 234 5678"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select
                        value={wholesaleInquiry.businessType}
                        onValueChange={(value) => setWholesaleInquiry({ ...wholesaleInquiry, businessType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retailer">Retailer</SelectItem>
                          <SelectItem value="boutique">Boutique</SelectItem>
                          <SelectItem value="online-store">Online Store</SelectItem>
                          <SelectItem value="distributor">Distributor</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="expectedVolume">Expected Monthly Volume</Label>
                      <Select
                        value={wholesaleInquiry.expectedVolume}
                        onValueChange={(value) => setWholesaleInquiry({ ...wholesaleInquiry, expectedVolume: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select volume" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50-100">50-100 pieces</SelectItem>
                          <SelectItem value="100-500">100-500 pieces</SelectItem>
                          <SelectItem value="500-1000">500-1000 pieces</SelectItem>
                          <SelectItem value="1000+">1000+ pieces</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={wholesaleInquiry.message}
                      onChange={(e) => setWholesaleInquiry({ ...wholesaleInquiry, message: e.target.value })}
                      placeholder="Tell us about your business requirements..."
                      rows={4}
                    />
                  </div>
                  <Button onClick={submitWholesaleInquiry} className="w-full">
                    Submit Inquiry
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Get in touch with our wholesale team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Wholesale Hotline</p>
                        <p className="text-sm text-muted-foreground">+94 11 234 5678</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Business Email</p>
                        <p className="text-sm text-muted-foreground">wholesale@ceylonthreads.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Showroom</p>
                        <p className="text-sm text-muted-foreground">123 Galle Road, Colombo 03</p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Business Hours</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 9:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Minimum Requirements</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Minimum order: LKR 25,000</p>
                      <p>• Business registration required</p>
                      <p>• Credit terms available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
