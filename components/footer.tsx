"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Phone, MapPin, ArrowRight, Shield, Truck } from "lucide-react"
import { useTranslation } from "@/components/translation-provider"

interface FooterProps {
  user?: any
}

export default function Footer({ user }: FooterProps) {
  const { t } = useTranslation()

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(251,146,60,0.1),transparent_50%)]"></div>
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h4 className="text-2xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                  Ceylon Threads
                </h4>
                <p className="text-slate-300">Authentic Sri Lankan fashion for every occasion</p>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed mb-6">
              We're passionate about bringing you the finest traditional and modern Sri Lankan clothing,
              crafted with care and attention to detail. Experience the rich heritage of Ceylon Threads.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Phone className="mr-2 h-4 w-4" />
                {t("footer.contactUs")}
              </Button>
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <MapPin className="mr-2 h-4 w-4" />
                {t("footer.findUs")}
              </Button>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-lg mb-6 text-white">Quick Links</h5>
            <ul className="space-y-3">
              {[
                { href: "/products", label: "Shop Collection" },
                { href: "/virtual-try-on", label: "Virtual Try-On" },
                { href: "/wholesale", label: "Wholesale" },
                { href: "/rewards", label: "Rewards Program" },
                { href: "/about", label: "About Us" }
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-slate-300 hover:text-orange-300 transition-colors duration-300 flex items-center group">
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-lg mb-6 text-white">Customer Service</h5>
            <div className="space-y-4 text-slate-300">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-orange-400" />
                <span>Secure Shopping</span>
              </div>
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-orange-400" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-400" />
                <span>24/7 Support</span>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-slate-400 mb-2">Payment Methods</p>
              <p className="text-sm text-slate-300">Cash on Delivery, Cards, FriMi, eZ Cash, SampathPay</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © 2024 Ceylon Threads. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-slate-400 text-sm">Made with ❤️ in Sri Lanka</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
