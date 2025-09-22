"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, MessageCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface ProductRatingProps {
  productId: number
  productName: string
  onRatingSubmitted?: () => void
}

interface RatingData {
  rating: number
  review: string
  userRating?: {
    rating: number
    review: string
    createdAt: string
  }
}

export function ProductRating({ productId, productName, onRatingSubmitted }: ProductRatingProps) {
  const { user, token } = useAuth()
  const [ratingData, setRatingData] = useState<RatingData>({
    rating: 0,
    review: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [averageRating, setAverageRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)

  useEffect(() => {
    fetchProductRating()
  }, [productId])

  const fetchProductRating = async () => {
    try {
      const response = await fetch(`/api/products/ratings?productId=${productId}`)
      const data = await response.json()

      if (data.success) {
        setAverageRating(data.averageRating || 0)
        setTotalRatings(data.totalRatings || 0)

        // Check if user has already rated this product
        if (user && data.ratings) {
          const userRating = data.ratings.find((r: any) => r.UserID === user.id)
          if (userRating) {
            setRatingData({
              rating: userRating.Rating,
              review: userRating.Review || "",
              userRating: {
                rating: userRating.Rating,
                review: userRating.Review || "",
                createdAt: userRating.CreatedAt
              }
            })
            setShowReviewForm(true)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch product rating:', error)
    }
  }

  const handleRatingClick = (rating: number) => {
    if (!user) {
      alert('Please login to rate this product')
      return
    }
    setRatingData(prev => ({ ...prev, rating }))
    setShowReviewForm(true)
  }

  const handleSubmitRating = async () => {
    if (!user || !token) {
      alert('Please login to submit a rating')
      return
    }

    if (ratingData.rating === 0) {
      alert('Please select a rating')
      return
    }

    if (ratingData.review.trim().length > 1000) {
      alert('Review must be less than 1000 characters')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/products/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          rating: ratingData.rating,
          review: ratingData.review.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Rating submitted successfully!')
        setShowReviewForm(false)
        fetchProductRating() // Refresh the rating data
        onRatingSubmitted?.()
      } else {
        alert(data.message || 'Failed to submit rating')
      }
    } catch (error) {
      console.error('Failed to submit rating:', error)
      alert('Failed to submit rating. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive: boolean = false, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && handleRatingClick(star)}
            className={`${interactive ? 'hover:scale-110' : ''} transition-transform`}
          >
            <Star
              className={`${starSize} ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              } ${interactive ? 'cursor-pointer' : ''}`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Login to rate this product</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Rate "{productName}"</h4>
        <div className="flex items-center gap-2">
          {renderStars(Math.round(averageRating), false)}
          <span className="text-sm text-gray-600">
            {averageRating.toFixed(1)} ({totalRatings} reviews)
          </span>
        </div>
      </div>

      {/* Current Rating Display */}
      {ratingData.userRating && (
        <div className="bg-white p-3 rounded border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">Your Rating:</span>
            {renderStars(ratingData.userRating.rating, false)}
          </div>
          {ratingData.userRating.review && (
            <p className="text-sm text-gray-600">{ratingData.userRating.review}</p>
          )}
        </div>
      )}

      {/* Rating Input */}
      <div className="space-y-3">
        <div>
          <Label className="text-sm">Your Rating</Label>
          <div className="flex items-center gap-2 mt-1">
            {renderStars(ratingData.rating, true)}
            <span className="text-sm text-gray-600 ml-2">
              {ratingData.rating > 0 ? `${ratingData.rating} star${ratingData.rating !== 1 ? 's' : ''}` : 'Click to rate'}
            </span>
          </div>
        </div>

        {showReviewForm && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="review" className="text-sm">
                Review (Optional)
              </Label>
              <Textarea
                id="review"
                placeholder="Share your thoughts about this product..."
                value={ratingData.review}
                onChange={(e) => setRatingData(prev => ({ ...prev, review: e.target.value }))}
                className="mt-1"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                {ratingData.review.length}/1000 characters
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSubmitRating}
                disabled={isSubmitting || ratingData.rating === 0}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowReviewForm(false)
                  setRatingData(prev => ({ ...prev, rating: prev.userRating?.rating || 0 }))
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!showReviewForm && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowReviewForm(true)}
            className="w-full"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {ratingData.userRating ? 'Update Rating' : 'Write a Review'}
          </Button>
        )}
      </div>
    </div>
  )
}
