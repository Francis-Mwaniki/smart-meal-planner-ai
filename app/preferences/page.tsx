/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Settings, Save, Loader2, CheckCircle } from "lucide-react"
import UserPreferencesForm from "@/components/UserPreferencesForm"
import ProtectedRoute from "@/components/protected-route"
import DashboardHeader from "@/components/DashboardHeader"

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface UserPreferences {
  id?: string
  userId: string
  dietType: string
  allergies: string[]
  budgetWeekly: number
  peopleCount: number
  maxCookingTime: number
  cuisineTypes: string[]
  healthGoals: string[]
}

export default function PreferencesPage() {
  const { data: session } = useSession()
  const [preferences, setPreferences] = useState<UserPreferences>({
    userId: "",
    dietType: "balanced",
    allergies: [],
    budgetWeekly: 100,
    peopleCount: 2,
    maxCookingTime: 30,
    cuisineTypes: ["general"],
    healthGoals: ["maintenance"]
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const dietTypeOptions = [
    { value: "balanced", label: "Balanced" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "keto", label: "Keto" },
    { value: "paleo", label: "Paleo" },
    { value: "mediterranean", label: "Mediterranean" },
    { value: "low-carb", label: "Low-Carb" },
    { value: "high-protein", label: "High-Protein" }
  ]

  const cuisineTypeOptions = [
    { value: "general", label: "General" },
    { value: "italian", label: "Italian" },
    { value: "mexican", label: "Mexican" },
    { value: "asian", label: "Asian" },
    { value: "american", label: "American" },
    { value: "mediterranean", label: "Mediterranean" },
    { value: "indian", label: "Indian" },
    { value: "french", label: "French" },
    { value: "thai", label: "Thai" },
    { value: "japanese", label: "Japanese" },
    { value: "chinese", label: "Chinese" },
    { value: "greek", label: "Greek" },
    { value: "spanish", label: "Spanish" }
  ]

  const healthGoalOptions = [
    { value: "weight_loss", label: "Weight Loss" },
    { value: "muscle_gain", label: "Muscle Gain" },
    { value: "maintenance", label: "Maintenance" },
    { value: "heart_health", label: "Heart Health" },
    { value: "diabetes_management", label: "Diabetes Management" },
    { value: "energy_boost", label: "Energy Boost" }
  ]

  useEffect(() => {
    if (session?.user?.id) {
      fetchPreferences(session.user.id)
    }
  }, [session])

  const fetchPreferences = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/preferences`)
      if (response.ok) {
        const data = await response.json()
        if (data.preferences) {
          setPreferences(data.preferences)
        }
      }
    } catch (error) {
      console.error("Error fetching preferences:", error)
    }
  }

  const savePreferences = async () => {
    if (!session?.user?.id) return

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/users/${session.user.id}/preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessage({ type: 'success', text: 'Preferences saved successfully!' })
          setPreferences(data.preferences)
        } else {
          setMessage({ type: 'error', text: data.message || 'Failed to save preferences' })
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to save preferences' })
      }
    } catch (error) {
      console.error("Error saving preferences:", error)
      setMessage({ type: 'error', text: 'An error occurred while saving preferences' })
    } finally {
      setSaving(false)
    }
  }

  const handleArrayChange = (field: keyof UserPreferences, value: string, checked: boolean) => {
    const currentArray = preferences[field] as string[]
    let newArray: string[]

    if (checked) {
      newArray = [...currentArray, value]
    } else {
      newArray = currentArray.filter(item => item !== value)
    }

    setPreferences(prev => ({
      ...prev,
      [field]: newArray
    }))
  }

  const addAllergy = (allergy: string) => {
    if (allergy.trim() && !preferences.allergies.includes(allergy.trim())) {
      setPreferences(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergy.trim()]
      }))
    }
  }

  const removeAllergy = (allergy: string) => {
    setPreferences(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }))
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <DashboardHeader 
          showBackButton={true}
          backHref="/dashboard"
          backLabel="Back to Dashboard"
          title="Meal Planning Preferences"
          subtitle="Set your dietary preferences to get personalized meal plans"
        />

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Dietary Preferences */}
            <Card>
                <CardHeader>
                  <CardTitle>Dietary Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Diet Type */}
                  <div className="space-y-3">
                    <Label htmlFor="diet-type">Diet Type</Label>
                    <Select value={preferences.dietType} onValueChange={(value) => setPreferences(prev => ({ ...prev, dietType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dietTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Allergies */}
                  <div className="space-y-3">
                    <Label>Food Allergies & Intolerances</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add allergy (e.g., peanuts, shellfish)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addAllergy((e.target as HTMLInputElement).value)
                            ;(e.target as HTMLInputElement).value = ''
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder*="allergy"]') as HTMLInputElement
                          if (input?.value) {
                            addAllergy(input.value)
                            input.value = ''
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    {preferences.allergies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {preferences.allergies.map((allergy) => (
                          <Badge key={allergy} variant="secondary" className="gap-1">
                            {allergy}
                            <button
                              onClick={() => removeAllergy(allergy)}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Health Goals */}
                  <div className="space-y-3">
                    <Label>Health Goals</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {healthGoalOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`health-${option.value}`}
                            checked={preferences.healthGoals.includes(option.value)}
                            onCheckedChange={(checked) => 
                              handleArrayChange('healthGoals', option.value, checked as boolean)
                            }
                          />
                          <Label htmlFor={`health-${option.value}`} className="text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

            {/* Cooking Preferences */}
            <Card>
                <CardHeader>
                  <CardTitle>Cooking Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Max Cooking Time */}
                    <div className="space-y-3">
                      <Label htmlFor="max-cooking-time">Max Cooking Time (minutes)</Label>
                      <Input
                        id="max-cooking-time"
                        type="number"
                        min="15"
                        max="120"
                        value={preferences.maxCookingTime}
                        onChange={(e) => setPreferences(prev => ({ ...prev, maxCookingTime: parseInt(e.target.value) || 30 }))}
                      />
                    </div>

                    {/* People Count */}
                    <div className="space-y-3">
                      <Label htmlFor="people-count">Number of People</Label>
                      <Input
                        id="people-count"
                        type="number"
                        min="1"
                        max="10"
                        value={preferences.peopleCount}
                        onChange={(e) => setPreferences(prev => ({ ...prev, peopleCount: parseInt(e.target.value) || 2 }))}
                      />
                    </div>

                    {/* Budget */}
                    <div className="space-y-3">
                      <Label htmlFor="budget-weekly">Weekly Budget ($)</Label>
                      <Input
                        id="budget-weekly"
                        type="number"
                        min="25"
                        max="500"
                        step="25"
                        value={preferences.budgetWeekly}
                        onChange={(e) => setPreferences(prev => ({ ...prev, budgetWeekly: parseFloat(e.target.value) || 100 }))}
                      />
                    </div>

                    {/* Cuisine Types */}
                    <div className="space-y-3">
                      <Label>Preferred Cuisines</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {cuisineTypeOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`cuisine-${option.value}`}
                              checked={preferences.cuisineTypes.includes(option.value)}
                              onCheckedChange={(checked) => 
                                handleArrayChange('cuisineTypes', option.value, checked as boolean)
                              }
                            />
                            <Label htmlFor={`cuisine-${option.value}`} className="text-sm">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button and Message */}
              <div className="space-y-4">
                {message && (
                  <div className={`p-4 rounded-md ${
                    message.type === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {message.text}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={savePreferences} disabled={saving} size="lg">
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
