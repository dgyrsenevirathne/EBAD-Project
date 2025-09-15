"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Gift,
  Star,
  Users,
  TrendingUp,
  Copy,
  Share2,
  Calendar,
  ShoppingBag,
  Award,
  Target,
  Zap,
} from "lucide-react"
import { CartDrawer } from "@/components/cart-drawer"
import { useAuth } from "@/components/auth-provider"

interface UserLoyaltyData {
  points: number
  totalEarned: number
  totalSpent: number
  referralCode: string
  tier: string
  nextTier: string
  pointsToNextTier: number
  referralsCount: number
  reviewsCount: number
}

interface PointsTransaction {
  id: number
  type: string
  points: number
  description: string
  date: string
  reference: string
}

interface RewardOption {
  id: number
  name: string
  points: number
  description: string
  type: string
}

const loyaltyTiers = [
  { name: "Bronze", minPoints: 0, color: "bg-amber-600", benefits: ["1 point per LKR 100", "Birthday discount"] },
  {
    name: "Silver",
    minPoints: 500,
    color: "bg-gray-400",
    benefits: ["1.2 points per LKR 100", "Free shipping", "Early access"],
  },
  {
    name: "Gold",
    minPoints: 1000,
    color: "bg-yellow-500",
    benefits: ["1.5 points per LKR 100", "Priority support", "Exclusive offers"],
  },
  {
    name: "Platinum",
    minPoints: 2000,
    color: "bg-purple-600",
    benefits: ["2 points per LKR 100", "Personal stylist", "VIP events"],
  },
]

export default function RewardsPage() {
  const { user, token } = useAuth()
  const [referralEmail, setReferralEmail] = useState("")
  const [copiedReferral, setCopiedReferral] = useState(false)
  const [userData, setUserData] = useState<UserLoyaltyData | null>(null)
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([])
  const [rewardOptions, setRewardOptions] = useState<RewardOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchRewardsData = async () => {
    if (!user || !token) return

    try {
      const [loyaltyResponse, historyResponse, rewardsResponse] = await Promise.all([
        fetch('/api/rewards/loyalty', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch('/api/rewards/history', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch('/api/rewards/options', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
      ])

      const loyaltyData = await loyaltyResponse.json()
      const historyData = await historyResponse.json()
      const rewardsData = await rewardsResponse.json()

      if (loyaltyData.success) {
        setUserData(loyaltyData.data)
      }
      if (historyData.success) {
        setPointsHistory(historyData.data)
      }
      if (rewardsData.success) {
        setRewardOptions(rewardsData.data)
      }
    } catch (error) {
      console.error('Failed to fetch rewards data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRewardsData()
  }, [user])

  const currentTier = userData ? loyaltyTiers.find((tier) => tier.name === userData.tier) : null
  const nextTier = userData ? loyaltyTiers.find((tier) => tier.name === userData.nextTier) : null
  const tierProgress = nextTier && userData
    ? ((userData.points - (currentTier?.minPoints || 0)) / (nextTier.minPoints - (currentTier?.minPoints || 0))) * 100
    : 0

  const copyReferralCode = () => {
    if (userData) {
      navigator.clipboard.writeText(`Use my referral code: ${userData.referralCode} and get 50 bonus points!`)
      setCopiedReferral(true)
      setTimeout(() => setCopiedReferral(false), 2000)
    }
  }

  const sendReferral = async () => {
    if (referralEmail && userData && token) {
      try {
        const response = await fetch('/api/rewards/referral', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ email: referralEmail }),
        })

        const data = await response.json()

        if (data.success) {
          alert(`Referral sent to ${referralEmail}!`)
          setReferralEmail("")
          fetchRewardsData()
        } else {
          alert(data.message || 'Failed to send referral')
        }
      } catch (error) {
        console.error('Failed to send referral:', error)
      }
    }
  }

  const redeemReward = async (reward: RewardOption) => {
    if (!userData || !token) return

    if (userData.points >= reward.points) {
      try {
        const response = await fetch('/api/rewards/redeem', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ rewardId: reward.id }),
        })

        const data = await response.json()

        if (data.success) {
          alert(`Redeemed ${reward.name} for ${reward.points} points!`)
          fetchRewardsData()
        } else {
          alert(data.message || 'Failed to redeem reward')
        }
      } catch (error) {
        console.error('Failed to redeem reward:', error)
      }
    } else {
      alert(`You need ${reward.points - userData.points} more points to redeem this reward.`)
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
            <Gift className="h-8 w-8 text-orange-600" />
            <h2 className="text-3xl font-bold">Loyalty Rewards</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Earn points with every purchase, referral, and review. Redeem for discounts, free shipping, and exclusive
            experiences.
          </p>
        </div>

        {/* Points Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-6 w-6 text-orange-600" />
                <CardTitle className="text-2xl">{userData?.points.toLocaleString() || 0}</CardTitle>
              </div>
              <CardDescription>Available Points</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">= LKR {((userData?.points || 0) * 5).toLocaleString()} value</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="h-6 w-6 text-orange-600" />
                <CardTitle className="text-2xl">{userData?.tier || 'Bronze'}</CardTitle>
              </div>
              <CardDescription>Current Tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{userData?.tier || 'Bronze'}</span>
                  <span>{userData?.nextTier || 'Silver'}</span>
                </div>
                <Progress value={tierProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {userData?.pointsToNextTier || 0} points to {userData?.nextTier || 'Silver'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-6 w-6 text-orange-600" />
                <CardTitle className="text-2xl">{userData?.totalEarned.toLocaleString() || 0}</CardTitle>
              </div>
              <CardDescription>Total Points Earned</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Lifetime earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Loyalty Tiers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Loyalty Tiers
            </CardTitle>
            <CardDescription>Unlock better rewards as you shop more</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
                  {loyaltyTiers.map((tier, index) => (
                <div
                  key={tier.name}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    tier.name === userData?.tier ? "border-orange-500 bg-orange-50" : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-4 h-4 rounded-full ${tier.color}`} />
                    <h3 className="font-semibold">{tier.name}</h3>
                    {tier.name === userData?.tier && (
                      <Badge className="bg-orange-600 hover:bg-orange-700">Current</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {tier.minPoints === 0 ? "Starting tier" : `${tier.minPoints}+ points`}
                  </p>
                  <ul className="space-y-1">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="text-xs flex items-center gap-1">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="redeem" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="redeem">Redeem Points</TabsTrigger>
            <TabsTrigger value="earn">Earn Points</TabsTrigger>
            <TabsTrigger value="referral">Referral Program</TabsTrigger>
            <TabsTrigger value="history">Points History</TabsTrigger>
          </TabsList>

          <TabsContent value="redeem" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Redeem Your Points</CardTitle>
                <CardDescription>Choose from our exclusive rewards catalog</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {rewardOptions.map((reward) => (
                            <Card key={reward.id} className="relative">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="font-semibold text-sm">{reward.name}</h3>
                                    <p className="text-xs text-muted-foreground">{reward.description}</p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {reward.points} pts
                                  </Badge>
                                </div>
                                <Button
                                  size="sm"
                                  className="w-full"
                                  disabled={userData?.points! < reward.points}
                                  onClick={() => redeemReward(reward)}
                                >
                                  {userData?.points! >= reward.points ? "Redeem" : "Not enough points"}
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earn" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Shopping
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium">Every Purchase</p>
                      <p className="text-sm text-muted-foreground">Earn points on all orders</p>
                    </div>
                    <Badge className="bg-orange-600 hover:bg-orange-700">
                      {currentTier?.name === "Bronze"
                        ? "1"
                        : currentTier?.name === "Silver"
                          ? "1.2"
                          : currentTier?.name === "Gold"
                            ? "1.5"
                            : "2"}{" "}
                      pt / LKR 100
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Bulk Orders</p>
                      <p className="text-sm text-muted-foreground">Orders over LKR 10,000</p>
                    </div>
                    <Badge variant="outline">Bonus 50 pts</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Product Reviews</p>
                      <p className="text-sm text-muted-foreground">Write honest reviews</p>
                    </div>
                    <Badge className="bg-blue-600 hover:bg-blue-700">10 pts</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Friend Referrals</p>
                      <p className="text-sm text-muted-foreground">When they make first purchase</p>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-700">50 pts</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Birthday Bonus</p>
                      <p className="text-sm text-muted-foreground">Annual birthday gift</p>
                    </div>
                    <Badge variant="outline">100 pts</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referral" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Your Referral Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{userData?.referralsCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Friends Referred</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{(userData?.referralsCount || 0) * 50}</p>
                      <p className="text-sm text-muted-foreground">Points Earned</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="referralCode">Your Referral Code</Label>
                      <div className="flex gap-2 mt-1">
                        <Input id="referralCode" value={userData?.referralCode || ""} readOnly className="font-mono" />
                        <Button variant="outline" onClick={copyReferralCode}>
                          {copiedReferral ? "Copied!" : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Invite Friends
                  </CardTitle>
                  <CardDescription>Both you and your friend get 50 points!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="referralEmail">Friend's Email</Label>
                      <Input
                        id="referralEmail"
                        type="email"
                        placeholder="friend@example.com"
                        value={referralEmail}
                        onChange={(e) => setReferralEmail(e.target.value)}
                      />
                    </div>
                    <Button onClick={sendReferral} className="w-full" disabled={!referralEmail}>
                      Send Invitation
                    </Button>
                  </div>
                  <Separator />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">Or share your code directly:</p>
                    <Button variant="outline" onClick={copyReferralCode} className="bg-transparent">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Points History
                </CardTitle>
                <CardDescription>Track all your points transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pointsHistory.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            transaction.type === "purchase"
                              ? "bg-blue-500"
                              : transaction.type === "referral"
                                ? "bg-green-500"
                                : transaction.type === "review"
                                  ? "bg-yellow-500"
                                  : transaction.type === "redemption"
                                    ? "bg-red-500"
                                    : "bg-purple-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.points > 0 ? "text-green-600" : "text-red-600"}`}>
                          {transaction.points > 0 ? "+" : ""}
                          {transaction.points} pts
                        </p>
                        <p className="text-xs text-muted-foreground">{transaction.reference}</p>
                      </div>
                    </div>
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
