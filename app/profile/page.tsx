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
import { ArrowLeft, User, MapPin, ShoppingBag, Gift, Heart, Edit, Plus, Star } from "lucide-react"
import { CartDrawer } from "@/components/cart-drawer"

// Mock user data
const mockUser = {
  firstName: "Priya",
  lastName: "Fernando",
  email: "priya.fernando@email.com",
  phone: "+94 71 234 5678",
  loyaltyPoints: 1250,
  tier: "Gold",
  totalOrders: 12,
  totalSpent: 45000,
}

const mockAddresses = [
  {
    id: 1,
    firstName: "Priya",
    lastName: "Fernando",
    addressLine1: "123 Galle Road",
    addressLine2: "Apartment 4B",
    city: "Colombo",
    province: "Western",
    postalCode: "00300",
    isDefault: true,
  },
  {
    id: 2,
    firstName: "Priya",
    lastName: "Fernando",
    addressLine1: "456 Kandy Road",
    addressLine2: "",
    city: "Kandy",
    province: "Central",
    postalCode: "20000",
    isDefault: false,
  },
]

const mockOrders = [
  {
    id: "ORD001",
    date: "2024-01-15",
    status: "delivered",
    total: 12500,
    items: 2,
    trackingNumber: "TRK123456789",
  },
  {
    id: "ORD002",
    date: "2024-01-10",
    status: "shipped",
    total: 8500,
    items: 1,
    trackingNumber: "TRK987654321",
  },
  {
    id: "ORD003",
    date: "2024-01-05",
    status: "processing",
    total: 15000,
    items: 3,
    trackingNumber: null,
  },
]

const mockWishlist = [
  {
    id: 1,
    name: "Wedding Osariya",
    price: 25000,
    originalPrice: 28000,
    image: "/sri-lankan-wedding-osariya.png",
    inStock: true,
  },
  {
    id: 2,
    name: "Men's Batik Shirt",
    price: 3500,
    originalPrice: null,
    image: "/sri-lankan-batik-shirt.png",
    inStock: true,
  },
  {
    id: 3,
    name: "Traditional Kandyan Saree",
    price: 12500,
    originalPrice: 15000,
    image: "/traditional-kandyan-saree.png",
    inStock: false,
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

export default function ProfilePage() {
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingAddress, setEditingAddress] = useState<number | null>(null)
  const [showAddAddress, setShowAddAddress] = useState(false)

  const [profileData, setProfileData] = useState(mockUser)
  const [addresses, setAddresses] = useState(mockAddresses)
  const [newAddress, setNewAddress] = useState({
    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    isDefault: false,
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-600 hover:bg-green-700"
      case "shipped":
        return "bg-blue-600 hover:bg-blue-700"
      case "processing":
        return "bg-orange-600 hover:bg-orange-700"
      case "cancelled":
        return "bg-red-600 hover:bg-red-700"
      default:
        return "bg-gray-600 hover:bg-gray-700"
    }
  }

  const saveProfile = () => {
    setEditingProfile(false)
    // Mock save
    console.log("Profile saved:", profileData)
  }

  const saveAddress = (addressId: number) => {
    setEditingAddress(null)
    // Mock save
    console.log("Address saved:", addressId)
  }

  const addNewAddress = () => {
    const newId = Math.max(...addresses.map((a) => a.id)) + 1
    setAddresses([...addresses, { ...newAddress, id: newId }])
    setNewAddress({
      firstName: "",
      lastName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      province: "",
      postalCode: "",
      isDefault: false,
    })
    setShowAddAddress(false)
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
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/rewards">
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Gift className="h-4 w-4 mr-2" />
                  {mockUser.loyaltyPoints} pts
                </Button>
              </Link>
              <CartDrawer />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {mockUser.firstName} {mockUser.lastName}
            </h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{mockUser.tier} Member</span>
              <span>•</span>
              <span>{mockUser.totalOrders} Orders</span>
              <span>•</span>
              <span>LKR {mockUser.totalSpent.toLocaleString()} Spent</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <Gift className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{mockUser.loyaltyPoints}</p>
              <p className="text-sm text-muted-foreground">Loyalty Points</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <ShoppingBag className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{mockUser.totalOrders}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{mockWishlist.length}</p>
              <p className="text-sm text-muted-foreground">Wishlist Items</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{mockUser.tier}</p>
              <p className="text-sm text-muted-foreground">Member Tier</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Manage your account details</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (editingProfile ? saveProfile() : setEditingProfile(true))}
                    className="bg-transparent"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {editingProfile ? "Save" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      disabled={!editingProfile}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      disabled={!editingProfile}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!editingProfile}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!editingProfile}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Track your recent purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrders.map((order) => (
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
                        {order.trackingNumber && (
                          <p className="text-xs text-muted-foreground">Track: {order.trackingNumber}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Delivery Addresses</CardTitle>
                    <CardDescription>Manage your shipping addresses</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddAddress(true)}
                    className="bg-transparent"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {address.firstName} {address.lastName}
                          </span>
                          {address.isDefault && (
                            <Badge variant="outline" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAddress(editingAddress === address.id ? null : address.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      {editingAddress === address.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Input placeholder="First Name" defaultValue={address.firstName} />
                            <Input placeholder="Last Name" defaultValue={address.lastName} />
                          </div>
                          <Input placeholder="Address Line 1" defaultValue={address.addressLine1} />
                          <Input placeholder="Address Line 2" defaultValue={address.addressLine2} />
                          <div className="grid grid-cols-3 gap-3">
                            <Input placeholder="City" defaultValue={address.city} />
                            <Select defaultValue={address.province}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {provinces.map((province) => (
                                  <SelectItem key={province} value={province}>
                                    {province}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input placeholder="Postal Code" defaultValue={address.postalCode} />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => saveAddress(address.id)}>
                              Save
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingAddress(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          <p>{address.addressLine1}</p>
                          {address.addressLine2 && <p>{address.addressLine2}</p>}
                          <p>
                            {address.city}, {address.province} {address.postalCode}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {showAddAddress && (
                    <div className="p-4 border-2 border-dashed rounded-lg">
                      <h3 className="font-medium mb-3">Add New Address</h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="First Name"
                            value={newAddress.firstName}
                            onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
                          />
                          <Input
                            placeholder="Last Name"
                            value={newAddress.lastName}
                            onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
                          />
                        </div>
                        <Input
                          placeholder="Address Line 1"
                          value={newAddress.addressLine1}
                          onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                        />
                        <Input
                          placeholder="Address Line 2 (Optional)"
                          value={newAddress.addressLine2}
                          onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                        />
                        <div className="grid grid-cols-3 gap-3">
                          <Input
                            placeholder="City"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          />
                          <Select
                            value={newAddress.province}
                            onValueChange={(value) => setNewAddress({ ...newAddress, province: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Province" />
                            </SelectTrigger>
                            <SelectContent>
                              {provinces.map((province) => (
                                <SelectItem key={province} value={province}>
                                  {province}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Postal Code"
                            value={newAddress.postalCode}
                            onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={addNewAddress}>
                            Add Address
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setShowAddAddress(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>Items you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockWishlist.map((item) => (
                    <Card key={item.id} className="group">
                      <div className="aspect-square relative overflow-hidden rounded-t-lg">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {!item.inStock && (
                          <Badge variant="destructive" className="absolute top-2 left-2">
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm mb-2">{item.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-bold">LKR {item.price.toLocaleString()}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              LKR {item.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1" disabled={!item.inStock}>
                            {item.inStock ? "Add to Cart" : "Notify Me"}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
