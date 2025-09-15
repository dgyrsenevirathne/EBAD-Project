import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Award, Users, Leaf, Star, MapPin, Phone } from "lucide-react"
import { CartDrawer } from "@/components/cart-drawer"

export default function AboutPage() {
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
              <CartDrawer refreshTrigger={0} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 to-red-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-200">Our Story</Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-balance mb-6">Preserving Sri Lankan Heritage Through Fashion</h2>
            <p className="text-xl text-muted-foreground text-pretty mb-8">
              Founded in the heart of Colombo, Ceylon Threads is dedicated to showcasing the rich tapestry of Sri Lankan
              fashion. We blend traditional craftsmanship with contemporary design to bring you authentic pieces that
              tell a story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore Our Collection
                </Button>
              </Link>
              <Link href="/wholesale">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                  <Users className="mr-2 h-4 w-4" />
                  Partner With Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Our Mission</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              To preserve and promote Sri Lanka's rich fashion heritage while supporting local artisans and sustainable practices
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Heart className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Authentic Craftsmanship</CardTitle>
                <CardDescription>
                  Every piece is handcrafted by skilled artisans using traditional techniques passed down through generations
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Award className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Quality Excellence</CardTitle>
                <CardDescription>
                  We maintain the highest standards of quality, ensuring each garment meets our rigorous craftsmanship criteria
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Leaf className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Sustainable Fashion</CardTitle>
                <CardDescription>
                  Committed to eco-friendly practices and supporting fair trade initiatives for our artisans and communities
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Heritage Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-orange-100 text-orange-800">Sri Lankan Heritage</Badge>
              <h3 className="text-3xl font-bold mb-6">A Legacy of Tradition</h3>
              <p className="text-muted-foreground mb-6">
                Sri Lanka's fashion heritage spans centuries, from the intricate Kandyan sarees worn by royalty to the
                vibrant batik patterns that tell stories of our cultural diversity. Our collection celebrates this rich
                legacy while embracing modern silhouettes and contemporary colors.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Star className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Traditional Sarees</h4>
                    <p className="text-sm text-muted-foreground">Handwoven silk and cotton sarees with intricate designs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Star className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Batik & Tie-Dye</h4>
                    <p className="text-sm text-muted-foreground">Ancient wax-resist dyeing techniques creating unique patterns</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Star className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Festive Attire</h4>
                    <p className="text-sm text-muted-foreground">Avurudu and wedding garments with cultural significance</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Users className="h-16 w-16 text-orange-600 mx-auto mb-4" />
                <p className="text-muted-foreground">Artisan Showcase</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Meet Our Artisans</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our network of skilled artisans across Sri Lanka brings decades of experience and passion to every piece
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-orange-600" />
                </div>
                <h4 className="font-semibold mb-2">Weavers of Kandy</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Masters of traditional Kandyan weaving techniques, creating intricate patterns that have been passed down for generations
                </p>
                <Badge variant="secondary">Traditional Weaving</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-orange-600" />
                </div>
                <h4 className="font-semibold mb-2">Batik Artists</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Skilled craftsmen who use the ancient wax-resist dyeing method to create vibrant, one-of-a-kind designs
                </p>
                <Badge variant="secondary">Batik Specialists</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-orange-600" />
                </div>
                <h4 className="font-semibold mb-2">Tailors & Designers</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Expert tailors who blend traditional silhouettes with modern cuts, ensuring perfect fit and comfort
                </p>
                <Badge variant="secondary">Modern Craftsmanship</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Join Our Fashion Journey</h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the beauty of Sri Lankan fashion and support traditional craftsmanship. Every purchase helps preserve our cultural heritage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto">
                Start Shopping
              </Button>
            </Link>
            <Link href="/rewards">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                <Award className="mr-2 h-4 w-4" />
                Join Rewards Program
              </Button>
            </Link>
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
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
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
