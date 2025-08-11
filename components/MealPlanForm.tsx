"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Trash2, Save, X, ShoppingCart } from "lucide-react"
import { MealPlan, Recipe, MealPlanItem } from "@/types"
import { useSession } from "next-auth/react"

interface MealPlanFormProps {
  mealPlan?: MealPlan
  recipes?: Recipe[]
  onSubmit: (mealPlan: Partial<MealPlan>) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function MealPlanForm({
  mealPlan,
  recipes = [],
  onSubmit,
  onCancel,
  isLoading = false
}: MealPlanFormProps) {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    name: mealPlan?.name || "",
    startDate: mealPlan?.startDate ? new Date(mealPlan.startDate).toISOString().split('T')[0] : "",
    endDate: mealPlan?.endDate ? new Date(mealPlan.endDate).toISOString().split('T')[0] : "",
    aiPrompt: mealPlan?.aiPrompt || "",
    generateShoppingList: true
  })
  
  const [mealItems, setMealItems] = useState<Array<{
    id?: string
    recipeId: string
    mealDate: string
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    servings: number
    notes: string
    completed: boolean
  }>>(
    mealPlan?.items?.map(item => ({
      id: item.id,
      recipeId: item.recipeId,
      mealDate: new Date(item.mealDate).toISOString().split('T')[0],
      mealType: item.mealType,
      servings: item.servings,
      notes: item.notes || "",
      completed: item.completed
    })) || []
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Meal plan name is required"
    }
    
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required"
    }
    
    if (!formData.endDate) {
      newErrors.endDate = "End date is required"
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after start date"
    }
    
    if (mealItems.length === 0) {
      newErrors.mealItems = "At least one meal item is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const submitData = {
      ...formData,
      items: mealItems.map(item => ({
        ...item,
        mealDate: new Date(item.mealDate),
        servings: Number(item.servings)
      })),
      generateShoppingList: formData.generateShoppingList
    }

    onSubmit(submitData)
  }

  const addMealItem = () => {
    const newItem = {
      recipeId: "",
      mealDate: formData.startDate || new Date().toISOString().split('T')[0],
      mealType: 'breakfast' as const,
      servings: 1,
      notes: "",
      completed: false
    }
    setMealItems([...mealItems, newItem])
  }

  const removeMealItem = (index: number) => {
    setMealItems(mealItems.filter((_, i) => i !== index))
  }

  const updateMealItem = (index: number, field: string, value: any) => {
    const updatedItems = [...mealItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setMealItems(updatedItems)
  }

  const getDateRange = () => {
    if (!formData.startDate || !formData.endDate) return []
    
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const dates = []
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0])
    }
    
    return dates
  }

  const dateRange = getDateRange()

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>{mealPlan ? 'Edit Meal Plan' : 'Create New Meal Plan'}</span>
        </CardTitle>
        <CardDescription>
          Plan your meals for the week and automatically generate shopping lists
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Meal Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Weekly Family Meals"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="aiPrompt">AI Prompt (Optional)</Label>
              <Input
                id="aiPrompt"
                value={formData.aiPrompt}
                onChange={(e) => setFormData({ ...formData, aiPrompt: e.target.value })}
                placeholder="e.g., Focus on vegetarian meals under 500 calories"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={errors.startDate ? "border-red-500" : ""}
              />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={errors.endDate ? "border-red-500" : ""}
              />
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          {/* Meal Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Meal Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMealItem}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Meal</span>
              </Button>
            </div>

            {errors.mealItems && (
              <p className="text-sm text-red-500">{errors.mealItems}</p>
            )}

            {mealItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No meals added yet. Click "Add Meal" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mealItems.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      {/* Recipe Selection */}
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium">Recipe</Label>
                        <Select
                          value={item.recipeId}
                          onValueChange={(value) => updateMealItem(index, 'recipeId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a recipe" />
                          </SelectTrigger>
                          <SelectContent>
                            {recipes.map((recipe) => (
                              <SelectItem key={recipe.id} value={recipe.id}>
                                {recipe.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Date */}
                      <div>
                        <Label className="text-sm font-medium">Date</Label>
                        <Select
                          value={item.mealDate}
                          onValueChange={(value) => updateMealItem(index, 'mealDate', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {dateRange.map((date) => (
                              <SelectItem key={date} value={date}>
                                {new Date(date).toLocaleDateString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Meal Type */}
                      <div>
                        <Label className="text-sm font-medium">Meal</Label>
                        <Select
                          value={item.mealType}
                          onValueChange={(value: any) => updateMealItem(index, 'mealType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {mealTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                <span className="capitalize">{type}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Servings */}
                      <div>
                        <Label className="text-sm font-medium">Servings</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.servings}
                          onChange={(e) => updateMealItem(index, 'servings', parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMealItem(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-3">
                      <Label className="text-sm font-medium">Notes (Optional)</Label>
                      <Textarea
                        value={item.notes}
                        onChange={(e) => updateMealItem(index, 'notes', e.target.value)}
                        placeholder="Any special instructions or preferences..."
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="generateShoppingList"
              checked={formData.generateShoppingList}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, generateShoppingList: checked as boolean })
              }
            />
            <Label htmlFor="generateShoppingList" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Automatically generate shopping list</span>
            </Label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || mealItems.length === 0}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {mealPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
