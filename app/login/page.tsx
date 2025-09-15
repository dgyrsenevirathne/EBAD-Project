"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Phone, Mail } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    otp: "",
  })
  const [isOtpSent, setIsOtpSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const success = await login(formData.email, formData.password)

      if (success) {
        router.push("/profile")
      } else {
        alert("Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("Failed to login. Please try again.")
    }
  }

  const handleSendOtp = () => {
    setIsOtpSent(true)
    // Handle OTP sending logic here
    console.log("Sending OTP to:", formData.phone)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your Ceylon Threads account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Login Method Toggle */}
          <div className="flex rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setLoginMethod("email")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                loginMethod === "email"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("phone")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                loginMethod === "phone"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Phone className="h-4 w-4" />
              Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginMethod === "email" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+94 71 234 5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                {!isOtpSent ? (
                  <Button type="button" onClick={handleSendOtp} className="w-full" disabled={!formData.phone}>
                    Send OTP
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                      required
                    />
                  </div>
                )}
              </>
            )}

            {(loginMethod === "email" || isOtpSent) && (
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            )}
          </form>

          {loginMethod === "email" && (
            <div className="text-center">
              <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
                Forgot your password?
              </Link>
            </div>
          )}

          <Separator />

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Don't have an account?</p>
            <Link href="/register">
              <Button variant="outline" className="w-full bg-transparent">
                Create Account
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
