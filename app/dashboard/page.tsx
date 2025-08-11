/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  ChefHat,
  ShoppingCart,
  Users,
  Star,
  Utensils,
  Loader2,
  Settings,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"
import DashboardHeader from "@/components/DashboardHeader"

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface MealPlan {
  id: string
  name: string
  startDate: string
  endDate: string
  totalCost: number
  totalCalories: number
  status: string
  items: Array<{
    id: string
    mealDate: string
    mealType: string
    servings: number
    recipe: {
      id: string
      name: string
      caloriesPerServing: number
      cost: number
    }
  }>
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchMealPlans(session.user.id)
    }
  }, [session])

  const fetchMealPlans = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/meal-plans`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setMealPlans(result.data)
        }
      }
    } catch (error) {
      console.error("Error fetching meal plans:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMealPlan = async () => {
    if (!session?.user?.id) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/meal-plans/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Refresh meal plans
          await fetchMealPlans(session.user.id)
        }
      }
    } catch (error) {
      console.error("Error generating meal plan:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Please sign in to continue</h2>
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentMealPlan = mealPlans.find((plan) => plan.status === "active")
  const todaysMeals =
    currentMealPlan?.items.filter((item) => {
      const itemDate = new Date(item.mealDate).toDateString()
      const today = new Date().toDateString()
      return itemDate === today
    }) || []

  const weeklyProgress = currentMealPlan
    ? Math.round(
        ((new Date().getTime() - new Date(currentMealPlan.startDate).getTime()) /
          (new Date(currentMealPlan.endDate).getTime() - new Date(currentMealPlan.startDate).getTime())) *
          100,
      )
    : 0

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <DashboardHeader 
          title={`Good morning, ${session?.user?.name}! 👋`}
          subtitle="Here's your meal planning overview for today"
        />

        {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 m-8 px-24">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Meals Planned</p>
                    <p className="text-2xl font-bold text-gray-900">{currentMealPlan?.items.length || 0}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">+3</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Weekly Budget</p>
                    <p className="text-2xl font-bold text-gray-900">${currentMealPlan?.totalCost?.toFixed(0) || 0}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">-$12</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Calories Today</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {todaysMeals.reduce((total, meal) => total + (meal.recipe.caloriesPerServing * meal.servings), 0)}
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">On Track</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Weekly Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{weeklyProgress}%</p>
                  </div>
                  <Progress value={weeklyProgress} className="w-16" />
                </div>
              </CardContent>
            </Card>
          </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Meals */}
              <Card id="todays-meals-card" className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                    Today's Meals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todaysMeals.length > 0 ? (
                    <div className="space-y-3">
                      {todaysMeals.map((meal) => (
                        <div
                          key={meal.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                              <Utensils className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{meal.recipe.name}</p>
                              <p className="text-sm text-gray-600 capitalize">{meal.mealType}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{meal.servings} serving{meal.servings > 1 ? 's' : ''}</p>
                            <p className="text-sm text-gray-500">{meal.recipe.caloriesPerServing} cal</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No meals planned for today</p>
                      <Button onClick={generateMealPlan} className="mt-4">
                        Generate Meal Plan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Calendar */}
              {currentMealPlan && (
                <Card id="weekly-plan-card" className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900">This Week's Plan</CardTitle>
                    <CardDescription>
                      {new Date(currentMealPlan.startDate).toLocaleDateString()} - {new Date(currentMealPlan.endDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => {
                        const dayMeals = currentMealPlan.items.filter((item) => {
                          const itemDate = new Date(item.mealDate)
                          return itemDate.getDay() === index
                        })
                        return (
                          <div key={day} className="text-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mx-auto mb-1 ${
                                dayMeals.length > 0
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <p className="text-xs text-gray-600">{day}</p>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={generateMealPlan}
                    disabled={isGenerating}
                    className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    id="generate-plan-btn"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ChefHat className="h-4 w-4 mr-2" />
                    )}
                    Generate New Plan
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                    asChild
                  >
                    <Link id="shopping-list-link" href="/shopping-lists">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Shopping List
                    </Link>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                    asChild
                  >
                    <Link id="preferences-link" href="/preferences">
                      <Settings className="h-4 w-4 mr-2" />
                      Preferences
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Favorites */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                    Recent Favorites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["Thai Green Curry", "Chicken Caesar Salad", "Vegetarian Pasta"].map((recipe, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Utensils className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-gray-700 text-sm">{recipe}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Tip */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 font-medium mb-2">AI Tip</h4>
                      <p className="text-gray-700 text-sm">
                        Try adding more protein to your breakfast for better energy throughout the day!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
