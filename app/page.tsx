import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Gift, Users, Phone, MapPin } from "lucide-react"
import { CartDrawer } from "@/components/cart-drawer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-primary">Ceylon Threads</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Sri Lankan Fashion
              </Badge>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
                Shop
              </Link>
              <Link href="/wholesale" className="text-sm font-medium hover:text-primary transition-colors">
                Wholesale
              </Link>
              <Link href="/rewards" className="text-sm font-medium hover:text-primary transition-colors">
                Rewards
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </Link>
            </nav>
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
              <CartDrawer />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 to-red-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-200">Avurudu Collection 2024</Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-balance mb-6">Authentic Sri Lankan Fashion</h2>
            <p className="text-xl text-muted-foreground text-pretty mb-8">
              Discover traditional and modern clothing crafted with love in Sri Lanka. From festive wear to everyday
              essentials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  Shop Collection
                </Button>
              </Link>
              <Link href="/wholesale">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                  <Users className="mr-2 h-4 w-4" />
                  Wholesale Orders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Gift className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Loyalty Rewards</CardTitle>
                <CardDescription>Earn points with every purchase. LKR 100 = 1 point</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Wholesale Portal</CardTitle>
                <CardDescription>Bulk orders with special pricing for retailers</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Phone className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Local Support</CardTitle>
                <CardDescription>WhatsApp support & Cash on Delivery available</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Featured Products</h3>
            <p className="text-muted-foreground">Trending items from our latest collection</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="group cursor-pointer hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Traditional Saree</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">LKR 8,500</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground ml-1">4.8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4">Ceylon Threads</h4>
              <p className="text-gray-400 text-sm">Authentic Sri Lankan fashion for every occasion</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/products" className="hover:text-white">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link href="/wholesale" className="hover:text-white">
                    Wholesale
                  </Link>
                </li>
                <li>
                  <Link href="/rewards" className="hover:text-white">
                    Rewards
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Payment Methods</h5>
              <p className="text-sm text-gray-400">Cash on Delivery, Cards, FriMi, eZ Cash, SampathPay</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contact</h5>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  +94 11 234 5678
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Colombo, Sri Lanka
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
