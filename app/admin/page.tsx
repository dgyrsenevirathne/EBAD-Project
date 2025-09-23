"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Bell,
  Settings,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"

// Mock data for admin dashboard
const mockAnalytics = {
  totalRevenue: 2450000,
  totalOrders: 1234,
  totalCustomers: 856,
  avgOrderValue: 1986,
  monthlyGrowth: 12.5,
  topProducts: [
    { name: "Traditional Kandyan Saree", sold: 145, revenue: 435000 },
    { name: "Batik Festival Shirt", sold: 132, revenue: 264000 },
    { name: "Handloom Cotton Blouse", sold: 98, revenue: 196000 },
    { name: "Kids Avurudu Dress", sold: 87, revenue: 174000 },
    { name: "Sri Lankan Sarong", sold: 76, revenue: 152000 },
  ],
  lowStockItems: [
    { name: "Traditional Kandyan Saree", variant: "Red - Medium", stock: 3 },
    { name: "Batik Festival Shirt", variant: "Blue - Large", stock: 5 },
    { name: "Handloom Blouse", variant: "White - Small", stock: 2 },
    { name: "Kids Festival Dress", variant: "Pink - Age 8", stock: 4 },
  ],
  recentOrders: [
    { id: "ORD-2024-001", customer: "Priya Perera", amount: 4500, status: "processing", date: "2024-01-15" },
    { id: "ORD-2024-002", customer: "Kasun Silva", amount: 2800, status: "shipped", date: "2024-01-15" },
    { id: "ORD-2024-003", customer: "Nimali Fernando", amount: 6200, status: "delivered", date: "2024-01-14" },
    { id: "ORD-2024-004", customer: "Rohan Jayawardena", amount: 3400, status: "processing", date: "2024-01-14" },
  ],
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Product form state
  const [productForm, setProductForm] = useState({
    productName: "",
    description: "",
    categoryId: "",
    basePrice: "",
    wholesalePrice: "",
    festival: "",
    stock: "",
    isFeatured: false,
    imageUrl: "",
    imageFile: null as File | null,
    variants: [{ size: "", color: "", stock: "" }] // Array of variants
  })

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    categoryName: "",
    description: "",
    parentCategoryId: ""
  })

  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/products/categories')
        const data = await response.json()
        if (data.success) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    if (activeTab === "products" || activeTab === "categories") {
      fetchCategories()
    }
  }, [activeTab])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let response: Response;

      // Filter out empty variants (variants with empty size, color, or stock)
      const validVariants = productForm.variants.filter(variant =>
        variant.size && variant.color && variant.stock
      )

      if (productForm.imageFile) {
        // Use FormData for file upload
        const formData = new FormData()
        formData.append('productName', productForm.productName)
        formData.append('description', productForm.description)
        formData.append('categoryId', productForm.categoryId)
        formData.append('basePrice', productForm.basePrice)
        formData.append('wholesalePrice', productForm.wholesalePrice)
        formData.append('festival', productForm.festival)
        formData.append('stock', productForm.stock)
        formData.append('isFeatured', productForm.isFeatured.toString())
        formData.append('imageFile', productForm.imageFile)
        formData.append('variants', JSON.stringify(validVariants))

        response = await fetch('/api/products', {
          method: 'POST',
          body: formData,
        })
      } else {
        // Use JSON for URL-based images
        response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productName: productForm.productName,
            description: productForm.description,
            categoryId: parseInt(productForm.categoryId),
            basePrice: parseFloat(productForm.basePrice),
            wholesalePrice: productForm.wholesalePrice ? parseFloat(productForm.wholesalePrice) : null,
            festival: productForm.festival || null,
            stock: parseInt(productForm.stock) || 0,
            isFeatured: productForm.isFeatured,
            imageUrl: productForm.imageUrl || null,
            variants: validVariants
          }),
        })
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Product added successfully!",
        })
        setIsAddProductOpen(false)
        setProductForm({
          productName: "",
          description: "",
          categoryId: "",
          basePrice: "",
          wholesalePrice: "",
          festival: "",
          stock: "",
          isFeatured: false,
          imageUrl: "",
          imageFile: null,
          variants: [{ size: "", color: "", stock: "" }]
        })
        // Refresh products list (you might want to add state for products)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add product",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/products/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryName: categoryForm.categoryName,
          description: categoryForm.description,
          parentCategoryId: categoryForm.parentCategoryId ? parseInt(categoryForm.parentCategoryId) : null
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Category added successfully!",
        })
        setIsAddCategoryOpen(false)
        setCategoryForm({
          categoryName: "",
          description: "",
          parentCategoryId: ""
        })
        // Refresh categories list
        const refreshResponse = await fetch('/api/products/categories')
        const refreshData = await refreshResponse.json()
        if (refreshData.success) {
          setCategories(refreshData.data)
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add category",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-orange-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your Sri Lankan clothing store</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <BarChart3 className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(mockAnalytics.totalRevenue)}</div>
                  <p className="text-xs text-orange-100">+{mockAnalytics.monthlyGrowth}% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAnalytics.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">+180 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAnalytics.totalCustomers}</div>
                  <p className="text-xs text-muted-foreground">+45 new this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(mockAnalytics.avgOrderValue)}</div>
                  <p className="text-xs text-muted-foreground">+5.2% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Low Stock Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Low Stock Alerts
                  </CardTitle>
                  <CardDescription>Items that need restocking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockAnalytics.lowStockItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.variant}</p>
                      </div>
                      <Badge variant="destructive">{item.stock} left</Badge>
                    </div>
                  ))}
                  <Button className="w-full bg-transparent" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Manage Inventory
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest customer orders</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockAnalytics.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{order.id}</p>
                        <p className="text-xs text-gray-600">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(order.amount)}</p>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full bg-transparent" variant="outline">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    View All Orders
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Product Management</h2>
                <p className="text-gray-600">Manage your clothing inventory</p>
              </div>
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Add a new product to your inventory. Fill in the details below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto pr-1">
                    <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productName">Product Name *</Label>
                        <Input
                          id="productName"
                          value={productForm.productName}
                          onChange={(e) => setProductForm({...productForm, productName: e.target.value})}
                          placeholder="Enter product name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={productForm.categoryId} onValueChange={(value) => setProductForm({...productForm, categoryId: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category: any) => (
                              <SelectItem key={category.CategoryID} value={category.CategoryID.toString()}>
                                {category.CategoryName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        placeholder="Enter product description"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="basePrice">Base Price (LKR) *</Label>
                        <Input
                          id="basePrice"
                          type="number"
                          step="0.01"
                          value={productForm.basePrice}
                          onChange={(e) => setProductForm({...productForm, basePrice: e.target.value})}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wholesalePrice">Wholesale Price (LKR)</Label>
                        <Input
                          id="wholesalePrice"
                          type="number"
                          step="0.01"
                          value={productForm.wholesalePrice}
                          onChange={(e) => setProductForm({...productForm, wholesalePrice: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="festival">Festival</Label>
                        <Select value={productForm.festival} onValueChange={(value) => setProductForm({...productForm, festival: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select festival" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="Avurudu">Avurudu (New Year)</SelectItem>
                            <SelectItem value="Vesak">Vesak</SelectItem>
                            <SelectItem value="Christmas">Christmas</SelectItem>
                            <SelectItem value="Deepavali">Deepavali</SelectItem>
                            <SelectItem value="Eid">Eid</SelectItem>
                            <SelectItem value="Poson">Poson</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        value={productForm.imageUrl}
                        onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imageFile">Or Upload Image</Label>
                      <Input
                        id="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setProductForm({...productForm, imageFile: file, imageUrl: file ? "" : productForm.imageUrl})
                        }}
                      />
                      {productForm.imageFile && (
                        <p className="text-sm text-gray-600">Selected: {productForm.imageFile.name}</p>
                      )}
                    </div>
                    {/* Variants Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Product Variants</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setProductForm({
                              ...productForm,
                              variants: [...productForm.variants, { size: "", color: "", stock: "" }]
                            })
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Variant
                        </Button>
                      </div>

                      {productForm.variants.map((variant, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Variant {index + 1}</Label>
                            {productForm.variants.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newVariants = productForm.variants.filter((_, i) => i !== index)
                                  setProductForm({...productForm, variants: newVariants})
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`size-${index}`}>Size</Label>
                              <Select
                                value={variant.size}
                                onValueChange={(value) => {
                                  const newVariants = [...productForm.variants]
                                  newVariants[index].size = value
                                  setProductForm({...productForm, variants: newVariants})
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="XS">XS</SelectItem>
                                  <SelectItem value="S">S</SelectItem>
                                  <SelectItem value="M">M</SelectItem>
                                  <SelectItem value="L">L</SelectItem>
                                  <SelectItem value="XL">XL</SelectItem>
                                  <SelectItem value="XXL">XXL</SelectItem>
                                  <SelectItem value="Free Size">Free Size</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`color-${index}`}>Color</Label>
                              <Input
                                id={`color-${index}`}
                                value={variant.color}
                                onChange={(e) => {
                                  const newVariants = [...productForm.variants]
                                  newVariants[index].color = e.target.value
                                  setProductForm({...productForm, variants: newVariants})
                                }}
                                placeholder="e.g., Red, Blue, White"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`stock-${index}`}>Stock</Label>
                              <Input
                                id={`stock-${index}`}
                                type="number"
                                value={variant.stock}
                                onChange={(e) => {
                                  const newVariants = [...productForm.variants]
                                  newVariants[index].stock = e.target.value
                                  setProductForm({...productForm, variants: newVariants})
                                }}
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isFeatured"
                        checked={productForm.isFeatured}
                        onCheckedChange={(checked) => setProductForm({...productForm, isFeatured: checked})}
                      />
                      <Label htmlFor="isFeatured">Featured Product</Label>
                    </div>
                    <div className="flex justify-end gap-2 flex-shrink-0">
                      <Button type="button" variant="outline" onClick={() => setIsAddProductOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Adding..." : "Add Product"}
                      </Button>
                    </div>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Product Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters & Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="search">Search Products</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="search" placeholder="Search by name, SKU..." className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category: any) => (
                          <SelectItem key={category.CategoryID} value={category.CategoryID.toString()}>
                            {category.CategoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="low-stock">Low Stock</SelectItem>
                        <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full bg-transparent">
                      <Filter className="h-4 w-4 mr-2" />
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Manage your product catalog</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">SKU: SL-{index + 1001}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(product.revenue / product.sold)}</p>
                          <p className="text-sm text-gray-600">{product.sold} sold</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Category Management</h2>
                <p className="text-gray-600">Manage product categories</p>
              </div>
              <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>
                      Create a new product category. Categories help organize your products.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName">Category Name *</Label>
                      <Input
                        id="categoryName"
                        value={categoryForm.categoryName}
                        onChange={(e) => setCategoryForm({...categoryForm, categoryName: e.target.value})}
                        placeholder="Enter category name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoryDescription">Description</Label>
                      <Textarea
                        id="categoryDescription"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                        placeholder="Enter category description"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentCategory">Parent Category (Optional)</Label>
                      <Select value={categoryForm.parentCategoryId} onValueChange={(value) => setCategoryForm({...categoryForm, parentCategoryId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category: any) => (
                            <SelectItem key={category.CategoryID} value={category.CategoryID.toString()}>
                              {category.CategoryName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Adding..." : "Add Category"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Categories List */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Manage your product categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category: any, index) => (
                    <div key={category.CategoryID || index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">{category.CategoryName}</p>
                          <p className="text-sm text-gray-600">{category.ProductCount || 0} products</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Video Management</h2>
                <p className="text-gray-600">Manage promotional videos</p>
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
            </div>

            {/* Videos List */}
            <Card>
              <CardHeader>
                <CardTitle>Videos</CardTitle>
                <CardDescription>Manage your promotional videos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Traditional Saree Collection", duration: "2:30", views: 1250, status: "published" },
                    { title: "Festival Wear Showcase", duration: "3:15", views: 890, status: "published" },
                    { title: "Handloom Process", duration: "4:20", views: 567, status: "draft" },
                  ].map((video, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{video.title}</p>
                          <p className="text-sm text-gray-600">{video.duration} • {video.views} views</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={video.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {video.status}
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Order Management</h2>
                <p className="text-gray-600">Track and manage customer orders</p>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Orders
              </Button>
            </div>

            {/* Order Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Order Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="order-search">Search Orders</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="order-search" placeholder="Order ID, Customer..." className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="order-status">Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payment-status">Payment</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All Payments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date-from">Date From</Label>
                    <Input id="date-from" type="date" />
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full bg-transparent">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Manage customer orders and fulfillment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-gray-600">{order.customer}</p>
                          <p className="text-xs text-gray-500">{order.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.amount)}</p>
                          <Badge className={getStatusColor(order.status)} variant="secondary">
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Customer Management</h2>
                <p className="text-gray-600">Manage customer accounts and loyalty</p>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Customers
              </Button>
            </div>

            {/* Customer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">856</div>
                  <p className="text-sm text-gray-600">+45 this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Loyalty Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">642</div>
                  <p className="text-sm text-gray-600">75% of customers</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Wholesale Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">28</div>
                  <p className="text-sm text-gray-600">B2B customers</p>
                </CardContent>
              </Card>
            </div>

            {/* Customer Management Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Tools</CardTitle>
                <CardDescription>Manage customer communications and loyalty</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <Bell className="h-6 w-6 mb-2" />
                    Send Notifications
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <Users className="h-6 w-6 mb-2" />
                    Loyalty Program
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
        </Tabs>
      </div>
    </div>
  )
}
