"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Gift, Users, Truck } from "lucide-react"

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50/50"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200 mb-4">
            Why Choose Us
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Experience the <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Difference</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            We're not just selling clothes, we're sharing a piece of Sri Lanka's rich cultural heritage
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Sparkles,
              title: "Virtual Try-On",
              description: "Try on clothes virtually before you buy with AI technology",
              gradient: "from-purple-500 to-pink-600",
              bg: "from-purple-50 to-pink-50"
            },
            {
              icon: Gift,
              title: "Loyalty Rewards",
              description: "Earn points with every purchase. LKR 100 = 1 point",
              gradient: "from-orange-500 to-red-600",
              bg: "from-orange-50 to-red-50"
            },
            {
              icon: Users,
              title: "Wholesale Portal",
              description: "Bulk orders with special pricing for retailers",
              gradient: "from-blue-500 to-cyan-600",
              bg: "from-blue-50 to-cyan-50"
            },
            {
              icon: Truck,
              title: "Fast Delivery",
              description: "Island-wide delivery with Cash on Delivery",
              gradient: "from-green-500 to-emerald-600",
              bg: "from-green-50 to-emerald-50"
            }
          ].map((feature, index) => (
            <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/70 backdrop-blur-sm">
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              <CardHeader className="relative z-10">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} w-fit mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-slate-600 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
