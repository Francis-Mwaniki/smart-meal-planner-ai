"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ChefHat, Calendar, ShoppingCart, Users, Brain, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function DemoPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [preferences, setPreferences] = useState({
    people: "2",
    budget: "50",
    dietType: "",
    allergies: [] as string[],
    cookingTime: "30",
  })

  const [generatedPlan, setGeneratedPlan] = useState<any>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)

    // Simulate AI generation
    setTimeout(() => {
      setGeneratedPlan({
        meals: [
          {
            day: "Monday",
            breakfast: "Greek Yogurt Parfait",
            lunch: "Mediterranean Quinoa Bowl",
            dinner: "Grilled Chicken with Roasted Vegetables",
          },
          {
            day: "Tuesday",
            breakfast: "Avocado Toast with Eggs",
            lunch: "Asian Lettuce Wraps",
            dinner: "Salmon with Sweet Potato",
          },
          {
            day: "Wednesday",
            breakfast: "Smoothie Bowl",
            lunch: "Caprese Salad with Chicken",
            dinner: "Vegetarian Stir Fry",
          },
        ],
        shoppingList: [
          "Greek yogurt",
          "Mixed berries",
          "Granola",
          "Quinoa",
          "Cherry tomatoes",
          "Cucumber",
          "Chicken breast",
          "Broccoli",
          "Bell peppers",
          "Avocado",
          "Eggs",
          "Whole grain bread",
        ],
        totalCost: "$47.50",
        calories: "1,850 avg/day",
      })
      setIsGenerating(false)
    }, 3000)
  }

  const allergyOptions = ["Nuts", "Dairy", "Gluten", "Shellfish", "Eggs", "Soy"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-purple-800/20 bg-slate-950/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SmartMeal AI</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-purple-200 hover:text-white hover:bg-purple-800/20">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30 px-4 py-2 mb-4">
            <Wand2 className="h-4 w-4 mr-2" />
            Interactive Demo
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Experience AI Meal Planning</h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Try our intelligent meal planning system with real AI recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Form */}
          <Card className="bg-slate-900/50 border-purple-800/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <ChefHat className="h-5 w-5 mr-2 text-purple-400" />
                Your Preferences
              </CardTitle>
              <CardDescription className="text-purple-300">
                Tell us about your dietary needs and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-purple-200 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Number of People
                  </Label>
                  <Select
                    value={preferences.people}
                    onValueChange={(value) => setPreferences({ ...preferences, people: value })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-purple-700/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Person</SelectItem>
                      <SelectItem value="2">2 People</SelectItem>
                      <SelectItem value="3">3 People</SelectItem>
                      <SelectItem value="4">4+ People</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-200 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Weekly Budget
                  </Label>
                  <Input
                    type="number"
                    value={preferences.budget}
                    onChange={(e) => setPreferences({ ...preferences, budget: e.target.value })}
                    className="bg-slate-800/50 border-purple-700/30 text-white placeholder:text-purple-400"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-purple-200">Diet Type</Label>
                <Select
                  value={preferences.dietType}
                  onValueChange={(value) => setPreferences({ ...preferences, dietType: value })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-purple-700/30 text-white">
                    <SelectValue placeholder="Select diet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                    <SelectItem value="paleo">Paleo</SelectItem>
                    <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-purple-200 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Max Cooking Time (minutes)
                </Label>
                <Input
                  type="number"
                  value={preferences.cookingTime}
                  onChange={(e) => setPreferences({ ...preferences, cookingTime: e.target.value })}
                  className="bg-slate-800/50 border-purple-700/30 text-white placeholder:text-purple-400"
                  placeholder="30"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-purple-200">Allergies & Restrictions</Label>
                <div className="grid grid-cols-2 gap-3">
                  {allergyOptions.map((allergy) => (
                    <div key={allergy} className="flex items-center space-x-2">
                      <Checkbox
                        id={allergy}
                        checked={preferences.allergies.includes(allergy)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences({
                              ...preferences,
                              allergies: [...preferences.allergies, allergy],
                            })
                          } else {
                            setPreferences({
                              ...preferences,
                              allergies: preferences.allergies.filter((a) => a !== allergy),
                            })
                          }
                        }}
                        className="border-purple-700/30 data-[state=checked]:bg-purple-600"
                      />
                      <Label htmlFor={allergy} className="text-purple-300 text-sm">
                        {allergy}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Your Plan...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Meal Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-slate-900/50 border-purple-800/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                Your AI-Generated Plan
              </CardTitle>
              <CardDescription className="text-purple-300">
                {generatedPlan ? "Here's your personalized meal plan" : "Click generate to see your meal plan"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
                  <p className="text-purple-300">AI is creating your perfect meal plan...</p>
                </div>
              ) : generatedPlan ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/30 rounded-lg p-4 text-center">
                      <p className="text-purple-300 text-sm">Total Cost</p>
                      <p className="text-white text-xl font-bold">{generatedPlan.totalCost}</p>
                    </div>
                    <div className="bg-slate-800/30 rounded-lg p-4 text-center">
                      <p className="text-purple-300 text-sm">Daily Calories</p>
                      <p className="text-white text-xl font-bold">{generatedPlan.calories}</p>
                    </div>
                  </div>

                  {/* Meals */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">3-Day Meal Plan</h4>
                    {generatedPlan.meals.map((day: any, index: number) => (
                      <div key={index} className="bg-slate-800/30 rounded-lg p-4">
                        <h5 className="text-purple-300 font-medium mb-3">{day.day}</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-purple-400">Breakfast:</span>
                            <span className="text-white">{day.breakfast}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-400">Lunch:</span>
                            <span className="text-white">{day.lunch}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-400">Dinner:</span>
                            <span className="text-white">{day.dinner}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shopping List Preview */}
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Shopping List Preview</h4>
                    <div className="bg-slate-800/30 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {generatedPlan.shoppingList.slice(0, 8).map((item: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                            <span className="text-purple-200">{item}</span>
                          </div>
                        ))}
                      </div>
                      {generatedPlan.shoppingList.length > 8 && (
                        <p className="text-purple-400 text-sm mt-3">
                          +{generatedPlan.shoppingList.length - 8} more items
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-purple-800/20">
                    <Link href="/auth/signup">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                        Sign Up to Save This Plan
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <ChefHat className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-purple-300">
                    Fill out your preferences and click generate to see your personalized meal plan
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
