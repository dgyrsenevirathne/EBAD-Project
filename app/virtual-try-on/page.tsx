"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  Camera,
  Upload,
  RotateCcw,
  Download,
  Share2,
  Heart,
  ShoppingBag,
  User,
  Sparkles,
  Eye,
  Palette,
  Ruler,
  Zap,
  CheckCircle,
  AlertCircle,
  BookOpen,
  HeartHandshake,
  Leaf,
  Crown,
  Star,
  MapPin,
  type LucideIcon
} from "lucide-react"
import { CartDrawer } from "@/components/cart-drawer"
import { useAuth } from "@/components/auth-provider"

interface Product {
  ProductID: number
  ProductName: string
  BasePrice: number
  PrimaryImage: string | null
  CategoryName: string
}

interface TryOnSession {
  id: string
  productId: number
  userImage: string
  resultImage: string | null
  status: 'processing' | 'completed' | 'failed'
  createdAt: string
}

const bodyTypes = [
  { id: 'slim', name: 'Slim', description: 'Fitted silhouette' },
  { id: 'regular', name: 'Regular', description: 'Standard fit' },
  { id: 'plus', name: 'Plus Size', description: 'Relaxed fit' }
]

const skinTones = [
  { id: 'fair', name: 'Fair', color: '#F5DEB3' },
  { id: 'medium', name: 'Medium', color: '#D2B48C' },
  { id: 'olive', name: 'Olive', color: '#A0522D' },
  { id: 'tan', name: 'Tan', color: '#8B4513' },
  { id: 'dark', name: 'Dark', color: '#654321' }
]

// Cultural storytelling data
interface CulturalStory {
  title: string
  description: string
  details: string[]
  icon: LucideIcon
  color: string
}

const culturalStories: Record<string, CulturalStory> = {
  'Traditional Clothing': {
    title: "Sri Lankan Traditional Attire",
    description: "Discover the rich heritage of Sri Lankan traditional clothing, passed down through generations.",
    details: [
      "The Kandyan saree, worn by women in the hill country, features intricate handwoven patterns",
      "The sarong, a versatile garment worn by men, comes in various regional styles",
      "Traditional fabrics like handloom cotton and silk carry stories of ancient craftsmanship"
    ],
    icon: Crown,
    color: "from-amber-500 to-orange-600"
  },
  'Cultural Significance': {
    title: "Cultural Significance",
    description: "Each garment tells a story of Sri Lanka's diverse cultural heritage.",
    details: [
      "Traditional clothing reflects social status, regional identity, and cultural values",
      "Colors and patterns often have symbolic meanings in Sri Lankan culture",
      "Many garments are worn during festivals, weddings, and important life events"
    ],
    icon: HeartHandshake,
    color: "from-red-500 to-pink-600"
  },
  'Sustainable Heritage': {
    title: "Sustainable Heritage",
    description: "Learn about eco-friendly traditional practices that respect our environment.",
    details: [
      "Handloom weaving uses natural dyes and sustainable materials",
      "Traditional techniques support local artisans and preserve cultural knowledge",
      "Many fabrics are made from organic cotton, silk, and other natural fibers"
    ],
    icon: Leaf,
    color: "from-green-500 to-emerald-600"
  }
}

const culturalTips = [
  {
    title: "Wearing Traditional Attire",
    tip: "When wearing a saree, the 'pallu' (decorative end) is traditionally worn over the left shoulder, symbolizing grace and tradition.",
    icon: Star
  },
  {
    title: "Cultural Etiquette",
    tip: "In Sri Lankan culture, traditional clothing is often worn during religious ceremonies, weddings, and cultural festivals.",
    icon: HeartHandshake
  },
  {
    title: "Modern Fusion",
    tip: "Contemporary Sri Lankan fashion blends traditional elements with modern designs, creating unique fusion wear.",
    icon: Sparkles
  }
]

export default function VirtualTryOnPage() {
  const { user, token } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [tryOnSessions, setTryOnSessions] = useState<TryOnSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedStory, setSelectedStory] = useState<keyof typeof culturalStories>('Traditional Clothing')

  // User customization options
  const [bodyType, setBodyType] = useState('regular')
  const [skinTone, setSkinTone] = useState('medium')
  const [showAccessories, setShowAccessories] = useState(true)
  const [autoAdjustSize, setAutoAdjustSize] = useState(true)

  // Camera/Image upload
  const [userImage, setUserImage] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProducts()
    fetchTryOnSessions()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=20&featured=true')
      const data = await response.json()
      if (data.success) {
        setProducts(data.data.products)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTryOnSessions = async () => {
    if (!user || !token) return

    try {
      const response = await fetch('/api/virtual-try-on/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setTryOnSessions(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch try-on sessions:', error)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (error) {
      console.error('Failed to access camera:', error)
      alert('Unable to access camera. Please upload a photo instead.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const ctx = canvas.getContext('2d')

      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        setUserImage(imageData)
        stopCamera()
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUserImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startVirtualTryOn = async () => {
    if (!selectedProduct || !userImage || !user || !token) {
      alert('Please select a product and upload/capture your photo first')
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/virtual-try-on', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: selectedProduct.ProductID,
          userImage: userImage,
          customizations: {
            bodyType,
            skinTone,
            showAccessories,
            autoAdjustSize
          }
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Add to sessions
        const newSession: TryOnSession = {
          id: data.data.sessionId,
          productId: selectedProduct.ProductID,
          userImage: userImage,
          resultImage: null,
          status: 'processing',
          createdAt: new Date().toISOString()
        }
        setTryOnSessions(prev => [newSession, ...prev])

        // Poll for result
        pollForResult(data.data.sessionId)
      } else {
        alert(data.message || 'Failed to start virtual try-on')
      }
    } catch (error) {
      console.error('Failed to start virtual try-on:', error)
      alert('Failed to start virtual try-on. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

const pollForResult = async (sessionId: string) => {
  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`/api/virtual-try-on/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (data.success && data.data.status === 'completed') {
        setTryOnSessions(prev =>
          prev.map(session =>
            session.id === sessionId
              ? { ...session, status: 'completed', resultImage: data.data.resultImagePath }
              : session
          )
        )
        clearInterval(pollInterval)
      } else if (data.success && data.data.status === 'failed') {
        setTryOnSessions(prev =>
          prev.map(session =>
            session.id === sessionId
              ? { ...session, status: 'failed' }
              : session
          )
        )
        clearInterval(pollInterval)
      }
    } catch (error) {
      console.error('Failed to poll for result:', error)
    }
  }, 3000) // Poll every 3 seconds

  // Stop polling after 2 minutes
  setTimeout(() => {
    clearInterval(pollInterval)
  }, 120000)
}

const downloadImage = (imageUrl: string | null, sessionId: string) => {
  if (!imageUrl) {
    alert('No result image available to download.')
    return
  }

  const link = document.createElement('a')
  link.href = imageUrl
  link.download = `ceylon-threads-tryon-${sessionId}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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
        alert('Item added to cart successfully!')
      } else {
        alert(data.message || 'Failed to add item to cart')
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('Failed to add item to cart')
    }
  }

  const addToWishlist = async (productId: number) => {
    if (!user || !token) {
      alert('Please login to add items to wishlist')
      return
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: productId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Item added to wishlist successfully!')
      } else {
        alert(data.message || 'Failed to add item to wishlist')
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error)
      alert('Failed to add item to wishlist')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
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
              <h1 className="text-2xl font-bold text-primary">Ceylon Threads</h1>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Virtual Try-On
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {user ? (
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    Profile
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
              )}
              <CartDrawer refreshTrigger={0} />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Cultural Heritage Hero Section */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border border-amber-200/50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1),transparent_50%)]"></div>
          <div className="relative p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                  Experience Sri Lankan Heritage
                </h2>
                <p className="text-amber-700">Discover the stories behind our traditional craftsmanship</p>
              </div>
            </div>

            <p className="text-slate-700 mb-6 max-w-3xl">
              Welcome to our Virtual Try-On Studio, where modern technology meets ancient Sri Lankan traditions.
              Each garment in our collection carries centuries of cultural heritage, handcrafted by skilled artisans
              who preserve techniques passed down through generations.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(culturalStories).map(([key, story]) => {
                const IconComponent = story.icon
                return (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-0 bg-white/70 backdrop-blur-sm ${
                      selectedStory === key ? 'ring-2 ring-amber-400' : ''
                    }`}
                    onClick={() => setSelectedStory(key as keyof typeof culturalStories)}
                  >
                    <CardContent className="p-4">
                      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${story.color} w-fit mb-3`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-sm mb-2">{story.title}</h4>
                      <p className="text-xs text-slate-600">{story.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>

        {/* Cultural Story Details */}
        <Card className="mb-8 border-amber-200/50 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${culturalStories[selectedStory].color}`}>
                {(() => {
                  const IconComponent = culturalStories[selectedStory].icon
                  return <IconComponent className="h-5 w-5 text-white" />
                })()}
              </div>
              <div>
                <CardTitle className="text-xl">{culturalStories[selectedStory].title}</CardTitle>
                <CardDescription>{culturalStories[selectedStory].description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {culturalStories[selectedStory].details.map((detail, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                  <span className="text-slate-700">{detail}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Cultural Tips */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {culturalTips.map((tip, index) => {
            const IconComponent = tip.icon
            return (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-amber-200/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg">
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="font-semibold text-sm">{tip.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600">{tip.tip}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Virtual Try-On Interface */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Eye className="h-8 w-8 text-purple-600" />
            <h2 className="text-3xl font-bold">Virtual Try-On Studio</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience our Sri Lankan fashion collection virtually. Upload your photo or use your camera
            to see how our traditional and modern clothing looks on you before you buy.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Product Selection & Customization */}
          <div className="lg:col-span-1 space-y-6">
            {/* Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Select Product
                </CardTitle>
                <CardDescription>Choose an item to try on virtually</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select
                    value={selectedProduct?.ProductID.toString() || ""}
                    onValueChange={(value) => {
                      const product = products.find(p => p.ProductID.toString() === value)
                      setSelectedProduct(product || null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.ProductID} value={product.ProductID.toString()}>
                          {product.ProductName} - LKR {product.BasePrice.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedProduct && (
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-amber-200/50">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedProduct.PrimaryImage || "/placeholder.svg"}
                          alt={selectedProduct.ProductName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{selectedProduct.ProductName}</h4>
                          <p className="text-sm text-muted-foreground">{selectedProduct.CategoryName}</p>
                          <p className="text-lg font-bold text-orange-600">
                            LKR {selectedProduct.BasePrice.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customization Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Customization
                </CardTitle>
                <CardDescription>Adjust settings for best results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Body Type</Label>
                  <Select value={bodyType} onValueChange={setBodyType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} - {type.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Skin Tone</Label>
                  <Select value={skinTone} onValueChange={setSkinTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {skinTones.map((tone) => (
                        <SelectItem key={tone.id} value={tone.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: tone.color }}
                            />
                            {tone.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="accessories">Show Accessories</Label>
                  <Switch
                    id="accessories"
                    checked={showAccessories}
                    onCheckedChange={setShowAccessories}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-size">Auto-Adjust Size</Label>
                  <Switch
                    id="auto-size"
                    checked={autoAdjustSize}
                    onCheckedChange={setAutoAdjustSize}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cultural Learning Section */}
            <Card className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 border-amber-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-amber-600" />
                  Cultural Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-white/70 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Traditional Craftsmanship</h5>
                    <p className="text-xs text-slate-600">
                      Each garment is handcrafted using techniques passed down through generations of Sri Lankan artisans.
                    </p>
                  </div>
                  <div className="p-3 bg-white/70 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Sustainable Practices</h5>
                    <p className="text-xs text-slate-600">
                      Our traditional methods use natural dyes and eco-friendly materials that respect the environment.
                    </p>
                  </div>
                  <div className="p-3 bg-white/70 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Cultural Significance</h5>
                    <p className="text-xs text-slate-600">
                      Traditional clothing reflects social values, regional identity, and cultural heritage.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Button
                    onClick={startVirtualTryOn}
                    disabled={!selectedProduct || !userImage || isProcessing}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  >
                    {isProcessing ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Start Virtual Try-On
                      </>
                    )}
                  </Button>

                  {selectedProduct && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToWishlist(selectedProduct.ProductID)}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        Wishlist
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToCart(selectedProduct.ProductID)}
                      >
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Camera/Upload & Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Camera/Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Your Photo
                </CardTitle>
                <CardDescription>Upload a photo or take a selfie to try on clothes</CardDescription>
              </CardHeader>
              <CardContent>
                {!userImage ? (
                  <div className="space-y-4">
                    <Tabs defaultValue="camera" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="camera">📸 Camera</TabsTrigger>
                        <TabsTrigger value="upload">📁 Upload</TabsTrigger>
                      </TabsList>

                      <TabsContent value="camera" className="space-y-4">
                        <div className="relative">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full max-w-md mx-auto rounded-lg border-2 border-dashed border-gray-300"
                            style={{ display: cameraActive ? 'block' : 'none' }}
                          />
                          {!cameraActive && (
                            <div className="w-full max-w-md mx-auto aspect-[4/3] rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                              <div className="text-center">
                                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">Click "Start Camera" to begin</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 justify-center">
                          {!cameraActive ? (
                            <Button onClick={startCamera} variant="outline">
                              <Camera className="h-4 w-4 mr-2" />
                              Start Camera
                            </Button>
                          ) : (
                            <>
                              <Button onClick={capturePhoto} className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Capture Photo
                              </Button>
                              <Button onClick={stopCamera} variant="outline">
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Stop Camera
                              </Button>
                            </>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="upload" className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-4">Upload a clear photo of yourself</p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                          >
                            Choose Photo
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={userImage}
                        alt="Your photo"
                        className="w-full max-w-md mx-auto rounded-lg border"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUserImage(null)}
                        className="absolute top-2 right-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      Great! Your photo is ready. Select a product and click "Start Virtual Try-On"
                    </p>
                  </div>
                )}

                {/* Hidden canvas for photo capture */}
                <canvas ref={canvasRef} className="hidden" />
              </CardContent>
            </Card>

            {/* Try-On Results */}
            {tryOnSessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Your Try-On Sessions
                  </CardTitle>
                  <CardDescription>See how our products look on you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {tryOnSessions.map((session) => (
                      <div key={session.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={products.find(p => p.ProductID === session.productId)?.PrimaryImage || "/placeholder.svg"}
                              alt="Product"
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium">
                                {products.find(p => p.ProductID === session.productId)?.ProductName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(session.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={session.status === 'completed' ? 'default' : session.status === 'failed' ? 'destructive' : 'secondary'}
                          >
                            {session.status === 'processing' && <Zap className="h-3 w-3 mr-1 animate-spin" />}
                            {session.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {session.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </Badge>
                        </div>

                        {session.status === 'completed' && session.resultImage && (
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium mb-2">Your Photo:</p>
                              <img
                                src={session.userImage}
                                alt="Original"
                                className="w-full rounded-lg border"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">With Product:</p>
                              <img
                                src={session.resultImage}
                                alt="Try-on result"
                                className="w-full rounded-lg border"
                              />
                            </div>
                          </div>
                        )}

                        {session.status === 'processing' && (
                          <div className="text-center py-8">
                            <Zap className="h-8 w-8 text-purple-500 animate-spin mx-auto mb-2" />
                            <p className="text-muted-foreground">Processing your virtual try-on...</p>
                            <p className="text-sm text-muted-foreground">This may take 30-60 seconds</p>
                          </div>
                        )}

                        {session.status === 'failed' && (
                          <div className="text-center py-8">
                            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                            <p className="text-muted-foreground">Try-on failed. Please try again.</p>
                          </div>
                        )}

                        {session.status === 'completed' && (
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm">
                              <Share2 className="h-4 w-4 mr-1" />
                              Share
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadImage(session.resultImage, session.id)}
                              disabled={!session.resultImage}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => addToCart(session.productId)}
                              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                            >
                              <ShoppingBag className="h-4 w-4 mr-1" />
                              Add to Cart
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
